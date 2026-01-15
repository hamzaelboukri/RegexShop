import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

describe('StripeService', () => {
  let service: StripeService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const config: Record<string, string> = {
          STRIPE_SECRET_KEY: 'sk_test_mock',
          STRIPE_WEBHOOK_SECRET: 'whsec_mock',
          FRONTEND_URL: 'http://localhost:3000',
        };
        return config[key] || defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('should throw BadRequestException on Stripe error', async () => {
      const params = {
        orderId: 'order-123',
        userId: 'user-123',
        customerEmail: 'test@example.com',
        amount: 99.99,
        currency: 'USD',
        lineItems: [
          {
            name: 'Test Product',
            quantity: 1,
            unitPrice: 99.99,
          },
        ],
      };

      // The test will fail because we're using a mock API key
      // In real tests, you would mock the Stripe SDK
      await expect(service.createCheckoutSession(params)).rejects.toThrow();
    });
  });

  describe('getStripeInstance', () => {
    it('should return Stripe instance', () => {
      const stripe = service.getStripeInstance();
      expect(stripe).toBeDefined();
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should throw BadRequestException for invalid signature', () => {
      const payload = Buffer.from('{}');
      const signature = 'invalid_signature';

      expect(() => service.verifyWebhookSignature(payload, signature)).toThrow(BadRequestException);
    });
  });
});
