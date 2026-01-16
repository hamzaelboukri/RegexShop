import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo(): {
    name: string;
    version: string;
    description: string;
    endpoints: Record<string, string>;
  } {
    return {
      name: 'YouShop API Gateway',
      version: '1.0.0',
      description: 'Central API Gateway for YouShop E-commerce Microservices',
      endpoints: {
        health: '/api/v1/health',
        servicesStatus: '/api/v1/health/services',
        auth: '/api/v1/auth/*',
        catalog: '/api/v1/catalog/*',
        products: '/api/v1/products/*',
        categories: '/api/v1/categories/*',
        inventory: '/api/v1/inventory/*',
        orders: '/api/v1/orders/*',
        payments: '/api/v1/payments/*',
        notifications: '/api/v1/notifications/*',
      },
    };
  }
}
