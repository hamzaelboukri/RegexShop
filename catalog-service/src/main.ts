import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

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

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('YouShop Catalog Service')
    .setDescription('Product catalog and category management API for YouShop platform')
    .setVersion('1.0')
    .addTag('Products', 'Product management endpoints')
    .addTag('Categories', 'Category management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Connect to Kafka as a microservice (optional for development)
  const kafkaBroker = process.env.KAFKA_BROKER || 'localhost:9092';
  const enableKafka = process.env.ENABLE_KAFKA === 'true';

  if (enableKafka) {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'catalog-service',
          brokers: [kafkaBroker],
        },
        consumer: {
          groupId: 'catalog-consumer',
        },
      },
    });

    await app.startAllMicroservices();
    logger.log(`Kafka connected to ${kafkaBroker}`);
  } else {
    logger.log('Kafka disabled - set ENABLE_KAFKA=true to enable');
  }

  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  
  logger.log(`🚀 Catalog service is running on port ${port}`);
  logger.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();

