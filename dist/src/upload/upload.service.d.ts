export declare class UploadService {
    private readonly uploadPath;
    private readonly allowedExtensions;
    getStorageConfig(): import("multer").StorageEngine;
    getFileFilter(): (req: any, file: any, callback: any) => void;
    getAvatarUrl(filename: string): string;
}
