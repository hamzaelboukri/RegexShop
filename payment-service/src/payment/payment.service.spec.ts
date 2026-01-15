import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';

describe('PaymentService', () => {
  let service: PaymentService;
  let prismaService: jest.Mocked<PrismaService>;
  let stripeService: jest.Mocked<StripeService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockPayment = {
    id: 'payment-123',
    orderId: 'order-123',
    userId: 'user-123',
    stripeSessionId: 'cs_test_123',
    stripePaymentIntentId: null,
    amount: { toNumber: () => 99.99 },
    currency: 'USD',
    status: PaymentStatus.PENDING,
    idempotencyKey: 'idem-123',
    metadata: null,
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    processedAt: null,
    transactions: [],
  };

  beforeEach(async () => {
    const mockPrismaService = {
      payment: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      paymentTransaction: {
        findUnique: jest.fn(),
      },
    };

    const mockStripeService = {
      createCheckoutSession: jest.fn(),
      getCheckoutSession: jest.fn(),
      createRefund: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StripeService, useValue: mockStripeService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prismaService = module.get(PrismaService);
    stripeService = module.get(StripeService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    const createPaymentDto = {
      orderId: 'order-123',
      customerEmail: 'test@example.com',
      amount: 99.99,
      currency: 'USD',
      idempotencyKey: 'new-idem-123',
      items: [
        {
          productId: 'prod-1',
          productName: 'Test Product',
          quantity: 1,
          unitPrice: 99.99,
        },
      ],
    };

    it('should create a new payment', async () => {
      (prismaService.payment.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.payment.findFirst as jest.Mock).mockResolvedValue(null);
      (stripeService.createCheckoutSession as jest.Mock).mockResolvedValue({
        sessionId: 'cs_test_new',
        url: 'https://checkout.stripe.com/test',
      });
      (prismaService.payment.create as jest.Mock).mockResolvedValue({
        ...mockPayment,
        stripeSessionId: 'cs_test_new',
        idempotencyKey: 'new-idem-123',
      });

      const result = await service.createPayment('user-123', createPaymentDto);

      expect(result).toBeDefined();
      expect(result.stripeSessionId).toBe('cs_test_new');
      expect(eventEmitter.emit).toHaveBeenCalledWith('payment.created', expect.any(Object));
    });

    it('should throw ConflictException for duplicate idempotency key', async () => {
      (prismaService.payment.findUnique as jest.Mock).mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.SUCCEEDED,
      });

      await expect(service.createPayment('user-123', createPaymentDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if order has active payment', async () => {
      (prismaService.payment.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.payment.findFirst as jest.Mock).mockResolvedValue(mockPayment);

      await expect(service.createPayment('user-123', createPaymentDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getPaymentById', () => {
    it('should return payment by ID', async () => {
      (prismaService.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);

      const result = await service.getPaymentById('payment-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('payment-123');
    });

    it('should throw NotFoundException if payment not found', async () => {
      (prismaService.payment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getPaymentById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPaymentByOrderId', () => {
    it('should return payment by order ID', async () => {
      (prismaService.payment.findFirst as jest.Mock).mockResolvedValue(mockPayment);

      const result = await service.getPaymentByOrderId('order-123');

      expect(result).toBeDefined();
      expect(result.orderId).toBe('order-123');
    });

    it('should throw NotFoundException if no payment for order', async () => {
      (prismaService.payment.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.getPaymentByOrderId('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('processSuccessfulPayment', () => {
    it('should update payment status to SUCCEEDED', async () => {
      (prismaService.paymentTransaction.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);
      (prismaService.payment.update as jest.Mock).mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.SUCCEEDED,
      });

      await service.processSuccessfulPayment('cs_test_123', 'pi_test_123', 'evt_123');

      expect(prismaService.payment.update).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('payment.succeeded', expect.any(Object));
    });

    it('should not process already processed events', async () => {
      (prismaService.paymentTransaction.findUnique as jest.Mock).mockResolvedValue({
        id: 'tx-123',
        stripeEventId: 'evt_123',
      });

      await service.processSuccessfulPayment('cs_test_123', 'pi_test_123', 'evt_123');

      expect(prismaService.payment.update).not.toHaveBeenCalled();
    });
  });

  describe('generateIdempotencyKey', () => {
    it('should generate a unique UUID', () => {
      const key1 = service.generateIdempotencyKey();
      const key2 = service.generateIdempotencyKey();

      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
      expect(key1).not.toBe(key2);
      expect(key1).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });
  });
});
