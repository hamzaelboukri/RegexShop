import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  service: string;
  database: 'connected' | 'disconnected';
  uptime: number;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check(): Promise<HealthCheckResult> {
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      status: dbStatus === 'connected' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      service: 'payment-service',
      database: dbStatus,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  async ready(): Promise<{ ready: boolean }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ready: true };
    } catch {
      return { ready: false };
    }
  }

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  live(): { alive: boolean } {
    return { alive: true };
  }
}
