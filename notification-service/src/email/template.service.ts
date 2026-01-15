import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TemplateService implements OnModuleInit {
  private readonly logger = new Logger(TemplateService.name);
  private templates: Map<string, Handlebars.TemplateDelegate> = new Map();
  private plainTextTemplates: Map<string, Handlebars.TemplateDelegate> = new Map();

  onModuleInit(): void {
    this.registerHelpers();
    this.loadBuiltInTemplates();
  }

  private registerHelpers(): void {
    // Currency formatting helper
    Handlebars.registerHelper('currency', (amount: number, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(amount);
    });

    // Date formatting helper
    Handlebars.registerHelper('formatDate', (date: Date | string, format = 'long') => {
      const dateObj = new Date(date);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: format === 'short' ? 'short' : 'long',
        day: 'numeric',
      };
      return dateObj.toLocaleDateString('en-US', options);
    });

    // Conditional equality helper
    Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

    // Uppercase helper
    Handlebars.registerHelper('uppercase', (str: string) => str?.toUpperCase());

    // Lowercase helper
    Handlebars.registerHelper('lowercase', (str: string) => str?.toLowerCase());
  }

  private loadBuiltInTemplates(): void {
    // Order Confirmation Template
    this.templates.set(
      'order-confirmation',
      Handlebars.compile(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .total-row { font-weight: bold; font-size: 1.1em; margin-top: 15px; padding-top: 15px; border-top: 2px solid #4F46E5; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
    .btn { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Order Confirmed! 🎉</h1>
    <p>Thank you for your purchase</p>
  </div>
  <div class="content">
    <p>Hi {{customerName}},</p>
    <p>We've received your order and it's being processed. Here are your order details:</p>
    
    <div class="order-details">
      <h3>Order #{{orderNumber}}</h3>
      
      {{#each items}}
      <div class="item-row">
        <span>{{this.name}} x {{this.quantity}}</span>
        <span>{{currency this.price}}</span>
      </div>
      {{/each}}
      
      <div class="item-row">
        <span>Subtotal</span>
        <span>{{currency subtotal}}</span>
      </div>
      <div class="item-row">
        <span>Tax</span>
        <span>{{currency tax}}</span>
      </div>
      <div class="item-row">
        <span>Shipping</span>
        <span>{{currency shipping}}</span>
      </div>
      <div class="item-row total-row">
        <span>Total</span>
        <span>{{currency total}}</span>
      </div>
    </div>
    
    {{#if shippingAddress}}
    <div class="order-details">
      <h4>Shipping Address</h4>
      <p>{{shippingAddress}}</p>
    </div>
    {{/if}}
    
    <p>We'll send you another email when your order ships.</p>
  </div>
  <div class="footer">
    <p>© {{year}} Regex Shop. All rights reserved.</p>
    <p>If you have any questions, reply to this email or contact our support.</p>
  </div>
</body>
</html>
      `),
    );

    this.plainTextTemplates.set(
      'order-confirmation',
      Handlebars.compile(`
ORDER CONFIRMED!
================

Hi {{customerName}},

Thank you for your order #{{orderNumber}}!

Order Details:
{{#each items}}
- {{this.name}} x {{this.quantity}} - {{currency this.price}}
{{/each}}

Subtotal: {{currency subtotal}}
Tax: {{currency tax}}
Shipping: {{currency shipping}}
TOTAL: {{currency total}}

{{#if shippingAddress}}
Shipping Address:
{{shippingAddress}}
{{/if}}

We'll send you another email when your order ships.

© {{year}} Regex Shop
      `),
    );

    // Payment Success Template
    this.templates.set(
      'payment-success',
      Handlebars.compile(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Successful</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .amount { font-size: 2em; color: #10B981; font-weight: bold; text-align: center; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Payment Successful ✓</h1>
  </div>
  <div class="content">
    <p>Hi {{customerName}},</p>
    <p>Your payment has been successfully processed!</p>
    
    <div class="amount">{{currency amount currency}}</div>
    
    <div class="details">
      <p><strong>Order:</strong> #{{orderNumber}}</p>
      {{#if transactionId}}
      <p><strong>Transaction ID:</strong> {{transactionId}}</p>
      {{/if}}
      {{#if paymentMethod}}
      <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
      {{/if}}
    </div>
    
    <p>Thank you for shopping with us!</p>
  </div>
  <div class="footer">
    <p>© {{year}} Regex Shop. All rights reserved.</p>
  </div>
</body>
</html>
      `),
    );

    this.plainTextTemplates.set(
      'payment-success',
      Handlebars.compile(`
PAYMENT SUCCESSFUL ✓
====================

Hi {{customerName}},

Your payment of {{currency amount currency}} has been successfully processed!

Order: #{{orderNumber}}
{{#if transactionId}}Transaction ID: {{transactionId}}{{/if}}
{{#if paymentMethod}}Payment Method: {{paymentMethod}}{{/if}}

Thank you for shopping with us!

© {{year}} Regex Shop
      `),
    );

    // Payment Failed Template
    this.templates.set(
      'payment-failed',
      Handlebars.compile(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Failed</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .error-box { background: #FEE2E2; border: 1px solid #EF4444; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .btn { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Payment Failed ✗</h1>
  </div>
  <div class="content">
    <p>Hi {{customerName}},</p>
    <p>Unfortunately, your payment for order #{{orderNumber}} could not be processed.</p>
    
    {{#if errorMessage}}
    <div class="error-box">
      <strong>Error:</strong> {{errorMessage}}
    </div>
    {{/if}}
    
    <p>Please try again or use a different payment method.</p>
    
    {{#if retryUrl}}
    <p style="text-align: center;">
      <a href="{{retryUrl}}" class="btn">Retry Payment</a>
    </p>
    {{/if}}
    
    <p>If you continue to experience issues, please contact our support team.</p>
  </div>
  <div class="footer">
    <p>© {{year}} Regex Shop. All rights reserved.</p>
  </div>
</body>
</html>
      `),
    );

    this.plainTextTemplates.set(
      'payment-failed',
      Handlebars.compile(`
PAYMENT FAILED ✗
================

Hi {{customerName}},

Unfortunately, your payment for order #{{orderNumber}} could not be processed.

{{#if errorMessage}}Error: {{errorMessage}}{{/if}}

Please try again or use a different payment method.

{{#if retryUrl}}Retry here: {{retryUrl}}{{/if}}

If you continue to experience issues, please contact our support team.

© {{year}} Regex Shop
      `),
    );

    // Stock Alert Template
    this.templates.set(
      'stock-alert',
      Handlebars.compile(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Stock Alert</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header-low { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header-critical { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header-out_of_stock { background: #991B1B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .alert-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #EF4444; }
    .stock-number { font-size: 2em; font-weight: bold; text-align: center; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="header-{{alertType}}">
    <h1>{{#if (eq alertType 'critical')}}🚨 CRITICAL STOCK ALERT{{else if (eq alertType 'out_of_stock')}}⛔ OUT OF STOCK{{else}}⚠️ Low Stock Alert{{/if}}</h1>
  </div>
  <div class="content">
    <div class="alert-box">
      <h3>{{productName}}</h3>
      <p><strong>SKU:</strong> {{sku}}</p>
      <div class="stock-number">{{currentStock}} units remaining</div>
      <p><strong>Threshold:</strong> {{threshold}} units</p>
    </div>
    
    <p>Please take action to replenish stock for this product.</p>
  </div>
  <div class="footer">
    <p>© {{year}} Regex Shop - Admin Alert</p>
  </div>
</body>
</html>
      `),
    );

    this.plainTextTemplates.set(
      'stock-alert',
      Handlebars.compile(`
{{#if (eq alertType 'critical')}}🚨 CRITICAL STOCK ALERT{{else if (eq alertType 'out_of_stock')}}⛔ OUT OF STOCK{{else}}⚠️ LOW STOCK ALERT{{/if}}
==================

Product: {{productName}}
SKU: {{sku}}
Current Stock: {{currentStock}} units
Threshold: {{threshold}} units

Please take action to replenish stock for this product.

© {{year}} Regex Shop - Admin Alert
      `),
    );

    this.logger.log(`Loaded ${this.templates.size} email templates`);
  }

  /**
   * Render an HTML template
   */
  render(templateName: string, data: Record<string, unknown>): string {
    const template = this.templates.get(templateName);
    
    if (!template) {
      this.logger.warn(`Template not found: ${templateName}`);
      return this.renderFallback(data);
    }

    return template(data);
  }

  /**
   * Render a plain text template
   */
  renderPlainText(templateName: string, data: Record<string, unknown>): string {
    const template = this.plainTextTemplates.get(templateName);
    
    if (!template) {
      return this.renderPlainTextFallback(data);
    }

    return template(data);
  }

  /**
   * Register a custom template
   */
  registerTemplate(name: string, htmlTemplate: string, plainTextTemplate?: string): void {
    this.templates.set(name, Handlebars.compile(htmlTemplate));
    
    if (plainTextTemplate) {
      this.plainTextTemplates.set(name, Handlebars.compile(plainTextTemplate));
    }

    this.logger.log(`Registered custom template: ${name}`);
  }

  private renderFallback(data: Record<string, unknown>): string {
    return `
<!DOCTYPE html>
<html>
<head><title>Notification</title></head>
<body>
  <h1>Notification</h1>
  <pre>${JSON.stringify(data, null, 2)}</pre>
</body>
</html>
    `;
  }

  private renderPlainTextFallback(data: Record<string, unknown>): string {
    return `Notification\n\n${JSON.stringify(data, null, 2)}`;
  }
}
