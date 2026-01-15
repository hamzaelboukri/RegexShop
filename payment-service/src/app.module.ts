import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentModule } from './payment/payment.module';
import { WebhookModule } from './webhook/webhook.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: true,
    }),
    PrismaModule,
    AuthModule,
    PaymentModule,
    WebhookModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
