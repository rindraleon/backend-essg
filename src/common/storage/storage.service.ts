import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { extname } from 'node:path';
import { Readable } from 'node:stream';
import { randomUUID } from 'node:crypto';
import {
  StoredFileMetadata,
  StorageUploadOptions,
  StorageUploadResult,
} from './interfaces/storage.interface';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: Client;
  private readonly defaultBucket: string;
  private readonly publicUrlBase: string;

  constructor(private readonly configService: ConfigService) {
    this.defaultBucket = this.configService.get<string>('MINIO_BUCKET', 'essg');
    this.publicUrlBase = this.configService.get<string>('MINIO_PUBLIC_URL', '');

    this.client = new Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.configService.get<string>('MINIO_PORT', '9000'), 10),
      useSSL: this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', ''),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', ''),
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureBucket(this.defaultBucket);
    } catch (error) {
      this.logger.warn(
        `Impossible d'initialiser le bucket MinIO "${this.defaultBucket}"`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async ensureBucket(bucket: string): Promise<void> {
    const exists = await this.client.bucketExists(bucket);
    if (!exists) {
      await this.client.makeBucket(bucket, '');
      this.logger.log(`Bucket MinIO "${bucket}" créé`);
    }
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    options: StorageUploadOptions = {},
  ): Promise<StorageUploadResult> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('Fichier vide');
    }

    const bucket = options.bucket ?? this.defaultBucket;
    const extension = extname(originalName).toLowerCase();
    const objectName = `${randomUUID()}${extension}`;
    const mimetype = options.mimetype ?? 'application/octet-stream';

    await this.client.putObject(bucket, objectName, buffer, buffer.length, {
      'Content-Type': mimetype,
      ...options.metadata,
    });

    return {
      objectName,
      bucket,
      url: this.getFileUrl(bucket, objectName),
    };
  }

  async download(objectName: string, bucket = this.defaultBucket): Promise<Buffer> {
    try {
      const stream = await this.client.getObject(bucket, objectName);
      return await this.streamToBuffer(stream);
    } catch {
      this.logger.warn(`Fichier "${objectName}" introuvable dans "${bucket}"`);
      throw new NotFoundException('Fichier introuvable');
    }
  }

  async delete(objectName: string, bucket = this.defaultBucket): Promise<void> {
    try {
      await this.client.removeObject(bucket, objectName);
    } catch (error) {
      this.logger.warn(
        `Échec de suppression de "${objectName}" dans "${bucket}"`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  async exists(objectName: string, bucket = this.defaultBucket): Promise<boolean> {
    try {
      await this.client.statObject(bucket, objectName);
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(
    objectName: string,
    bucket = this.defaultBucket,
  ): Promise<StoredFileMetadata | null> {
    try {
      const stat = await this.client.statObject(bucket, objectName);
      const contentType = stat.metaData?.['content-type'] as string | undefined;
      return {
        size: stat.size,
        etag: stat.etag,
        lastModified: stat.lastModified,
        contentType,
      };
    } catch {
      return null;
    }
  }

  getFileUrl(bucket: string, objectName: string): string {
    if (this.publicUrlBase) {
      return `${this.publicUrlBase}/${bucket}/${objectName}`;
    }
    return `/uploads/${objectName}`;
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    return Buffer.concat(chunks);
  }
}
