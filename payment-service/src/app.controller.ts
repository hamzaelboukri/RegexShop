import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get service info' })
  @ApiResponse({ status: 200, description: 'Returns service information' })
  getHello(): { message: string; service: string; version: string } {
    return this.appService.getHello();
  }
}
