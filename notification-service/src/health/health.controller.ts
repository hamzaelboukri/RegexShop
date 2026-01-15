import { Controller, Get, Inject, forwardRef } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketService } from '../websocket/websocket.service';

interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  service: string;
  database: 'connected' | 'disconnected';
  websocket: {
    connectedUsers: number;
    totalConnections: number;
  };
  uptime: number;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketService: WebsocketService,
  ) {}

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

    const stats = this.websocketService.getConnectionStats();

    return {
      status: dbStatus === 'connected' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      service: 'notification-service',
      database: dbStatus,
      websocket: {
        connectedUsers: stats.totalUsers,
        totalConnections: stats.totalConnections,
      },
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

  @Get('websocket')
  @Public()
  @ApiOperation({ summary: 'WebSocket connection stats' })
  @ApiResponse({ status: 200, description: 'WebSocket statistics' })
  getWebSocketStats(): {
    totalUsers: number;
    totalConnections: number;
    users: Array<{ userId: string; connections: number; connectedAt: Date }>;
  } {
    return this.websocketService.getConnectionStats();
  }
}
