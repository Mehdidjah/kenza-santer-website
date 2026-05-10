import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [AuthModule, EventsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
