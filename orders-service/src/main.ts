import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Orders Service API')
    .setDescription('YouShop Orders Service - Manage customer orders')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('orders')
    .addTag('health')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Connect to Kafka as a microservice (if enabled)
  const enableKafka = process.env.ENABLE_KAFKA === 'true';
  if (enableKafka) {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
        },
        consumer: {
          groupId: 'orders-consumer',
        },
      },
    });
    await app.startAllMicroservices();
    logger.log('Kafka microservice connected');
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`🚀 Orders Service is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
