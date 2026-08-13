"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const multer_config_1 = require("../common/storage/multer.config");
const storage_constants_1 = require("../common/storage/storage.constants");
const storage_service_1 = require("../common/storage/storage.service");
let UploadService = class UploadService {
    storageService;
    constructor(storageService) {
        this.storageService = storageService;
    }
    async uploadImage(file, folder) {
        const prefix = (0, storage_constants_1.normalizeStoragePrefix)(folder || storage_constants_1.STORAGE_PREFIXES.images);
        const result = await this.storageService.upload(file.buffer, file.originalname, {
            mimetype: file.mimetype,
            prefix,
        });
        return this.toUploadedResult(result);
    }
    async presign(dto) {
        const isImage = multer_config_1.ALLOWED_IMAGE_MIMES.includes(dto.mimeType);
        const isDocument = multer_config_1.ALLOWED_DOCUMENT_MIMES.includes(dto.mimeType);
        if (!isImage && !isDocument) {
            throw new common_1.BadRequestException('Type de fichier non autorisé');
        }
        const maxSize = isImage ? multer_config_1.MAX_IMAGE_SIZE : multer_config_1.MAX_DOCUMENT_SIZE;
        if (dto.size > maxSize) {
            throw new common_1.BadRequestException('Fichier trop volumineux');
        }
        const prefix = (0, storage_constants_1.normalizeStoragePrefix)(dto.folder || (isImage ? storage_constants_1.STORAGE_PREFIXES.images : storage_constants_1.STORAGE_PREFIXES.documents));
        return this.storageService.createPresignedUpload(dto.fileName, {
            mimetype: dto.mimeType,
            prefix,
        });
    }
    toUploadedResult(result) {
        return {
            url: result.url,
            filename: result.objectName,
            objectKey: result.objectKey,
            bucket: result.bucket,
            fileName: result.fileName,
            mimeType: result.mimeType,
            size: result.size,
        };
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], UploadService);
//# sourceMappingURL=upload.service.js.map