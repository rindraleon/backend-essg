import { diskStorage } from 'multer';
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
    const uniqueSuffix = Date.now() + '-' + randomInt(0, 1E9);
    const ext = extname(file.originalname);
    cb(null, `logo-${uniqueSuffix}${ext}`);
  },
});

// Filtre pour n'accepter que les images
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format d\'image non supporté. Utilisez JPG, PNG, GIF ou WebP.'), false);
  }
};

export const uploadConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
};