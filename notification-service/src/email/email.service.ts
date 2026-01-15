import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { TemplateService } from './template.service';
import { EmailStatus } from '../../generated/prisma';

export interface SendEmailOptions {
  to: string;
  subject: string;
  template?: string;
  templateData?: Record<string, unknown>;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly templateService: TemplateService,
  ) {
    this.fromEmail = this.configService.get('SMTP_FROM_EMAIL', 'noreply@regexshop.com');
    this.fromName = this.configService.get('SMTP_FROM_NAME', 'Regex Shop');
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const host = this.configService.get('SMTP_HOST', 'smtp.gmail.com');
    const port = this.configService.get('SMTP_PORT', 587);
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');

    if (!user || !pass) {
      this.logger.warn('SMTP credentials not configured. Email functionality will be limited.');
      // Create a test transporter for development
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass',
        },
      });
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    this.logger.log(`Email transporter configured with host: ${host}`);
  }

  /**
   * Send an email
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailResult> {
    const { to, subject, template, templateData, html, text, attachments } = options;

    // Create email log entry
    const emailLog = await this.prisma.emailLog.create({
      data: {
        to,
        from: `${this.fromName} <${this.fromEmail}>`,
        subject,
        templateName: template,
        status: EmailStatus.PENDING,
      },
    });

    try {
      // Render template if provided
      let htmlContent = html;
      let textContent = text;

      if (template && templateData) {
        htmlContent = this.templateService.render(template, templateData);
        // Generate plain text version
        textContent = this.templateService.renderPlainText(template, templateData);
      }

      const mailOptions: nodemailer.SendMailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to,
        subject,
        html: htmlContent,
        text: textContent,
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Update email log with success
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.SENT,
          messageId: info.messageId,
          sentAt: new Date(),
        },
      });

      this.logger.log(`Email sent successfully to ${to} (MessageId: ${info.messageId})`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      const errorMessage = (error as Error).message;

      // Update email log with failure
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.FAILED,
          errorMessage,
          retryCount: emailLog.retryCount + 1,
        },
      });

      this.logger.error(`Failed to send email to ${to}: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    to: string,
    orderData: {
      orderNumber: string;
      customerName: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      subtotal: number;
      tax: number;
      shipping: number;
      total: number;
      shippingAddress?: string;
    },
  ): Promise<EmailResult> {
    return this.sendEmail({
      to,
      subject: `Order Confirmation - #${orderData.orderNumber}`,
      template: 'order-confirmation',
      templateData: {
        ...orderData,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Send payment success email
   */
  async sendPaymentSuccess(
    to: string,
    paymentData: {
      orderNumber: string;
      customerName: string;
      amount: number;
      currency: string;
      paymentMethod?: string;
      transactionId?: string;
    },
  ): Promise<EmailResult> {
    return this.sendEmail({
      to,
      subject: `Payment Received - Order #${paymentData.orderNumber}`,
      template: 'payment-success',
      templateData: {
        ...paymentData,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Send payment failed email
   */
  async sendPaymentFailed(
    to: string,
    paymentData: {
      orderNumber: string;
      customerName: string;
      amount: number;
      currency: string;
      errorMessage?: string;
      retryUrl?: string;
    },
  ): Promise<EmailResult> {
    return this.sendEmail({
      to,
      subject: `Payment Failed - Order #${paymentData.orderNumber}`,
      template: 'payment-failed',
      templateData: {
        ...paymentData,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Send stock alert email to admin
   */
  async sendStockAlert(
    to: string,
    stockData: {
      productName: string;
      sku: string;
      currentStock: number;
      threshold: number;
      alertType: 'low' | 'critical' | 'out_of_stock';
    },
  ): Promise<EmailResult> {
    const subjectMap = {
      low: `Low Stock Alert: ${stockData.productName}`,
      critical: `CRITICAL: Stock Alert for ${stockData.productName}`,
      out_of_stock: `OUT OF STOCK: ${stockData.productName}`,
    };

    return this.sendEmail({
      to,
      subject: subjectMap[stockData.alertType],
      template: 'stock-alert',
      templateData: {
        ...stockData,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified');
      return true;
    } catch (error) {
      this.logger.error(`SMTP verification failed: ${(error as Error).message}`);
      return false;
    }
  }
}
