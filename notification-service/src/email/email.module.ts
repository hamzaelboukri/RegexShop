import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { TemplateService } from './template.service';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, TemplateService],
  exports: [EmailService, TemplateService],
})
export class EmailModule {}
