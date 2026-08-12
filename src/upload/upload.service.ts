import { Injectable } from '@nestjs/common';
import { StorageService } from '../common/storage/storage.service';

export interface UploadedImageResult {
  url: string;
  filename: string;
}

@Injectable()
export class UploadService {
  constructor(private readonly storageService: StorageService) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadedImageResult> {
    const result = await this.storageService.upload(file.buffer, file.originalname, {
      mimetype: file.mimetype,
    });
    return {
      url: result.url,
      filename: result.objectName,
    };
  }
}
