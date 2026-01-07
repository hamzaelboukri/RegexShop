import { IsInt, Min, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReserveStockDto {
  @ApiProperty({ description: 'Quantity to reserve', example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Order ID for the reservation', example: 'order-123' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiPropertyOptional({ description: 'User ID making the reservation', example: 'user-456' })
  @IsOptional()
  @IsString()
  performedBy?: string;
}
