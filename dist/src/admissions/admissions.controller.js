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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdmissionsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const api_message_decorator_1 = require("../common/decorators/api-message.decorator");
const multer_config_1 = require("../common/storage/multer.config");
const storage_service_1 = require("../common/storage/storage.service");
const admissions_service_1 = require("./admissions.service");
const create_admission_dto_1 = require("./dto/create-admission.dto");
const update_admission_status_dto_1 = require("./dto/update-admission-status.dto");
let AdmissionsController = class AdmissionsController {
    admissionsService;
    storageService;
    constructor(admissionsService, storageService) {
        this.admissionsService = admissionsService;
        this.storageService = storageService;
    }
    async create(createAdmissionDto, files) {
        const cv = files?.cv?.[0];
        const lettre = files?.lettreMotivation?.[0];
        if (cv) {
            const result = await this.storageService.upload(cv.buffer, cv.originalname, {
                mimetype: cv.mimetype,
            });
            createAdmissionDto.cvPath = result.url;
        }
        if (lettre) {
            const result = await this.storageService.upload(lettre.buffer, lettre.originalname, {
                mimetype: lettre.mimetype,
            });
            createAdmissionDto.lettreMotivationPath = result.url;
        }
        return this.admissionsService.create(createAdmissionDto);
    }
    findAll() {
        return this.admissionsService.findAll();
    }
    findOne(id) {
        return this.admissionsService.findOne(id);
    }
    updateStatus(id, updateAdmissionStatusDto) {
        return this.admissionsService.updateStatus(id, updateAdmissionStatusDto);
    }
    remove(id) {
        return this.admissionsService.remove(id);
    }
};
exports.AdmissionsController = AdmissionsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_message_decorator_1.ApiMessage)('Candidature enregistrée avec succès'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'cv', maxCount: 1 },
        { name: 'lettreMotivation', maxCount: 1 },
    ], multer_config_1.documentUploadOptions)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admission_dto_1.CreateAdmissionDto, Object]),
    __metadata("design:returntype", Promise)
], AdmissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, api_message_decorator_1.ApiMessage)('Candidatures récupérées'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdmissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, api_message_decorator_1.ApiMessage)('Candidature récupérée'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdmissionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, api_message_decorator_1.ApiMessage)('Statut de la candidature mis à jour'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_admission_status_dto_1.UpdateAdmissionStatusDto]),
    __metadata("design:returntype", void 0)
], AdmissionsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, api_message_decorator_1.ApiMessage)('Candidature supprimée'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdmissionsController.prototype, "remove", null);
exports.AdmissionsController = AdmissionsController = __decorate([
    (0, common_1.Controller)('admissions'),
    __metadata("design:paramtypes", [admissions_service_1.AdmissionsService,
        storage_service_1.StorageService])
], AdmissionsController);
//# sourceMappingURL=admissions.controller.js.map