import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, TransactionType, TransactionStatus } from '@prisma/client';

export class PaymentTransactionDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'Transaction type', enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ description: 'Transaction status', enum: TransactionStatus })
  status: TransactionStatus;

  @ApiProperty({ description: 'Transaction amount' })
  amount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiPropertyOptional({ description: 'Stripe event ID' })
  stripeEventId?: string;

  @ApiPropertyOptional({ description: 'Stripe event type' })
  stripeEventType?: string;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;
}

export class PaymentResponseDto {
  @ApiProperty({ description: 'Payment ID' })
  id: string;

  @ApiProperty({ description: 'Order ID' })
  orderId: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiPropertyOptional({ description: 'Stripe checkout session ID' })
  stripeSessionId?: string;

  @ApiPropertyOptional({ description: 'Stripe payment intent ID' })
  stripePaymentIntentId?: string;

  @ApiProperty({ description: 'Payment amount' })
  amount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ description: 'Idempotency key' })
  idempotencyKey: string;

  @ApiPropertyOptional({ description: 'Stripe checkout URL' })
  checkoutUrl?: string;

  @ApiPropertyOptional({ description: 'Error message if payment failed' })
  errorMessage?: string;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Processing completed timestamp' })
  processedAt?: Date;

  @ApiPropertyOptional({ description: 'Payment transactions', type: [PaymentTransactionDto] })
  transactions?: PaymentTransactionDto[];
}

export class IdempotencyKeyResponseDto {
  @ApiProperty({ description: 'Generated idempotency key' })
  idempotencyKey: string;
}
