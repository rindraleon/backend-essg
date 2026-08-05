import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import type { FileFilterCallback, StorageEngine } from 'multer';
import type { Request } from 'express';
import { extname, join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'node:fs';

@Injectable()
export class UploadService {
  private readonly uploadPath: string;
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  constructor() {
    // Utiliser le chemin depuis les variables d'environnement ou la valeur par défaut
    this.uploadPath = process.env.UPLOAD_PATH || 'uploads';

    // Créer le dossier uploads s'il n'existe pas
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
      console.log(`Created ${this.uploadPath} directory`);
    }
  }

  getStorageConfig(): StorageEngine {
    return diskStorage({
      destination: (req, file, cb) => {
        const imagesDir = join(this.uploadPath, 'images');

        // Créer le dossier images s'il n'existe pas
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
          console.log(`Created ${imagesDir} directory`);
        }

        cb(null, imagesDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    });
  }

  getFileFilter(): (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => void {
    return (_req, file, callback): void => {
      const extension = extname(file.originalname).toLowerCase();
      if (this.allowedExtensions.includes(extension)) {
        callback(null, true);
      } else {
        callback(
          new BadRequestException(
            `Type de fichier non autorisé. Extensions autorisées: ${this.allowedExtensions.join(', ')}`,
          ),
        );
      }
    };
  }

  getAvatarUrl(filename: string): string {
    return `/${this.uploadPath}/images/${filename}`;
  }
}
