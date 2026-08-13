import { StorageService } from '../common/storage/storage.service';
import { PresignUploadDto } from './dto/presign-upload.dto';
export interface UploadedImageResult {
    url: string;
    filename: string;
    objectKey: string;
    bucket: string;
    fileName: string;
    mimeType: string;
    size: number;
}
export declare class UploadService {
    private readonly storageService;
    constructor(storageService: StorageService);
    uploadImage(file: Express.Multer.File, folder?: string): Promise<UploadedImageResult>;
    presign(dto: PresignUploadDto): Promise<import("../common/storage/interfaces/storage.interface").PresignedUpload>;
    private toUploadedResult;
}
