import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; service: string; version: string } {
    return {
      message: 'Notification Service is running',
      service: 'notification-service',
      version: '1.0.0',
    };
  }
}
