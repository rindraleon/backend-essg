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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const api_message_decorator_1 = require("../common/decorators/api-message.decorator");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const multer_config_1 = require("../common/storage/multer.config");
const storage_service_1 = require("../common/storage/storage.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
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
    findOne(id, req) {
        if (req.user.role !== 'admin' && req.user.userId !== id) {
            throw new common_1.ForbiddenException('Vous ne pouvez consulter que votre propre profil');
        }
        return this.service.findOne(id);
    }
    create(dto) {
        return this.service.create(dto);
    }
    async update(id, dto, req) {
        if (req.user.role !== 'admin' && req.user.userId !== id) {
            throw new common_1.ForbiddenException('Vous ne pouvez modifier que votre propre profil');
        }
        return this.service.update(id, dto);
    }
    async uploadAvatar(id, file, req) {
        if (req.user.role !== 'admin' && req.user.userId !== id) {
            throw new common_1.ForbiddenException('Vous ne pouvez modifier que votre propre avatar');
        }
        if (!file) {
            throw new common_1.ForbiddenException('Aucun fichier fourni. Envoyez une image (JPG, PNG, GIF ou WebP).');
        }
        const result = await this.storageService.upload(file.buffer, file.originalname, {
            mimetype: file.mimetype,
        });
        return this.service.updateAvatar(id, result.url);
    }
    async remove(id) {
        const current = await this.service.findOne(id);
        await this.service.remove(id);
        await this.storageService.deleteStoredRef(current.avatar);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(),
    (0, api_message_decorator_1.ApiMessage)('Utilisateurs récupérés'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)('search'),
    (0, api_message_decorator_1.ApiMessage)('Recherche effectuée'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, api_message_decorator_1.ApiMessage)('Utilisateur récupéré'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_message_decorator_1.ApiMessage)('Utilisateur créé avec succès'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUtilisateurDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, api_message_decorator_1.ApiMessage)('Utilisateur mis à jour'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_dto_1.UpdateUtilisateurDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/avatar'),
    (0, api_message_decorator_1.ApiMessage)('Avatar mis à jour'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', multer_config_1.imageUploadOptions)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Delete)(':id'),
    (0, api_message_decorator_1.ApiMessage)('Utilisateur supprimé'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        storage_service_1.StorageService])
], UsersController);
//# sourceMappingURL=users.controller.js.map