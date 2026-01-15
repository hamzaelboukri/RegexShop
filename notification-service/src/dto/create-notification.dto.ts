import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsEmail,
} from 'class-validator';

export enum NotificationTypeEnum {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',
  STOCK_LOW = 'STOCK_LOW',
  STOCK_CRITICAL = 'STOCK_CRITICAL',
  STOCK_REPLENISHED = 'STOCK_REPLENISHED',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM',
}

export enum ChannelTypeEnum {
  EMAIL = 'EMAIL',
  WEBSOCKET = 'WEBSOCKET',
  PUSH = 'PUSH',
}

export class CreateNotificationDto {
  @ApiPropertyOptional({ description: 'Target user ID (defaults to current user)' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Notification type', enum: NotificationTypeEnum })
  @IsEnum(NotificationTypeEnum)
  type: NotificationTypeEnum;

  @ApiProperty({ description: 'Notification title', example: 'Order Confirmed' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Notification message', example: 'Your order has been confirmed.' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: 'Additional data payload' })
  @IsOptional()
  data?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Channels to send notification through',
    enum: ChannelTypeEnum,
    isArray: true,
    default: ['WEBSOCKET'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ChannelTypeEnum, { each: true })
  channels?: ChannelTypeEnum[];

  @ApiPropertyOptional({ description: 'Email address for EMAIL channel' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
