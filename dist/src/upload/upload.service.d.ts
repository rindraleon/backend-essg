import { StorageService } from '../common/storage/storage.service';
export interface UploadedImageResult {
    url: string;
    filename: string;
}
export declare class UploadService {
    private readonly storageService;
    constructor(storageService: StorageService);
    uploadImage(file: Express.Multer.File): Promise<UploadedImageResult>;
}
