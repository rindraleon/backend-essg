"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadConfig = void 0;
const multer_1 = require("multer");
const path_1 = require("path");
const node_fs_1 = require("node:fs");
const node_crypto_1 = require("node:crypto");
const storage = (0, multer_1.diskStorage)({
    destination: (req, file, cb) => {
        const uploadDir = (0, path_1.join)(process.cwd(), 'uploads', 'images');
        if (!(0, node_fs_1.existsSync)(uploadDir)) {
            (0, node_fs_1.mkdirSync)(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + (0, node_crypto_1.randomInt)(0, 1E9);
        const ext = (0, path_1.extname)(file.originalname);
        cb(null, `logo-${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Format d\'image non supporté. Utilisez JPG, PNG, GIF ou WebP.'), false);
    }
};
exports.uploadConfig = {
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
};
//# sourceMappingURL=multer.config.js.map