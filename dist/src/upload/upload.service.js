"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const node_path_1 = require("node:path");
const uuid_1 = require("uuid");
let UploadService = class UploadService {
    uploadPath = 'uploads';
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    getStorageConfig() {
        return (0, multer_1.diskStorage)({
            destination: (0, node_path_1.join)(this.uploadPath, 'images'),
            filename: (req, file, callback) => {
                const uniqueName = `${(0, uuid_1.v4)()}${(0, node_path_1.extname)(file.originalname)}`;
                callback(null, uniqueName);
            },
        });
    }
    getFileFilter() {
        return (req, file, callback) => {
            const extension = (0, node_path_1.extname)(file.originalname).toLowerCase();
            if (this.allowedExtensions.includes(extension)) {
                callback(null, true);
            }
            else {
                callback(new common_1.BadRequestException(`Type de fichier non autorisé. Extensions autorisées: ${this.allowedExtensions.join(', ')}`), false);
            }
        };
    }
    getAvatarUrl(filename) {
        return `/uploads/images/${filename}`;
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)()
], UploadService);
//# sourceMappingURL=upload.service.js.map