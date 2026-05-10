import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('orders')
  create(@Body() dto: CreateOrderDto) {
    return this.orders.create(dto);
  }

  @Get('admin/orders')
  @UseGuards(AdminGuard)
  listAdmin() {
    return this.orders.listAdmin();
  }

  @Get('admin/orders/:id')
  @UseGuards(AdminGuard)
  findAdmin(@Param('id') id: string) {
    return this.orders.findAdmin(id);
  }

  @Patch('admin/orders/:id/status')
  @UseGuards(AdminGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }

  @Delete('admin/orders/:id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.orders.remove(id);
  }
}
