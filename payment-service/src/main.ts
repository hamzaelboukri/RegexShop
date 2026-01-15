import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for Stripe webhook signature verification
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Payment Service API')
    .setDescription('Payment microservice with Stripe integration for secure checkout and webhook handling')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('payments', 'Payment operations')
    .addTag('webhooks', 'Stripe webhook handlers')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`Payment Service is running on port ${port}`);
  logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
