import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { StripeService } from './stripe.service';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController],
  providers: [PaymentService, StripeService],
  exports: [PaymentService, StripeService],
})
export class PaymentModule {}
