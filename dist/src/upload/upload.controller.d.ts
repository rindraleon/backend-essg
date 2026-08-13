import { PresignUploadDto } from './dto/presign-upload.dto';
import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadImage(file?: Express.Multer.File, folder?: string): Promise<import("./upload.service").UploadedImageResult>;
    presign(dto: PresignUploadDto): Promise<import("../common/storage/interfaces/storage.interface").PresignedUpload>;
}
