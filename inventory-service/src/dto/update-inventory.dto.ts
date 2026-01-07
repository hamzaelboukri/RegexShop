import { IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInventoryDto {
  @ApiPropertyOptional({ description: 'Product name', example: 'Blue T-Shirt Large' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Low stock alert threshold', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;
}
