import {
  Controller,
  All,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProxyService } from '../proxy';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly proxyService: ProxyService) {}

  @All()
  async proxyNotificationsRoot(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handleProxy(req, res);
  }

  @All('*')
  async proxyNotifications(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handleProxy(req, res);
  }

  private async handleProxy(req: Request, res: Response): Promise<void> {
    // Strip global prefix and controller path, keep everything after /notifications
    const fullPath = req.path;
    const subPath = fullPath.replace(/^\/api\/v1\/notifications/, '').replace(/^\/notifications/, '') || '';
    const path = '/notifications' + subPath;
    
    const result = await this.proxyService.forward({
      service: 'notifications',
      path,
      method: req.method,
      body: req.body,
      headers: req.headers as Record<string, string>,
      query: req.query as Record<string, string>,
    });

    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }

    res.status(result.status).json(result.data);
  }
}
