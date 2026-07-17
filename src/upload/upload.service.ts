import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadPath = 'uploads';
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  getStorageConfig() {
    return diskStorage({
      destination: join(this.uploadPath, 'images'),
      filename: (req, file, callback) => {
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
        callback(null, uniqueName);
      },
    });
  }

  getFileFilter() {
    return (req, file, callback) => {
      const extension = extname(file.originalname).toLowerCase();
      if (this.allowedExtensions.includes(extension)) {
        callback(null, true);
      } else {
        callback(
          new BadRequestException(
            `Type de fichier non autorisé. Extensions autorisées: ${this.allowedExtensions.join(', ')}`
          ),
          false
        );
      }
    };
  }

  getAvatarUrl(filename: string): string {
    return `/uploads/images/${filename}`;
  }
}