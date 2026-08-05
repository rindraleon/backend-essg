import type { FileFilterCallback } from 'multer';
import type { Request } from 'express';
export declare const uploadConfig: {
    storage: import("multer").StorageEngine;
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => void;
    limits: {
        fileSize: number;
    };
};
