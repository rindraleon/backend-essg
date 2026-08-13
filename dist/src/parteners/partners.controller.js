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
exports.PartnersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const api_message_decorator_1 = require("../common/decorators/api-message.decorator");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const multer_config_1 = require("../common/storage/multer.config");
const storage_constants_1 = require("../common/storage/storage.constants");
const storage_service_1 = require("../common/storage/storage.service");
const create_partner_dto_1 = require("./dto/create-partner.dto");
const partners_service_1 = require("./partners.service");
let PartnersController = class PartnersController {
    service;
    storageService;
    constructor(service, storageService) {
        this.service = service;
        this.storageService = storageService;
    }
    findAll(paginationDto) {
        return this.service.findAll(paginationDto);
    }
    search(query, paginationDto) {
        return this.service.search(query, paginationDto);
    }
    findBySlug(slug) {
        return this.service.findBySlug(slug);
    }
    findByName(nom) {
        return this.service.findByName(nom);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    async create(dto, file) {
        if (file) {
            const result = await this.storageService.upload(file.buffer, file.originalname, {
                mimetype: file.mimetype,
                prefix: storage_constants_1.STORAGE_PREFIXES.partners,
            });
            dto.logo = result.url;
        }
        return this.service.create(dto);
    }
    async update(id, dto, file) {
        if (file) {
            const current = await this.service.findOne(id);
            const result = await this.storageService.upload(file.buffer, file.originalname, {
                mimetype: file.mimetype,
                prefix: storage_constants_1.STORAGE_PREFIXES.partners,
            });
            dto.logo = result.url;
            await this.storageService.deleteStoredRef(current.logo);
        }
        return this.service.update(id, dto);
    }
    async remove(id) {
        const current = await this.service.findOne(id);
        await this.service.remove(id);
        await this.storageService.deleteStoredRef(current.logo);
    }
};
exports.PartnersController = PartnersController;
__decorate([
    (0, common_1.Get)(),
    (0, api_message_decorator_1.ApiMessage)('Partenaires récupérés'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], PartnersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, api_message_decorator_1.ApiMessage)('Recherche effectuée'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], PartnersController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    (0, api_message_decorator_1.ApiMessage)('Partenaire récupéré'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PartnersController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)('name/:nom'),
    (0, api_message_decorator_1.ApiMessage)('Partenaire récupéré'),
    __param(0, (0, common_1.Param)('nom')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PartnersController.prototype, "findByName", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, api_message_decorator_1.ApiMessage)('Partenaire récupéré'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PartnersController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_message_decorator_1.ApiMessage)('Partenaire créé avec succès'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo', multer_config_1.imageUploadOptions)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_partner_dto_1.CreatePartenaireDto, Object]),
    __metadata("design:returntype", Promise)
], PartnersController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id'),
    (0, api_message_decorator_1.ApiMessage)('Partenaire mis à jour'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo', multer_config_1.imageUploadOptions)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_partner_dto_1.UpdatePartenaireDto, Object]),
    __metadata("design:returntype", Promise)
], PartnersController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    (0, api_message_decorator_1.ApiMessage)('Partenaire supprimé'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PartnersController.prototype, "remove", null);
exports.PartnersController = PartnersController = __decorate([
    (0, common_1.Controller)('partners'),
    __metadata("design:paramtypes", [partners_service_1.PartnersService,
        storage_service_1.StorageService])
], PartnersController);
//# sourceMappingURL=partners.controller.js.map