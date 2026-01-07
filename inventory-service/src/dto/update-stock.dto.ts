import { IsInt, Min, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStockDto {
  @ApiProperty({ description: 'Quantity to add or subtract from stock', example: 50 })
  @IsInt()
  quantity: number;

  @ApiPropertyOptional({ description: 'Reason for stock update', example: 'Received new shipment' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'User ID performing the action', example: 'user-123' })
  @IsOptional()
  @IsString()
  performedBy?: string;
}
