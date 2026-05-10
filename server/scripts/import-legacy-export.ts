import 'dotenv/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Prisma, PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { slugify } from '../src/common/slugify';

type LegacyCategory = {
  id?: string;
  name: string;
  slug?: string;
  sort_order?: number;
};

type LegacyProduct = {
  id?: string;
  name: string;
  brand?: string | null;
  category: string;
  description?: string | null;
  full_description?: string | null;
  price?: number | string | null;
  original_price?: number | string | null;
  badge?: string | null;
  rating?: number | string | null;
  review_count?: number | null;
  in_stock?: boolean | null;
  images?: string[] | null;
  ingredients?: string[] | null;
  how_to_use?: string[] | null;
  precautions?: string[] | null;
};

type LegacyOrder = {
  id?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  wilaya: string;
  commune: string;
  notes?: string | null;
  total?: number | string | null;
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at?: string;
};

type LegacyOrderItem = {
  id?: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  unit_price?: number | string | null;
  quantity?: number | null;
  created_at?: string;
};

type ExportPayload = {
  categories?: LegacyCategory[];
  products?: LegacyProduct[];
  orders?: LegacyOrder[];
  order_items?: LegacyOrderItem[];
};

const prisma = new PrismaClient();

function decimal(value: unknown, fallback = 0) {
  return new Prisma.Decimal(value == null || value === '' ? fallback : String(value));
}

function s3Client() {
  const endpoint = process.env.S3_ENDPOINT ?? process.env.ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID ?? process.env.ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY ?? process.env.SECRET_ACCESS_KEY;
  const region = process.env.S3_REGION ?? process.env.REGION ?? 'auto';
  const bucket = process.env.S3_BUCKET ?? process.env.BUCKET;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) return null;
  return {
    bucket,
    client: new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    }),
  };
}

async function migrateImage(urlOrKey: string, productId: string, position: number) {
  if (process.env.MIGRATE_IMAGES_TO_BUCKET !== 'true') return urlOrKey;
  if (!urlOrKey.startsWith('http://') && !urlOrKey.startsWith('https://')) return urlOrKey;

  const s3 = s3Client();
  if (!s3) throw new Error('S3/Railway bucket env vars are required when MIGRATE_IMAGES_TO_BUCKET=true');

  const response = await fetch(urlOrKey);
  if (!response.ok) throw new Error(`Failed to download ${urlOrKey}: ${response.status}`);

  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  const extension = extname(new URL(urlOrKey).pathname) || '.jpg';
  const objectKey = `products/${productId}-${position}${extension}`;
  const body = Buffer.from(await response.arrayBuffer());

  await s3.client.send(new PutObjectCommand({
    Bucket: s3.bucket,
    Key: objectKey,
    Body: body,
    ContentType: contentType,
  }));

  return objectKey;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) throw new Error('Usage: npm run import:legacy -- ./legacy-export.json');

  const payload = JSON.parse(await readFile(filePath, 'utf8')) as ExportPayload;
  const categoryByName = new Map<string, string>();

  for (const category of payload.categories ?? []) {
    const saved = await prisma.category.upsert({
      where: { name: category.name },
      update: {
        slug: category.slug ?? slugify(category.name),
        sortOrder: category.sort_order ?? 0,
      },
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug ?? slugify(category.name),
        sortOrder: category.sort_order ?? 0,
      },
    });
    categoryByName.set(saved.name, saved.id);
  }

  for (const product of payload.products ?? []) {
    let categoryId = categoryByName.get(product.category);
    if (!categoryId) {
      const category = await prisma.category.create({
        data: { name: product.category, slug: slugify(product.category), sortOrder: categoryByName.size + 1 },
      });
      categoryId = category.id;
      categoryByName.set(category.name, category.id);
    }

    const saved = await prisma.product.upsert({
      where: { id: product.id ?? crypto.randomUUID() },
      update: {
        name: product.name,
        brand: product.brand ?? '',
        categoryId,
        description: product.description ?? '',
        fullDescription: product.full_description ?? '',
        price: decimal(product.price),
        originalPrice: product.original_price == null ? null : decimal(product.original_price),
        badge: product.badge ?? null,
        rating: decimal(product.rating, 4.5),
        reviewCount: product.review_count ?? 0,
        inStock: product.in_stock ?? true,
        ingredients: product.ingredients ?? [],
        howToUse: product.how_to_use ?? [],
        precautions: product.precautions ?? [],
      },
      create: {
        id: product.id,
        name: product.name,
        brand: product.brand ?? '',
        categoryId,
        description: product.description ?? '',
        fullDescription: product.full_description ?? '',
        price: decimal(product.price),
        originalPrice: product.original_price == null ? null : decimal(product.original_price),
        badge: product.badge ?? null,
        rating: decimal(product.rating, 4.5),
        reviewCount: product.review_count ?? 0,
        inStock: product.in_stock ?? true,
        ingredients: product.ingredients ?? [],
        howToUse: product.how_to_use ?? [],
        precautions: product.precautions ?? [],
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: saved.id } });
    const images = (product.images ?? []).slice(0, 4);
    for (const [position, image] of images.entries()) {
      await prisma.productImage.create({
        data: {
          productId: saved.id,
          objectKey: await migrateImage(image, saved.id, position),
          position,
        },
      });
    }
  }

  for (const order of payload.orders ?? []) {
    await prisma.order.upsert({
      where: { id: order.id ?? crypto.randomUUID() },
      update: {
        firstName: order.first_name,
        lastName: order.last_name,
        phone: order.phone,
        email: order.email,
        wilaya: order.wilaya,
        commune: order.commune,
        notes: order.notes ?? null,
        total: decimal(order.total),
        status: order.status ?? 'pending',
        createdAt: order.created_at ? new Date(order.created_at) : undefined,
      },
      create: {
        id: order.id,
        firstName: order.first_name,
        lastName: order.last_name,
        phone: order.phone,
        email: order.email,
        wilaya: order.wilaya,
        commune: order.commune,
        notes: order.notes ?? null,
        total: decimal(order.total),
        status: order.status ?? 'pending',
        createdAt: order.created_at ? new Date(order.created_at) : undefined,
      },
    });
  }

  for (const item of payload.order_items ?? []) {
    await prisma.orderItem.upsert({
      where: { id: item.id ?? crypto.randomUUID() },
      update: {
        orderId: item.order_id,
        productId: item.product_id ?? null,
        productName: item.product_name,
        unitPrice: decimal(item.unit_price),
        quantity: item.quantity ?? 1,
        createdAt: item.created_at ? new Date(item.created_at) : undefined,
      },
      create: {
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id ?? null,
        productName: item.product_name,
        unitPrice: decimal(item.unit_price),
        quantity: item.quantity ?? 1,
        createdAt: item.created_at ? new Date(item.created_at) : undefined,
      },
    });
  }

  console.log(`Imported ${(payload.categories ?? []).length} categories, ${(payload.products ?? []).length} products, ${(payload.orders ?? []).length} orders.`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
