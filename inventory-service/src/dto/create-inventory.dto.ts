import { IsString, IsInt, IsNotEmpty, Min, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryDto {
  @ApiProperty({ description: 'Stock Keeping Unit - unique identifier for the product variant', example: 'TSHIRT-RED-M' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ description: 'Reference to product in catalog-service', example: 'c4f3d5e6-7890-1234-5678-90abcdef1234' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Product name for display', example: 'Red T-Shirt Medium' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Total physical stock quantity', example: 100, default: 0 })
  @IsInt()
  @Min(0)
  total: number;

  @ApiPropertyOptional({ description: 'Alert threshold for low stock', example: 10, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;
}
