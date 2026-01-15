import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import { EmailService } from '../email/email.service';
import { NotificationType, ChannelType } from '@prisma/client';

/**
 * Event handler for internal events that trigger notifications
 * This allows other services to emit events that result in notifications
 */
@Injectable()
export class NotificationEventHandler {
  private readonly logger = new Logger(NotificationEventHandler.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Handle payment succeeded event
   */
  @OnEvent('payment.succeeded')
  async handlePaymentSucceeded(payload: {
    paymentId: string;
    orderId: string;
    userId: string;
    amount: number;
    paymentIntentId?: string;
    customerEmail?: string;
    customerName?: string;
    orderNumber?: string;
  }): Promise<void> {
    this.logger.log(`Handling payment.succeeded event for order ${payload.orderId}`);

    // Send notification via all channels
    await this.notificationService.sendNotification({
      userId: payload.userId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Payment Received',
      message: `Your payment of $${payload.amount} has been successfully processed.`,
      data: {
        orderId: payload.orderId,
        paymentId: payload.paymentId,
        amount: payload.amount,
      },
      channels: [ChannelType.WEBSOCKET, ChannelType.EMAIL],
      email: payload.customerEmail,
    });

    // Send detailed email receipt
    if (payload.customerEmail) {
      await this.emailService.sendPaymentSuccess(payload.customerEmail, {
        orderNumber: payload.orderNumber || payload.orderId,
        customerName: payload.customerName || 'Valued Customer',
        amount: payload.amount,
        currency: 'USD',
        transactionId: payload.paymentIntentId,
      });
    }
  }

  /**
   * Handle payment failed event
   */
  @OnEvent('payment.failed')
  async handlePaymentFailed(payload: {
    paymentId: string;
    orderId: string;
    userId: string;
    errorMessage?: string;
    customerEmail?: string;
    customerName?: string;
    orderNumber?: string;
    retryUrl?: string;
  }): Promise<void> {
    this.logger.log(`Handling payment.failed event for order ${payload.orderId}`);

    await this.notificationService.sendNotification({
      userId: payload.userId,
      type: NotificationType.PAYMENT_FAILED,
      title: 'Payment Failed',
      message: payload.errorMessage || 'Your payment could not be processed. Please try again.',
      data: {
        orderId: payload.orderId,
        paymentId: payload.paymentId,
        errorMessage: payload.errorMessage,
      },
      channels: [ChannelType.WEBSOCKET, ChannelType.EMAIL],
      email: payload.customerEmail,
    });

    if (payload.customerEmail) {
      await this.emailService.sendPaymentFailed(payload.customerEmail, {
        orderNumber: payload.orderNumber || payload.orderId,
        customerName: payload.customerName || 'Valued Customer',
        amount: 0,
        currency: 'USD',
        errorMessage: payload.errorMessage,
        retryUrl: payload.retryUrl,
      });
    }
  }

  /**
   * Handle order created event
   */
  @OnEvent('order.created')
  async handleOrderCreated(payload: {
    orderId: string;
    orderNumber: string;
    userId: string;
    total: number;
    customerEmail?: string;
    customerName?: string;
    items?: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<void> {
    this.logger.log(`Handling order.created event for order ${payload.orderNumber}`);

    await this.notificationService.sendNotification({
      userId: payload.userId,
      type: NotificationType.ORDER_CREATED,
      title: 'Order Confirmed',
      message: `Your order #${payload.orderNumber} has been received and is being processed.`,
      data: {
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        total: payload.total,
      },
      channels: [ChannelType.WEBSOCKET, ChannelType.EMAIL],
      email: payload.customerEmail,
    });

    if (payload.customerEmail && payload.items) {
      await this.emailService.sendOrderConfirmation(payload.customerEmail, {
        orderNumber: payload.orderNumber,
        customerName: payload.customerName || 'Valued Customer',
        items: payload.items,
        subtotal: payload.total * 0.9,
        tax: payload.total * 0.1,
        shipping: 0,
        total: payload.total,
      });
    }
  }

  /**
   * Handle order status change event
   */
  @OnEvent('order.status.changed')
  async handleOrderStatusChanged(payload: {
    orderId: string;
    orderNumber: string;
    userId: string;
    previousStatus: string;
    newStatus: string;
    customerEmail?: string;
  }): Promise<void> {
    this.logger.log(`Handling order.status.changed event for order ${payload.orderNumber}`);

    const statusMessages: Record<string, { type: NotificationType; title: string; message: string }> = {
      CONFIRMED: {
        type: NotificationType.ORDER_CONFIRMED,
        title: 'Order Confirmed',
        message: `Your order #${payload.orderNumber} has been confirmed.`,
      },
      SHIPPED: {
        type: NotificationType.ORDER_SHIPPED,
        title: 'Order Shipped',
        message: `Your order #${payload.orderNumber} has been shipped!`,
      },
      DELIVERED: {
        type: NotificationType.ORDER_DELIVERED,
        title: 'Order Delivered',
        message: `Your order #${payload.orderNumber} has been delivered. Enjoy!`,
      },
      CANCELLED: {
        type: NotificationType.ORDER_CANCELLED,
        title: 'Order Cancelled',
        message: `Your order #${payload.orderNumber} has been cancelled.`,
      },
    };

    const statusInfo = statusMessages[payload.newStatus];
    if (statusInfo) {
      await this.notificationService.sendNotification({
        userId: payload.userId,
        type: statusInfo.type,
        title: statusInfo.title,
        message: statusInfo.message,
        data: {
          orderId: payload.orderId,
          orderNumber: payload.orderNumber,
          previousStatus: payload.previousStatus,
          newStatus: payload.newStatus,
        },
        channels: [ChannelType.WEBSOCKET, ChannelType.EMAIL],
        email: payload.customerEmail,
      });
    }
  }

  /**
   * Handle stock alert event
   */
  @OnEvent('stock.alert')
  async handleStockAlert(payload: {
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    threshold: number;
    alertType: 'low' | 'critical' | 'out_of_stock';
    adminEmails?: string[];
  }): Promise<void> {
    this.logger.log(`Handling stock.alert event for product ${payload.productName}`);

    const typeMap: Record<string, NotificationType> = {
      low: NotificationType.STOCK_LOW,
      critical: NotificationType.STOCK_CRITICAL,
      out_of_stock: NotificationType.STOCK_CRITICAL,
    };

    // Send WebSocket alert to admins
    await this.notificationService.sendAdminAlert(
      typeMap[payload.alertType],
      `Stock Alert: ${payload.productName}`,
      `Current stock: ${payload.currentStock} units (threshold: ${payload.threshold})`,
      {
        productId: payload.productId,
        productName: payload.productName,
        sku: payload.sku,
        currentStock: payload.currentStock,
        threshold: payload.threshold,
        alertType: payload.alertType,
      },
    );

    // Send email to admin addresses if provided
    if (payload.adminEmails?.length) {
      for (const email of payload.adminEmails) {
        await this.emailService.sendStockAlert(email, {
          productName: payload.productName,
          sku: payload.sku,
          currentStock: payload.currentStock,
          threshold: payload.threshold,
          alertType: payload.alertType,
        });
      }
    }
  }

  /**
   * Handle refund event
   */
  @OnEvent('payment.refunded')
  async handlePaymentRefunded(payload: {
    paymentId: string;
    orderId: string;
    userId: string;
    refundAmount: number;
    refundId: string;
    customerEmail?: string;
  }): Promise<void> {
    this.logger.log(`Handling payment.refunded event for order ${payload.orderId}`);

    await this.notificationService.sendNotification({
      userId: payload.userId,
      type: NotificationType.PAYMENT_REFUNDED,
      title: 'Refund Processed',
      message: `Your refund of $${payload.refundAmount} has been processed.`,
      data: {
        orderId: payload.orderId,
        paymentId: payload.paymentId,
        refundAmount: payload.refundAmount,
        refundId: payload.refundId,
      },
      channels: [ChannelType.WEBSOCKET, ChannelType.EMAIL],
      email: payload.customerEmail,
    });
  }
}
