import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slugify';
import { SaveCategoryDto } from './dto';
import { EventsService } from '../events/events.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  async list() {
    const rows = await this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
    return rows.map(row => this.serialize(row));
  }

  async create(dto: SaveCategoryDto) {
    const name = dto.name.trim();
    if (!name) throw new BadRequestException('Category name is required');

    const row = await this.prisma.category.create({
      data: {
        name,
        slug: slugify(name),
        sortOrder: dto.sort_order ?? 0,
      },
    });
    this.events.emitCatalog('category.changed', { action: 'created', id: row.id });
    return this.serialize(row);
  }

  async update(id: string, dto: SaveCategoryDto) {
    await this.ensureExists(id);
    const name = dto.name.trim();
    if (!name) throw new BadRequestException('Category name is required');

    const row = await this.prisma.category.update({
      where: { id },
      data: {
        name,
        slug: slugify(name),
        sortOrder: dto.sort_order ?? 0,
      },
    });
    this.events.emitCatalog('category.changed', { action: 'updated', id: row.id });
    return this.serialize(row);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.category.delete({ where: { id } });
    this.events.emitCatalog('category.changed', { action: 'deleted', id });
    return { ok: true };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.category.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException('Category not found');
  }

  private serialize(row: { id: string; name: string; slug: string; sortOrder: number; createdAt: Date; updatedAt: Date }) {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      sortOrder: row.sortOrder,
      sort_order: row.sortOrder,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    };
  }
}
