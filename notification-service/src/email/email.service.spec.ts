import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TemplateService } from './template.service';

describe('EmailService', () => {
  let service: EmailService;
  let configService: jest.Mocked<ConfigService>;
  let prismaService: jest.Mocked<PrismaService>;
  let templateService: jest.Mocked<TemplateService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const config: Record<string, string> = {
          SMTP_HOST: 'smtp.test.com',
          SMTP_PORT: '587',
          SMTP_USER: 'test@test.com',
          SMTP_PASS: 'password',
          SMTP_FROM_EMAIL: 'noreply@test.com',
          SMTP_FROM_NAME: 'Test',
        };
        return config[key] || defaultValue;
      }),
    };

    const mockPrismaService = {
      emailLog: {
        create: jest.fn().mockResolvedValue({ id: 'log-1', retryCount: 0 }),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    const mockTemplateService = {
      render: jest.fn().mockReturnValue('<html>Test</html>'),
      renderPlainText: jest.fn().mockReturnValue('Test'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TemplateService, useValue: mockTemplateService },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get(ConfigService);
    prismaService = module.get(PrismaService);
    templateService = module.get(TemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should create email log entry', async () => {
      // Note: The actual sending will fail because we don't have a real SMTP server
      // But we can verify the log entry is created
      try {
        await service.sendEmail({
          to: 'recipient@test.com',
          subject: 'Test Subject',
          html: '<p>Test</p>',
        });
      } catch {
        // Expected to fail due to SMTP connection
      }

      expect(prismaService.emailLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            to: 'recipient@test.com',
            subject: 'Test Subject',
          }),
        }),
      );
    });

    it('should use template service when template is provided', async () => {
      try {
        await service.sendEmail({
          to: 'recipient@test.com',
          subject: 'Test Subject',
          template: 'order-confirmation',
          templateData: { orderNumber: '123' },
        });
      } catch {
        // Expected to fail
      }

      expect(templateService.render).toHaveBeenCalledWith(
        'order-confirmation',
        expect.objectContaining({ orderNumber: '123' }),
      );
    });
  });
});
