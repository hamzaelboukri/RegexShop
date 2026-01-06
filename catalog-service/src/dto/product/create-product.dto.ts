import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsArray,
  IsUUID,
  MinLength,
  MaxLength,
  Min,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'The latest iPhone with advanced features',
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    description: 'Stock Keeping Unit - unique identifier for the product',
    example: 'IPHONE-15-PRO-256-BLK',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  sku: string;

  @ApiProperty({
    description: 'Product price in decimal format',
    example: 999.99,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    description: 'Original price for sale items',
    example: 1199.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  comparePrice?: number;

  @ApiPropertyOptional({
    description: 'Array of product image URLs',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({
    description: 'Whether the product is active and visible',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the product is featured',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({
    description: 'Category ID for the product',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Array of tags for the product',
    example: ['smartphone', 'apple', 'premium'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional product metadata as JSON',
    example: { color: 'Black', storage: '256GB', warranty: '1 year' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
