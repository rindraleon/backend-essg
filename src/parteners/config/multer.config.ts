import { diskStorage } from 'multer';
import type { Request } from 'express';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'node:fs';
import { randomInt } from 'node:crypto';

// Configuration du stockage
const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = join(process.cwd(), 'uploads', 'images');

    // Créer le dossier s'il n'existe pas
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + randomInt(0, 1e9);
    const ext = extname(file.originalname);
    cb(null, `logo-${uniqueSuffix}${ext}`);
  },
});

// Filtre pour n'accepter que les images
const fileFilter = (_req: Request, file: Express.Multer.File, cb: any): void => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported image format. Use JPG, PNG, GIF, or WebP.'), false);
  }
};

export const uploadConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
};
