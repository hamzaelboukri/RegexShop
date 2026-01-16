import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway, NotificationPayload } from '../websocket/websocket.gateway';
import { EmailService } from '../email/email.service';
import {
  NotificationType,
  NotificationStatus,
  ChannelType,
  DeliveryStatus,
  Prisma,
} from '@prisma/client';
import {
  CreateNotificationDto,
  NotificationResponseDto,
  UpdatePreferencesDto,
  PreferencesResponseDto,
  ChannelTypeEnum,
} from '../dto';

export interface SendNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels?: ChannelType[];
  email?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketGateway: WebsocketGateway,
    private readonly emailService: EmailService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Send a notification to a user via multiple channels
   */
  async sendNotification(options: SendNotificationOptions): Promise<NotificationResponseDto> {
    const { userId, type, title, message, data, channels = [ChannelType.WEBSOCKET], email } = options;

    this.logger.log(`Sending ${type} notification to user ${userId}`);

    // Get user preferences
    const preferences = await this.getOrCreatePreferences(userId);
    
    // Filter channels based on preferences
    const enabledChannels = channels.filter((channel) => {
      if (channel === ChannelType.WEBSOCKET && !preferences.websocketEnabled) return false;
      if (channel === ChannelType.EMAIL && !preferences.emailEnabled) return false;
      return true;
    });

    // Create notification record
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data as Prisma.InputJsonValue,
        status: NotificationStatus.PENDING,
        channels: {
          create: enabledChannels.map((channel) => ({
            channel,
            status: DeliveryStatus.PENDING,
            recipient: channel === ChannelType.EMAIL ? (email || preferences.email) : undefined,
          })),
        },
      },
      include: {
        channels: true,
      },
    });

    // Send through each channel
    const results = await Promise.allSettled(
      enabledChannels.map((channel) => this.sendViaChannel(notification.id, channel, {
        type,
        title,
        message,
        data,
        userId,
        email: email || preferences.email || undefined,
      })),
    );

    // Update notification status
    const allSucceeded = results.every((r) => r.status === 'fulfilled' && r.value);
    const anySucceeded = results.some((r) => r.status === 'fulfilled' && r.value);

    let status: NotificationStatus = NotificationStatus.FAILED;
    if (allSucceeded) {
      status = NotificationStatus.SENT;
    } else if (anySucceeded) {
      status = NotificationStatus.PARTIALLY_SENT;
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        status,
        sentAt: anySucceeded ? new Date() : undefined,
      },
      include: {
        channels: true,
      },
    });

    this.logger.log(`Notification ${notification.id} sent with status: ${status}`);

    return this.mapToResponseDto(updatedNotification);
  }

  /**
   * Send notification via a specific channel
   */
  private async sendViaChannel(
    notificationId: string,
    channel: ChannelType,
    payload: {
      type: NotificationType;
      title: string;
      message: string;
      data?: Record<string, unknown>;
      userId: string;
      email?: string;
    },
  ): Promise<boolean> {
    const channelRecord = await this.prisma.notificationChannel.findFirst({
      where: { notificationId, channel },
    });

    if (!channelRecord) return false;

    try {
      switch (channel) {
        case ChannelType.WEBSOCKET:
          await this.sendViaWebSocket(payload);
          break;

        case ChannelType.EMAIL:
          if (payload.email) {
            await this.sendViaEmail(payload.email, payload);
          } else {
            throw new Error('Email address not provided');
          }
          break;

        default:
          this.logger.warn(`Unsupported channel: ${channel}`);
          return false;
      }

      // Update channel status
      await this.prisma.notificationChannel.update({
        where: { id: channelRecord.id },
        data: {
          status: DeliveryStatus.SENT,
          sentAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to send via ${channel}: ${(error as Error).message}`);

      await this.prisma.notificationChannel.update({
        where: { id: channelRecord.id },
        data: {
          status: DeliveryStatus.FAILED,
          failedAt: new Date(),
          errorMessage: (error as Error).message,
          retryCount: { increment: 1 },
        },
      });

      return false;
    }
  }

  /**
   * Send notification via WebSocket
   */
  private async sendViaWebSocket(payload: {
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    userId: string;
  }): Promise<void> {
    const wsPayload: NotificationPayload = {
      type: payload.type,
      title: payload.title,
      message: payload.message,
      data: payload.data,
      timestamp: new Date().toISOString(),
    };

    this.websocketGateway.sendToUser(payload.userId, wsPayload);
  }

  /**
   * Send notification via Email
   */
  private async sendViaEmail(
    email: string,
    payload: {
      type: NotificationType;
      title: string;
      message: string;
      data?: Record<string, unknown>;
    },
  ): Promise<void> {
    await this.emailService.sendEmail({
      to: email,
      subject: payload.title,
      html: `
        <h2>${payload.title}</h2>
        <p>${payload.message}</p>
        ${payload.data ? `<pre>${JSON.stringify(payload.data, null, 2)}</pre>` : ''}
      `,
      text: `${payload.title}\n\n${payload.message}`,
    });
  }

  /**
   * Send admin alert (stock alerts, system alerts)
   */
  async sendAdminAlert(
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    const wsPayload: NotificationPayload = {
      type,
      title,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    if (type === NotificationType.STOCK_LOW || 
        type === NotificationType.STOCK_CRITICAL ||
        type === NotificationType.STOCK_REPLENISHED) {
      this.websocketGateway.sendStockAlert(wsPayload);
    } else {
      this.websocketGateway.sendAdminAlert(wsPayload);
    }

    this.logger.log(`Admin alert sent: ${type}`);
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ): Promise<{ notifications: NotificationResponseDto[]; total: number; unreadCount: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: { channels: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications: notifications.map((n: any) => this.mapToResponseDto(n)),
      total,
      unreadCount,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
      include: { channels: true },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
      include: { channels: true },
    });

    return this.mapToResponseDto(updated);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return result.count;
  }

  /**
   * Get or create user preferences
   */
  async getOrCreatePreferences(userId: string): Promise<PreferencesResponseDto> {
    let preferences = await this.prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await this.prisma.userPreference.create({
        data: { userId },
      });
    }

    return {
      userId: preferences.userId,
      emailEnabled: preferences.emailEnabled,
      websocketEnabled: preferences.websocketEnabled,
      orderUpdates: preferences.orderUpdates,
      paymentAlerts: preferences.paymentAlerts,
      stockAlerts: preferences.stockAlerts,
      promotions: preferences.promotions,
      email: preferences.email,
    };
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<PreferencesResponseDto> {
    const preferences = await this.prisma.userPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...dto,
      },
      update: dto,
    });

    return {
      userId: preferences.userId,
      emailEnabled: preferences.emailEnabled,
      websocketEnabled: preferences.websocketEnabled,
      orderUpdates: preferences.orderUpdates,
      paymentAlerts: preferences.paymentAlerts,
      stockAlerts: preferences.stockAlerts,
      promotions: preferences.promotions,
      email: preferences.email,
    };
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Map notification entity to response DTO
   */
  private mapToResponseDto(notification: NotificationWithChannels): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data as Record<string, unknown> | undefined,
      status: notification.status,
      isRead: notification.isRead,
      readAt: notification.readAt || undefined,
      createdAt: notification.createdAt,
      sentAt: notification.sentAt || undefined,
      channels: notification.channels?.map((c: any) => ({
        channel: c.channel as unknown as ChannelTypeEnum,
        status: c.status,
        sentAt: c.sentAt || undefined,
        errorMessage: c.errorMessage || undefined,
      })),
    };
  }
}

type NotificationWithChannels = Awaited<ReturnType<PrismaService['notification']['findUnique']>> & {
  channels?: Array<{
    id: string;
    channel: ChannelType;
    status: DeliveryStatus;
    sentAt: Date | null;
    errorMessage: string | null;
  }>;
};
