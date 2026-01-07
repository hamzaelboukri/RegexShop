import { IsInt, Min, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReleaseStockDto {
  @ApiProperty({ description: 'Quantity to release back to available', example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Order ID for the release', example: 'order-123' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiPropertyOptional({ description: 'Reason for release', example: 'Order cancelled' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'User ID performing the action', example: 'user-456' })
  @IsOptional()
  @IsString()
  performedBy?: string;
}
