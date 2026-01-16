import {
  Controller,
  All,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProxyService } from '../proxy';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly proxyService: ProxyService) {}

  @All()
  async proxyCatalogRoot(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handleProxy(req, res);
  }

  @All('*')
  async proxyCatalog(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handleProxy(req, res);
  }

  private async handleProxy(req: Request, res: Response): Promise<void> {
    // Strip global prefix and controller path, forward to catalog's /api
    const fullPath = req.path;
    const subPath = fullPath.replace(/^\/api\/v1\/catalog/, '').replace(/^\/catalog/, '') || '';
    const path = '/api' + subPath;
    
    const result = await this.proxyService.forward({
      service: 'catalog',
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

@Controller('products')
export class ProductsController {
  constructor(private readonly proxyService: ProxyService) {}

  @All()
  async proxyProductsRoot(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handleProxy(req, res);
  }

  @All('*')
  async proxyProducts(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handleProxy(req, res);
  }

  private async handleProxy(req: Request, res: Response): Promise<void> {
    // Strip global prefix and controller path, forward to catalog's /api/products
    const fullPath = req.path;
    const subPath = fullPath.replace(/^\/api\/v1\/products/, '').replace(/^\/products/, '') || '';
    const path = '/api/products' + subPath;
    
    const result = await this.proxyService.forward({
      service: 'catalog',
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

@Controller('categories')
export class CategoriesController {
  constructor(private readonly proxyService: ProxyService) {}

  @All()
  async proxyCategoriesRoot(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handleProxy(req, res);
  }

  @All('*')
  async proxyCategories(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handleProxy(req, res);
  }

  private async handleProxy(req: Request, res: Response): Promise<void> {
    // Strip global prefix and controller path, forward to catalog's /api/categories
    const fullPath = req.path;
    const subPath = fullPath.replace(/^\/api\/v1\/categories/, '').replace(/^\/categories/, '') || '';
    const path = '/api/categories' + subPath;
    
    const result = await this.proxyService.forward({
      service: 'catalog',
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
