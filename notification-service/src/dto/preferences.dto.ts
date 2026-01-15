import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional } from 'class-validator';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ description: 'Enable email notifications' })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable WebSocket (real-time) notifications' })
  @IsOptional()
  @IsBoolean()
  websocketEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Receive order status updates' })
  @IsOptional()
  @IsBoolean()
  orderUpdates?: boolean;

  @ApiPropertyOptional({ description: 'Receive payment alerts' })
  @IsOptional()
  @IsBoolean()
  paymentAlerts?: boolean;

  @ApiPropertyOptional({ description: 'Receive stock alerts (admin only)' })
  @IsOptional()
  @IsBoolean()
  stockAlerts?: boolean;

  @ApiPropertyOptional({ description: 'Receive promotional notifications' })
  @IsOptional()
  @IsBoolean()
  promotions?: boolean;

  @ApiPropertyOptional({ description: 'Email address for notifications' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class PreferencesResponseDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Email notifications enabled' })
  emailEnabled: boolean;

  @ApiProperty({ description: 'WebSocket notifications enabled' })
  websocketEnabled: boolean;

  @ApiProperty({ description: 'Order updates enabled' })
  orderUpdates: boolean;

  @ApiProperty({ description: 'Payment alerts enabled' })
  paymentAlerts: boolean;

  @ApiProperty({ description: 'Stock alerts enabled' })
  stockAlerts: boolean;

  @ApiProperty({ description: 'Promotions enabled' })
  promotions: boolean;

  @ApiPropertyOptional({ description: 'Email address' })
  email?: string | null;
}
