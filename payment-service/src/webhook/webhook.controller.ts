import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post('stripe')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature for verification',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature or payload' })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    if (!signature) {
      this.logger.error('Missing stripe-signature header');
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      this.logger.error('Missing raw body');
      throw new BadRequestException('Missing request body');
    }

    try {
      await this.webhookService.handleStripeEvent(rawBody, signature);
      return { received: true };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${(error as Error).message}`);
      throw error;
    }
  }

  @Post('stripe/test')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test endpoint to simulate webhook (development only)' })
  @ApiResponse({ status: 200, description: 'Test webhook received' })
  @ApiExcludeEndpoint()
  async testWebhook(): Promise<{ message: string }> {
    this.logger.log('Test webhook endpoint called');
    return { message: 'Test webhook endpoint is working' };
  }
}
