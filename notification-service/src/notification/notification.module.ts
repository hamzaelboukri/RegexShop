import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { WebsocketModule } from '../websocket/websocket.module';
import { EmailModule } from '../email/email.module';
import { NotificationEventHandler } from './notification.event-handler';

@Module({
  imports: [WebsocketModule, EmailModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationEventHandler],
  exports: [NotificationService],
})
export class NotificationModule {}
