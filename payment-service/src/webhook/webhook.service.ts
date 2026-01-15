import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StripeService } from '../payment/stripe.service';
import { PaymentService } from '../payment/payment.service';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  // Stripe events we handle
  private readonly HANDLED_EVENTS = [
    'checkout.session.completed',
    'checkout.session.expired',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'charge.refunded',
  ];

  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentService: PaymentService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Handle incoming Stripe webhook event
   */
  async handleStripeEvent(payload: Buffer, signature: string): Promise<void> {
    // Verify webhook signature
    let event: Stripe.Event;
    
    try {
      event = this.stripeService.verifyWebhookSignature(payload, signature);
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${(error as Error).message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Received Stripe event: ${event.type} (${event.id})`);

    // Check if we handle this event type
    if (!this.HANDLED_EVENTS.includes(event.type)) {
      this.logger.log(`Ignoring unhandled event type: ${event.type}`);
      return;
    }

    // Process based on event type
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event);
          break;

        case 'checkout.session.expired':
          await this.handleCheckoutSessionExpired(event);
          break;

        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event);
          break;

        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing event ${event.type}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Handle checkout.session.completed event
   */
  private async handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    
    this.logger.log(`Checkout session completed: ${session.id}`);

    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;

    if (!paymentIntentId) {
      this.logger.warn(`No payment intent found for session: ${session.id}`);
      return;
    }

    await this.paymentService.processSuccessfulPayment(
      session.id,
      paymentIntentId,
      event.id,
    );

    // Emit webhook event for external listeners
    this.eventEmitter.emit('webhook.checkout.completed', {
      eventId: event.id,
      sessionId: session.id,
      paymentIntentId,
      metadata: session.metadata,
    });
  }

  /**
   * Handle checkout.session.expired event
   */
  private async handleCheckoutSessionExpired(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    
    this.logger.log(`Checkout session expired: ${session.id}`);

    await this.paymentService.processExpiredSession(session.id, event.id);

    this.eventEmitter.emit('webhook.checkout.expired', {
      eventId: event.id,
      sessionId: session.id,
      metadata: session.metadata,
    });
  }

  /**
   * Handle payment_intent.succeeded event
   */
  private async handlePaymentIntentSucceeded(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    this.logger.log(`Payment intent succeeded: ${paymentIntent.id}`);

    // This is mainly for logging - the main processing happens in checkout.session.completed
    this.eventEmitter.emit('webhook.payment_intent.succeeded', {
      eventId: event.id,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    });
  }

  /**
   * Handle payment_intent.payment_failed event
   */
  private async handlePaymentIntentFailed(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    this.logger.log(`Payment intent failed: ${paymentIntent.id}`);

    const errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed';

    // Try to find the session associated with this payment intent
    // and mark the payment as failed
    const stripe = this.stripeService.getStripeInstance();
    
    try {
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
        limit: 1,
      });

      if (sessions.data.length > 0) {
        await this.paymentService.processFailedPayment(
          sessions.data[0].id,
          event.id,
          errorMessage,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to find session for payment intent: ${(error as Error).message}`);
    }

    this.eventEmitter.emit('webhook.payment_intent.failed', {
      eventId: event.id,
      paymentIntentId: paymentIntent.id,
      errorMessage,
    });
  }

  /**
   * Handle charge.refunded event
   */
  private async handleChargeRefunded(event: Stripe.Event): Promise<void> {
    const charge = event.data.object as Stripe.Charge;
    
    this.logger.log(`Charge refunded: ${charge.id}`);

    this.eventEmitter.emit('webhook.charge.refunded', {
      eventId: event.id,
      chargeId: charge.id,
      refundedAmount: charge.amount_refunded / 100,
      currency: charge.currency,
    });
  }
}
