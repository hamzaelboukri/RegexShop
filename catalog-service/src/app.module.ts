import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Caching
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes in milliseconds
      max: 100, // Maximum number of items in cache
    }),
    
    // Database
    PrismaModule,
    
    // Authentication
    AuthModule,
    
    // Feature modules
    CategoriesModule,
    ProductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

