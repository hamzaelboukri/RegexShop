import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationTypeEnum, ChannelTypeEnum } from './create-notification.dto';

export class ChannelDeliveryDto {
  @ApiProperty({ description: 'Channel type', enum: ChannelTypeEnum })
  channel: ChannelTypeEnum;

  @ApiProperty({ description: 'Delivery status' })
  status: string;

  @ApiPropertyOptional({ description: 'Sent timestamp' })
  sentAt?: Date;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  errorMessage?: string;
}

export class NotificationResponseDto {
  @ApiProperty({ description: 'Notification ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Notification type', enum: NotificationTypeEnum })
  type: string;

  @ApiProperty({ description: 'Notification title' })
  title: string;

  @ApiProperty({ description: 'Notification message' })
  message: string;

  @ApiPropertyOptional({ description: 'Additional data payload' })
  data?: Record<string, unknown>;

  @ApiProperty({ description: 'Overall notification status' })
  status: string;

  @ApiProperty({ description: 'Whether the notification has been read' })
  isRead: boolean;

  @ApiPropertyOptional({ description: 'Read timestamp' })
  readAt?: Date;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Sent timestamp' })
  sentAt?: Date;

  @ApiPropertyOptional({ description: 'Channel delivery statuses', type: [ChannelDeliveryDto] })
  channels?: ChannelDeliveryDto[];
}
