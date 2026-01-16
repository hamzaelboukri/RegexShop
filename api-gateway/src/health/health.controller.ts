import { Controller, Get } from '@nestjs/common';
import { ProxyService } from '../proxy';

@Controller('health')
export class HealthController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get()
  getHealth(): {
    status: string;
    timestamp: string;
    service: string;
  } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
    };
  }

  @Get('services')
  async getServicesHealth(): Promise<{
    status: string;
    timestamp: string;
    services: Array<{
      name: string;
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    }>;
  }> {
    const services = await this.proxyService.checkAllServicesHealth();
    const allHealthy = services.every((s) => s.status === 'healthy');

    return {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
    };
  }
}
