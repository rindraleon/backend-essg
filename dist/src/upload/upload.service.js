"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const node_path_1 = require("node:path");
const uuid_1 = require("uuid");
const fs = __importStar(require("node:fs"));
let UploadService = class UploadService {
    uploadPath;
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    constructor() {
        this.uploadPath = process.env.UPLOAD_PATH || 'uploads';
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
            console.log(`Created ${this.uploadPath} directory`);
        }
    }
    getStorageConfig() {
        return (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const imagesDir = (0, node_path_1.join)(this.uploadPath, 'images');
                if (!fs.existsSync(imagesDir)) {
                    fs.mkdirSync(imagesDir, { recursive: true });
                    console.log(`Created ${imagesDir} directory`);
                }
                cb(null, imagesDir);
            },
            filename: (req, file, cb) => {
                const uniqueName = `${(0, uuid_1.v4)()}${(0, node_path_1.extname)(file.originalname)}`;
                cb(null, uniqueName);
            },
        });
    }
    getFileFilter() {
        return (_req, file, callback) => {
            const extension = (0, node_path_1.extname)(file.originalname).toLowerCase();
            if (this.allowedExtensions.includes(extension)) {
                callback(null, true);
            }
            else {
                callback(new common_1.BadRequestException(`Type de fichier non autorisé. Extensions autorisées: ${this.allowedExtensions.join(', ')}`));
            }
        };
    }
    getAvatarUrl(filename) {
        return `/${this.uploadPath}/images/${filename}`;
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UploadService);
//# sourceMappingURL=upload.service.js.map