import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

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

  // Enable CORS for WebSocket connections
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Notification Service API')
    .setDescription('Notification microservice with WebSocket and Email support for real-time notifications')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('notifications', 'Notification operations')
    .addTag('preferences', 'User notification preferences')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`Notification Service is running on port ${port}`);
  logger.log(`WebSocket Gateway available on ws://localhost:${port}`);
  logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
