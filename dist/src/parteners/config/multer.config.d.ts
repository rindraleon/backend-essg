export declare const uploadConfig: {
    storage: import("multer").StorageEngine;
    fileFilter: (req: any, file: Express.Multer.File, cb: any) => void;
    limits: {
        fileSize: number;
    };
};
