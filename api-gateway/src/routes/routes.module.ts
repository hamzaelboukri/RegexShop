import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CatalogController, ProductsController, CategoriesController } from './catalog.controller';
import { InventoryController } from './inventory.controller';
import { OrdersController } from './orders.controller';
import { PaymentsController } from './payments.controller';
import { NotificationsController } from './notifications.controller';

@Module({
  controllers: [
    AuthController,
    CatalogController,
    ProductsController,
    CategoriesController,
    InventoryController,
    OrdersController,
    PaymentsController,
    NotificationsController,
  ],
})
export class RoutesModule {}
