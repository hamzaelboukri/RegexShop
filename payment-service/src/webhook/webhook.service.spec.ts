import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { StripeService } from '../payment/stripe.service';
import { PaymentService } from '../payment/payment.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException } from '@nestjs/common';

describe('WebhookService', () => {
  let service: WebhookService;
  let stripeService: jest.Mocked<StripeService>;
  let paymentService: jest.Mocked<PaymentService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const mockStripeService = {
      verifyWebhookSignature: jest.fn(),
      getStripeInstance: jest.fn(),
    };

    const mockPaymentService = {
      processSuccessfulPayment: jest.fn(),
      processFailedPayment: jest.fn(),
      processExpiredSession: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: StripeService, useValue: mockStripeService },
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
    stripeService = module.get(StripeService);
    paymentService = module.get(PaymentService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleStripeEvent', () => {
    it('should throw BadRequestException for invalid signature', async () => {
      (stripeService.verifyWebhookSignature as jest.Mock).mockImplementation(() => {
        throw new BadRequestException('Invalid signature');
      });

      await expect(
        service.handleStripeEvent(Buffer.from('{}'), 'invalid_sig'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should process checkout.session.completed event', async () => {
      const mockEvent = {
        id: 'evt_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_intent: 'pi_test_123',
            metadata: {},
          },
        },
      };

      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(mockEvent);

      await service.handleStripeEvent(Buffer.from('{}'), 'valid_sig');

      expect(paymentService.processSuccessfulPayment).toHaveBeenCalledWith(
        'cs_test_123',
        'pi_test_123',
        'evt_123',
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'webhook.checkout.completed',
        expect.any(Object),
      );
    });

    it('should process checkout.session.expired event', async () => {
      const mockEvent = {
        id: 'evt_123',
        type: 'checkout.session.expired',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: {},
          },
        },
      };

      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(mockEvent);

      await service.handleStripeEvent(Buffer.from('{}'), 'valid_sig');

      expect(paymentService.processExpiredSession).toHaveBeenCalledWith('cs_test_123', 'evt_123');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'webhook.checkout.expired',
        expect.any(Object),
      );
    });

    it('should ignore unhandled event types', async () => {
      const mockEvent = {
        id: 'evt_123',
        type: 'customer.created',
        data: { object: {} },
      };

      (stripeService.verifyWebhookSignature as jest.Mock).mockReturnValue(mockEvent);

      await service.handleStripeEvent(Buffer.from('{}'), 'valid_sig');

      expect(paymentService.processSuccessfulPayment).not.toHaveBeenCalled();
      expect(paymentService.processFailedPayment).not.toHaveBeenCalled();
    });
  });
});
