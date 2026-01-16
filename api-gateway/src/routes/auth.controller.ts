import {
  Controller,
  All,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProxyService } from '../proxy';

@Controller('auth')
export class AuthController {
  constructor(private readonly proxyService: ProxyService) {}

  @All()
  async proxyAuthRoot(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handleProxy(req, res);
  }

  @All('*')
  async proxyAuth(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handleProxy(req, res);
  }

  private async handleProxy(req: Request, res: Response): Promise<void> {
    // Strip global prefix and controller path
    const fullPath = req.path;
    const subPath = fullPath.replace(/^\/api\/v1\/auth/, '').replace(/^\/auth/, '') || '';
    const path = '/auth' + subPath;
    
    const result = await this.proxyService.forward({
      service: 'auth',
      path,
      method: req.method,
      body: req.body,
      headers: req.headers as Record<string, string>,
      query: req.query as Record<string, string>,
    });

    // Set response headers
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }

    res.status(result.status).json(result.data);
  }
}
