import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('YouShop Auth Service')
    .setDescription('Authentication API for YouShop platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Connect to Kafka as a microservice (optional for development)
  const kafkaBroker = process.env.KAFKA_BROKER || 'localhost:9092';
  const enableKafka = process.env.ENABLE_KAFKA === 'true';
  
  if (enableKafka) {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [kafkaBroker],
        },
        consumer: {
          groupId: 'auth-consumer',
        },
      },
    });
    
    await app.startAllMicroservices();
    console.log(`Kafka connected to ${kafkaBroker}`);
  } else {
    console.log('Kafka disabled - set ENABLE_KAFKA=true to enable');
  }
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Auth service is running on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
