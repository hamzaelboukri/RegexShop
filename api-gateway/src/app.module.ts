import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyModule } from './proxy';
import { RoutesModule } from './routes';
import { HealthModule } from './health';

@Module({
  imports: [ProxyModule, RoutesModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
