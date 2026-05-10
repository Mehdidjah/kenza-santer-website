import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { SaveProductDto } from './dto';
import { EventsService } from '../events/events.service';
import { DEFAULT_PRODUCT_IMAGE } from '../common/images';

const productInclude = {
  category: true,
  images: { orderBy: { position: 'asc' as const } },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly events: EventsService,
  ) {}

  async list({ newestFirst = false } = {}) {
    const rows = await this.prisma.product.findMany({
      include: productInclude,
      orderBy: { createdAt: newestFirst ? 'desc' : 'asc' },
    });
    return Promise.all(rows.map(row => this.serialize(row)));
  }

  async findOne(id: string) {
    const row = await this.prisma.product.findUnique({ where: { id }, include: productInclude });
    if (!row) throw new NotFoundException('Product not found');
    return this.serialize(row);
  }

  async create(dto: SaveProductDto) {
    const product = await this.save(null, dto);
    this.events.emitCatalog('product.changed', { action: 'created', id: product.id });
    return product;
  }

  async update(id: string, dto: SaveProductDto) {
    await this.ensureExists(id);
    const product = await this.save(id, dto);
    this.events.emitCatalog('product.changed', { action: 'updated', id });
    return product;
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.product.delete({ where: { id } });
    this.events.emitCatalog('product.changed', { action: 'deleted', id });
    return { ok: true };
  }

  async createUploadIntent(fileName: string, contentType: string) {
    const objectKey = this.storage.createProductImageKey(fileName);
    const uploadUrl = await this.storage.createUploadUrl(objectKey, contentType);
    const previewUrl = await this.storage.getDisplayUrl(objectKey);
    return { objectKey, uploadUrl, previewUrl };
  }

  private async save(id: string | null, dto: SaveProductDto) {
    const category = await this.prisma.category.findUnique({ where: { name: dto.category } });
    if (!category) throw new BadRequestException('Category does not exist');

    const imageKeys = (dto.images ?? []).filter(Boolean).slice(0, 4);
    if ((dto.images?.length ?? 0) > 4) throw new BadRequestException('Maximum 4 product images');

    const data = {
      name: dto.name.trim(),
      brand: dto.brand ?? '',
      categoryId: category.id,
      description: dto.description ?? '',
      fullDescription: dto.full_description ?? '',
      price: new Prisma.Decimal(dto.price),
      originalPrice: dto.original_price == null ? null : new Prisma.Decimal(dto.original_price),
      badge: dto.badge || null,
      inStock: dto.in_stock ?? true,
      rating: new Prisma.Decimal(dto.rating ?? 4.5),
      reviewCount: dto.review_count ?? 0,
      ingredients: dto.ingredients ?? [],
      howToUse: dto.how_to_use ?? [],
      precautions: dto.precautions ?? [],
    };

    const saved = await this.prisma.$transaction(async tx => {
      const product = id
        ? await tx.product.update({ where: { id }, data })
        : await tx.product.create({ data });

      await tx.productImage.deleteMany({ where: { productId: product.id } });
      if (imageKeys.length) {
        await tx.productImage.createMany({
          data: imageKeys.map((objectKey, position) => ({ productId: product.id, objectKey, position })),
        });
      }

      return tx.product.findUniqueOrThrow({ where: { id: product.id }, include: productInclude });
    });

    return this.serialize(saved);
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException('Product not found');
  }

  async serialize(product: ProductWithRelations) {
    const imageKeys = product.images.map(image => image.objectKey);
    const urls = imageKeys.length
      ? await Promise.all(imageKeys.map(key => this.storage.getDisplayUrl(key)))
      : [DEFAULT_PRODUCT_IMAGE];

    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category.name,
      description: product.description,
      full_description: product.fullDescription,
      price: Number(product.price),
      original_price: product.originalPrice == null ? null : Number(product.originalPrice),
      badge: product.badge,
      rating: Number(product.rating),
      review_count: product.reviewCount,
      in_stock: product.inStock,
      images: urls,
      imageKeys,
      ingredients: product.ingredients,
      how_to_use: product.howToUse,
      precautions: product.precautions,
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString(),
    };
  }
}
