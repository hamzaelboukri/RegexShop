import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; service: string; version: string } {
    return {
      message: 'Payment Service is running',
      service: 'payment-service',
      version: '1.0.0',
    };
  }
}
