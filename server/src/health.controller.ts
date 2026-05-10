import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from './auth/admin.guard';
import { PrismaService } from './prisma/prisma.service';
import { StorageService } from './storage/storage.service';

@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Get('health')
  health() {
    return { ok: true };
  }

  @Get('admin/system/status')
  @UseGuards(AdminGuard)
  async adminStatus() {
    let database = false;
    let bucketPresign = false;
    let bucketError: string | null = null;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = true;
    } catch {
      database = false;
    }

    const bucket = this.storage.getStatus();
    if (bucket.configured) {
      try {
        await this.storage.createUploadUrl(`health/${crypto.randomUUID()}.txt`, 'text/plain');
        bucketPresign = true;
      } catch (error) {
        bucketError = error instanceof Error ? error.message : 'Bucket presign failed';
      }
    }

    return {
      ok: database && bucket.configured && bucketPresign,
      database: {
        connected: database,
      },
      bucket: {
        ...bucket,
        uploadPresign: bucketPresign,
        error: bucketError,
      },
    };
  }
}
