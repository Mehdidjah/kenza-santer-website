import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { StorageModule } from './storage/storage.module';
import { EventsModule } from './events/events.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    EventsModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
