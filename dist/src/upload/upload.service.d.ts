import type { FileFilterCallback, StorageEngine } from 'multer';
import type { Request } from 'express';
export declare class UploadService {
    private readonly uploadPath;
    private readonly allowedExtensions;
    constructor();
    getStorageConfig(): StorageEngine;
    getFileFilter(): (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => void;
    getAvatarUrl(filename: string): string;
}
