import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto';
import { EventsService } from '../events/events.service';

const orderInclude = { items: { orderBy: { createdAt: 'asc' as const } } } satisfies Prisma.OrderInclude;
type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  async create(dto: CreateOrderDto) {
    const grouped = new Map<string, number>();
    for (const item of dto.items) {
      grouped.set(item.productId, (grouped.get(item.productId) ?? 0) + item.quantity);
    }

    const productIds = Array.from(grouped.keys());
    const order = await this.prisma.$transaction(async tx => {
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });
      if (products.length !== productIds.length) throw new BadRequestException('One or more products do not exist');
      if (products.some(product => !product.inStock)) throw new BadRequestException('One or more products are out of stock');

      const items = products.map(product => {
        const quantity = grouped.get(product.id) ?? 0;
        const unitPrice = product.price;
        return {
          productId: product.id,
          productName: product.name,
          unitPrice,
          quantity,
        };
      });

      const total = items.reduce((sum, item) => sum.add(item.unitPrice.mul(item.quantity)), new Prisma.Decimal(0));

      return tx.order.create({
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone: dto.phone.trim(),
          email: dto.email.trim(),
          wilaya: dto.wilaya,
          commune: dto.commune.trim(),
          notes: dto.notes?.trim() || null,
          total,
          items: { create: items },
        },
        include: orderInclude,
      });
    });

    this.events.emitOrder({ action: 'created', id: order.id });
    return { id: order.id, total: Number(order.total) };
  }

  async listAdmin() {
    const rows = await this.prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(row => this.serialize(row));
  }

  async findAdmin(id: string) {
    const row = await this.prisma.order.findUnique({ where: { id }, include: orderInclude });
    if (!row) throw new NotFoundException('Order not found');
    return this.serialize(row);
  }

  async updateStatus(id: string, status: OrderStatus) {
    await this.ensureExists(id);
    const row = await this.prisma.order.update({ where: { id }, data: { status }, include: orderInclude });
    this.events.emitOrder({ action: 'status-updated', id, status });
    return this.serialize(row);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.order.delete({ where: { id } });
    this.events.emitOrder({ action: 'deleted', id });
    return { ok: true };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.order.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException('Order not found');
  }

  private serialize(row: Prisma.OrderGetPayload<Record<string, never>> | OrderWithItems) {
    const items = 'items' in row
      ? row.items.map(item => ({
          id: item.id,
          product_id: item.productId,
          product_name: item.productName,
          unit_price: Number(item.unitPrice),
          quantity: item.quantity,
          created_at: item.createdAt.toISOString(),
        }))
      : undefined;

    return {
      id: row.id,
      first_name: row.firstName,
      last_name: row.lastName,
      phone: row.phone,
      email: row.email,
      wilaya: row.wilaya,
      commune: row.commune,
      notes: row.notes,
      total: Number(row.total),
      status: row.status,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
      ...(items ? { items } : {}),
    };
  }
}
