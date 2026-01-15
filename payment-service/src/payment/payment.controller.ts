import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { CreatePaymentDto, PaymentResponseDto, RefundPaymentDto, IdempotencyKeyResponseDto } from '../dto';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment with Stripe checkout session' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict - duplicate idempotency key or active payment exists' })
  async createPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.createPayment(user.id, dto);
  }

  @Get('idempotency-key')
  @ApiOperation({ summary: 'Generate a unique idempotency key for payment creation' })
  @ApiResponse({
    status: 200,
    description: 'Idempotency key generated',
    type: IdempotencyKeyResponseDto,
  })
  generateIdempotencyKey(): IdempotencyKeyResponseDto {
    return {
      idempotencyKey: this.paymentService.generateIdempotencyKey(),
    };
  }

  @Get('my-payments')
  @ApiOperation({ summary: 'Get current user payments' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of user payments',
  })
  async getMyPayments(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ payments: PaymentResponseDto[]; total: number; page: number; limit: number }> {
    return this.paymentService.getUserPayments(user.id, page || 1, limit || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment details',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentById(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentService.getPaymentById(id);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payment by order ID' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment details for the order',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentByOrderId(@Param('orderId') orderId: string): Promise<PaymentResponseDto> {
    return this.paymentService.getPaymentByOrderId(orderId);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a refund for a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Refund processed successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - cannot refund this payment' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async createRefund(
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.createRefund(id, dto);
  }
}
