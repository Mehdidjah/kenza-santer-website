import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly bucket = process.env.S3_BUCKET ?? process.env.BUCKET;
  private readonly client: S3Client | null;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT ?? process.env.ENDPOINT;
    const region = process.env.S3_REGION ?? process.env.REGION ?? 'auto';
    const accessKeyId = process.env.S3_ACCESS_KEY_ID ?? process.env.ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY ?? process.env.SECRET_ACCESS_KEY;

    this.client = endpoint && accessKeyId && secretAccessKey
      ? new S3Client({
          endpoint,
          region,
          credentials: { accessKeyId, secretAccessKey },
          forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
        })
      : null;
  }

  isConfigured() {
    return Boolean(this.client && this.bucket);
  }

  createProductImageKey(fileName: string) {
    const ext = fileName.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'jpg';
    return `products/${crypto.randomUUID()}.${ext}`;
  }

  async createUploadUrl(objectKey: string, contentType: string) {
    if (!this.client || !this.bucket) {
      throw new ServiceUnavailableException('Railway bucket credentials are not configured');
    }

    return getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        ContentType: contentType,
      }),
      { expiresIn: 15 * 60 },
    );
  }

  async getDisplayUrl(objectKey: string) {
    if (!objectKey) return '/placeholder.svg';
    if (objectKey.startsWith('http://') || objectKey.startsWith('https://') || objectKey.startsWith('/')) {
      return objectKey;
    }
    if (!this.client || !this.bucket) return '/placeholder.svg';

    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: objectKey }),
      { expiresIn: 60 * 60 },
    );
  }
}
