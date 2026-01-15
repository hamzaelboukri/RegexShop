import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUrl,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentItemDto {
  @ApiProperty({ description: 'Product ID', example: 'prod_123' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Product name', example: 'Wireless Keyboard' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Quantity', example: 2 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'Unit price in dollars', example: 49.99 })
  @IsNumber()
  @IsPositive()
  unitPrice: number;
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'Order ID to process payment for', example: 'order_abc123' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'Customer email for receipt', example: 'customer@example.com' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ description: 'Total payment amount', example: 99.99 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Unique idempotency key to prevent duplicate payments',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsUUID()
  idempotencyKey: string;

  @ApiProperty({ description: 'Payment items', type: [PaymentItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  items: PaymentItemDto[];

  @ApiPropertyOptional({ description: 'Success redirect URL' })
  @IsOptional()
  @IsUrl()
  successUrl?: string;

  @ApiPropertyOptional({ description: 'Cancel redirect URL' })
  @IsOptional()
  @IsUrl()
  cancelUrl?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, string>;
}
