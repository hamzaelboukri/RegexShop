import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreateCheckoutSessionParams {
  orderId: string;
  userId: string;
  customerEmail: string;
  amount: number;
  currency: string;
  lineItems: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
  }>;
  metadata?: Record<string, string>;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface PaymentIntentResult {
  paymentIntentId: string;
  status: string;
  amount: number;
  currency: string;
}

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured - Stripe functionality will be limited');
    }

    this.stripe = new Stripe(secretKey || 'sk_test_placeholder', {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }

  /**
   * Create a Stripe Checkout Session for secure payment processing
   */
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResult> {
    const {
      orderId,
      userId,
      customerEmail,
      lineItems,
      currency,
      metadata = {},
      successUrl,
      cancelUrl,
    } = params;

    try {
      this.logger.log(`Creating checkout session for order: ${orderId}`);

      const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lineItems.map((item) => ({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: item.name,
            description: item.description,
          },
          unit_amount: Math.round(item.unitPrice * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: customerEmail,
        line_items: stripeLineItems,
        metadata: {
          orderId,
          userId,
          ...metadata,
        },
        success_url: successUrl || `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/payment/cancel`,
        expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes expiration
      });

      this.logger.log(`Checkout session created: ${session.id}`);

      return {
        sessionId: session.id,
        url: session.url || '',
      };
    } catch (error) {
      this.logger.error(`Failed to create checkout session: ${(error as Error).message}`, (error as Error).stack);
      
      if (error instanceof Stripe.errors.StripeError) {
        throw new BadRequestException(`Stripe error: ${error.message}`);
      }
      
      throw new InternalServerErrorException('Failed to create payment session');
    }
  }

  /**
   * Retrieve a checkout session by ID
   */
  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent', 'line_items'],
      });
    } catch (error) {
      this.logger.error(`Failed to retrieve checkout session: ${(error as Error).message}`);
      throw new BadRequestException('Invalid session ID');
    }
  }

  /**
   * Retrieve a payment intent by ID
   */
  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve payment intent: ${(error as Error).message}`);
      throw new BadRequestException('Invalid payment intent ID');
    }
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(paymentIntentId: string, amount?: number, reason?: string): Promise<Stripe.Refund> {
    try {
      this.logger.log(`Creating refund for payment intent: ${paymentIntentId}`);

      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
        reason: (reason as Stripe.RefundCreateParams.Reason) || 'requested_by_customer',
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await this.stripe.refunds.create(refundParams);
      
      this.logger.log(`Refund created: ${refund.id}`);
      
      return refund;
    } catch (error) {
      this.logger.error(`Failed to create refund: ${(error as Error).message}`);
      throw new BadRequestException('Failed to process refund');
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${(error as Error).message}`);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  /**
   * Get Stripe instance for advanced operations
   */
  getStripeInstance(): Stripe {
    return this.stripe;
  }
}
