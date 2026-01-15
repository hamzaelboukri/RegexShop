import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { EmailService } from '../email/email.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { NotificationType, NotificationStatus, ChannelType, DeliveryStatus } from '../../generated/prisma';

describe('NotificationService', () => {
  let service: NotificationService;
  let prismaService: jest.Mocked<PrismaService>;
  let websocketGateway: jest.Mocked<WebsocketGateway>;
  let emailService: jest.Mocked<EmailService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockNotification = {
    id: 'notif-123',
    userId: 'user-123',
    type: NotificationType.ORDER_CREATED,
    title: 'Test Notification',
    message: 'Test message',
    data: null,
    status: NotificationStatus.SENT,
    isRead: false,
    readAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    sentAt: new Date(),
    channels: [],
  };

  const mockPreferences = {
    id: 'pref-123',
    userId: 'user-123',
    emailEnabled: true,
    websocketEnabled: true,
    orderUpdates: true,
    paymentAlerts: true,
    stockAlerts: true,
    promotions: false,
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      notification: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      notificationChannel: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      userPreference: {
        findUnique: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const mockWebsocketGateway = {
      sendToUser: jest.fn(),
      sendToRole: jest.fn(),
      sendAdminAlert: jest.fn(),
      sendStockAlert: jest.fn(),
    };

    const mockEmailService = {
      sendEmail: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: WebsocketGateway, useValue: mockWebsocketGateway },
        { provide: EmailService, useValue: mockEmailService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prismaService = module.get(PrismaService);
    websocketGateway = module.get(WebsocketGateway);
    emailService = module.get(EmailService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should create and send notification via WebSocket', async () => {
      (prismaService.userPreference.findUnique as jest.Mock).mockResolvedValue(mockPreferences);
      (prismaService.notification.create as jest.Mock).mockResolvedValue({
        ...mockNotification,
        channels: [{ id: 'ch-1', channel: ChannelType.WEBSOCKET, status: DeliveryStatus.PENDING }],
      });
      (prismaService.notificationChannel.findFirst as jest.Mock).mockResolvedValue({
        id: 'ch-1',
        channel: ChannelType.WEBSOCKET,
      });
      (prismaService.notificationChannel.update as jest.Mock).mockResolvedValue({});
      (prismaService.notification.update as jest.Mock).mockResolvedValue({
        ...mockNotification,
        channels: [{ id: 'ch-1', channel: ChannelType.WEBSOCKET, status: DeliveryStatus.SENT }],
      });

      const result = await service.sendNotification({
        userId: 'user-123',
        type: NotificationType.ORDER_CREATED,
        title: 'Test',
        message: 'Test message',
        channels: [ChannelType.WEBSOCKET],
      });

      expect(result).toBeDefined();
      expect(websocketGateway.sendToUser).toHaveBeenCalled();
    });
  });

  describe('getUserNotifications', () => {
    it('should return paginated notifications', async () => {
      (prismaService.notification.findMany as jest.Mock).mockResolvedValue([mockNotification]);
      (prismaService.notification.count as jest.Mock)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(0);

      const result = await service.getUserNotifications('user-123', 1, 10, false);

      expect(result.notifications).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.unreadCount).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      (prismaService.notification.findFirst as jest.Mock).mockResolvedValue(mockNotification);
      (prismaService.notification.update as jest.Mock).mockResolvedValue({
        ...mockNotification,
        isRead: true,
        readAt: new Date(),
      });

      const result = await service.markAsRead('notif-123', 'user-123');

      expect(result.isRead).toBe(true);
    });

    it('should throw NotFoundException if notification not found', async () => {
      (prismaService.notification.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.markAsRead('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      (prismaService.notification.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead('user-123');

      expect(result).toBe(5);
    });
  });

  describe('getOrCreatePreferences', () => {
    it('should return existing preferences', async () => {
      (prismaService.userPreference.findUnique as jest.Mock).mockResolvedValue(mockPreferences);

      const result = await service.getOrCreatePreferences('user-123');

      expect(result.userId).toBe('user-123');
      expect(result.emailEnabled).toBe(true);
    });

    it('should create preferences if not exists', async () => {
      (prismaService.userPreference.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.userPreference.create as jest.Mock).mockResolvedValue(mockPreferences);

      const result = await service.getOrCreatePreferences('user-123');

      expect(prismaService.userPreference.create).toHaveBeenCalled();
      expect(result.userId).toBe('user-123');
    });
  });

  describe('sendAdminAlert', () => {
    it('should send stock alert to admins', async () => {
      await service.sendAdminAlert(
        NotificationType.STOCK_LOW,
        'Low Stock',
        'Product is running low',
        { productId: 'prod-1' },
      );

      expect(websocketGateway.sendStockAlert).toHaveBeenCalled();
    });

    it('should send admin alert for non-stock notifications', async () => {
      await service.sendAdminAlert(
        NotificationType.SYSTEM,
        'System Alert',
        'System notification',
      );

      expect(websocketGateway.sendAdminAlert).toHaveBeenCalled();
    });
  });
});
