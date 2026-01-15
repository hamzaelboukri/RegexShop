import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService, CreateCheckoutSessionParams, CheckoutSessionResult } from './stripe.service';
import { CreatePaymentDto, PaymentResponseDto, RefundPaymentDto } from '../dto';
import { PaymentStatus, TransactionType, TransactionStatus, Prisma } from '../../generated/prisma';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new payment and Stripe checkout session
   */
  async createPayment(userId: string, dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    this.logger.log(`Creating payment for order: ${dto.orderId}`);

    // Check for existing payment with same idempotency key
    const existingPayment = await this.prisma.payment.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });

    if (existingPayment) {
      this.logger.warn(`Payment already exists with idempotency key: ${dto.idempotencyKey}`);
      
      if (existingPayment.status === PaymentStatus.PENDING && existingPayment.stripeSessionId) {
        // Return existing session if still pending
        const session = await this.stripeService.getCheckoutSession(existingPayment.stripeSessionId);
        return this.mapToResponseDto(existingPayment, session.url || undefined);
      }
      
      throw new ConflictException('Payment already processed for this idempotency key');
    }

    // Check if order already has an active payment
    const existingOrderPayment = await this.prisma.payment.findFirst({
      where: {
        orderId: dto.orderId,
        status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.SUCCEEDED] },
      },
    });

    if (existingOrderPayment) {
      throw new ConflictException('Order already has an active payment');
    }

    // Create Stripe checkout session
    const checkoutParams: CreateCheckoutSessionParams = {
      orderId: dto.orderId,
      userId,
      customerEmail: dto.customerEmail,
      amount: dto.amount,
      currency: dto.currency || 'USD',
      lineItems: dto.items.map((item) => ({
        name: item.productName,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      metadata: dto.metadata,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
    };

    let checkoutSession: CheckoutSessionResult;
    
    try {
      checkoutSession = await this.stripeService.createCheckoutSession(checkoutParams);
    } catch (error) {
      this.logger.error(`Failed to create checkout session: ${(error as Error).message}`);
      throw new BadRequestException('Failed to create payment session');
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        userId,
        stripeSessionId: checkoutSession.sessionId,
        amount: new Prisma.Decimal(dto.amount),
        currency: dto.currency || 'USD',
        status: PaymentStatus.PENDING,
        idempotencyKey: dto.idempotencyKey,
        metadata: dto.metadata,
        transactions: {
          create: {
            type: TransactionType.CHECKOUT_SESSION_CREATED,
            status: TransactionStatus.SUCCESS,
            amount: new Prisma.Decimal(dto.amount),
            currency: dto.currency || 'USD',
            rawPayload: { sessionId: checkoutSession.sessionId },
          },
        },
      },
      include: {
        transactions: true,
      },
    });

    this.logger.log(`Payment created: ${payment.id} with session: ${checkoutSession.sessionId}`);

    // Emit event for other services
    this.eventEmitter.emit('payment.created', {
      paymentId: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      amount: payment.amount,
      sessionId: checkoutSession.sessionId,
    });

    return this.mapToResponseDto(payment, checkoutSession.url);
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { transactions: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.mapToResponseDto(payment);
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      include: { transactions: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this order');
    }

    return this.mapToResponseDto(payment);
  }

  /**
   * Get payments for a user
   */
  async getUserPayments(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ payments: PaymentResponseDto[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        include: { transactions: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where: { userId } }),
    ]);

    return {
      payments: payments.map((p) => this.mapToResponseDto(p)),
      total,
      page,
      limit,
    };
  }

  /**
   * Process successful payment (called from webhook)
   */
  async processSuccessfulPayment(
    stripeSessionId: string,
    paymentIntentId: string,
    eventId: string,
  ): Promise<void> {
    this.logger.log(`Processing successful payment for session: ${stripeSessionId}`);

    // Check if event already processed (idempotency)
    const existingTransaction = await this.prisma.paymentTransaction.findUnique({
      where: { stripeEventId: eventId },
    });

    if (existingTransaction) {
      this.logger.warn(`Event already processed: ${eventId}`);
      return;
    }

    const payment = await this.prisma.payment.findUnique({
      where: { stripeSessionId },
    });

    if (!payment) {
      this.logger.error(`Payment not found for session: ${stripeSessionId}`);
      throw new NotFoundException('Payment not found');
    }

    // Update payment status
    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        stripePaymentIntentId: paymentIntentId,
        processedAt: new Date(),
        transactions: {
          create: {
            type: TransactionType.CHECKOUT_SESSION_COMPLETED,
            status: TransactionStatus.SUCCESS,
            amount: payment.amount,
            currency: payment.currency,
            stripeEventId: eventId,
            stripeEventType: 'checkout.session.completed',
          },
        },
      },
    });

    this.logger.log(`Payment succeeded: ${payment.id}`);

    // Emit event for other services (Order update, Notification)
    this.eventEmitter.emit('payment.succeeded', {
      paymentId: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      amount: Number(payment.amount),
      paymentIntentId,
    });
  }

  /**
   * Process failed payment (called from webhook)
   */
  async processFailedPayment(
    stripeSessionId: string,
    eventId: string,
    errorMessage?: string,
  ): Promise<void> {
    this.logger.log(`Processing failed payment for session: ${stripeSessionId}`);

    // Check if event already processed
    const existingTransaction = await this.prisma.paymentTransaction.findUnique({
      where: { stripeEventId: eventId },
    });

    if (existingTransaction) {
      this.logger.warn(`Event already processed: ${eventId}`);
      return;
    }

    const payment = await this.prisma.payment.findUnique({
      where: { stripeSessionId },
    });

    if (!payment) {
      this.logger.error(`Payment not found for session: ${stripeSessionId}`);
      throw new NotFoundException('Payment not found');
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        errorMessage,
        transactions: {
          create: {
            type: TransactionType.PAYMENT_INTENT_FAILED,
            status: TransactionStatus.FAILED,
            amount: payment.amount,
            currency: payment.currency,
            stripeEventId: eventId,
            stripeEventType: 'payment_intent.payment_failed',
            errorDetails: errorMessage,
          },
        },
      },
    });

    this.logger.log(`Payment failed: ${payment.id}`);

    // Emit event
    this.eventEmitter.emit('payment.failed', {
      paymentId: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      errorMessage,
    });
  }

  /**
   * Process expired session (called from webhook)
   */
  async processExpiredSession(stripeSessionId: string, eventId: string): Promise<void> {
    this.logger.log(`Processing expired session: ${stripeSessionId}`);

    const existingTransaction = await this.prisma.paymentTransaction.findUnique({
      where: { stripeEventId: eventId },
    });

    if (existingTransaction) {
      this.logger.warn(`Event already processed: ${eventId}`);
      return;
    }

    const payment = await this.prisma.payment.findUnique({
      where: { stripeSessionId },
    });

    if (!payment) {
      this.logger.error(`Payment not found for session: ${stripeSessionId}`);
      return;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.CANCELLED,
        transactions: {
          create: {
            type: TransactionType.CHECKOUT_SESSION_EXPIRED,
            status: TransactionStatus.FAILED,
            amount: payment.amount,
            currency: payment.currency,
            stripeEventId: eventId,
            stripeEventType: 'checkout.session.expired',
          },
        },
      },
    });

    this.logger.log(`Session expired: ${payment.id}`);

    this.eventEmitter.emit('payment.expired', {
      paymentId: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
    });
  }

  /**
   * Create a refund
   */
  async createRefund(paymentId: string, dto: RefundPaymentDto): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Can only refund successful payments');
    }

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestException('Payment intent not found');
    }

    // Process refund through Stripe
    const refund = await this.stripeService.createRefund(
      payment.stripePaymentIntentId,
      dto.amount,
      dto.reason,
    );

    // Update payment status
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
        transactions: {
          create: {
            type: TransactionType.REFUND_CREATED,
            status: TransactionStatus.SUCCESS,
            amount: new Prisma.Decimal(dto.amount || Number(payment.amount)),
            currency: payment.currency,
            stripeEventId: refund.id,
            rawPayload: { refundId: refund.id, reason: dto.reason },
          },
        },
      },
      include: { transactions: true },
    });

    this.logger.log(`Refund created for payment: ${paymentId}`);

    this.eventEmitter.emit('payment.refunded', {
      paymentId: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      refundAmount: dto.amount || Number(payment.amount),
      refundId: refund.id,
    });

    return this.mapToResponseDto(updatedPayment);
  }

  /**
   * Generate a unique idempotency key
   */
  generateIdempotencyKey(): string {
    return randomUUID();
  }

  /**
   * Map payment entity to response DTO
   */
  private mapToResponseDto(payment: PaymentWithTransactions, checkoutUrl?: string): PaymentResponseDto {
    return {
      id: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      stripeSessionId: payment.stripeSessionId || undefined,
      stripePaymentIntentId: payment.stripePaymentIntentId || undefined,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      idempotencyKey: payment.idempotencyKey,
      checkoutUrl,
      errorMessage: payment.errorMessage || undefined,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      processedAt: payment.processedAt || undefined,
      transactions: payment.transactions?.map((t) => ({
        id: t.id,
        type: t.type,
        status: t.status,
        amount: Number(t.amount),
        currency: t.currency,
        stripeEventId: t.stripeEventId || undefined,
        stripeEventType: t.stripeEventType || undefined,
        createdAt: t.createdAt,
      })),
    };
  }
}

// Type for payment with transactions
type PaymentWithTransactions = Awaited<
  ReturnType<PrismaService['payment']['findUnique']>
> & {
  transactions?: Array<{
    id: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: Prisma.Decimal;
    currency: string;
    stripeEventId: string | null;
    stripeEventType: string | null;
    createdAt: Date;
  }>;
};
