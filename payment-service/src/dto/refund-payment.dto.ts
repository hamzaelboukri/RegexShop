import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class RefundPaymentDto {
  @ApiPropertyOptional({ description: 'Refund amount (full refund if not specified)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Reason for refund',
    example: 'requested_by_customer',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
