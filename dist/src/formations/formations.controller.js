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
exports.FormationsController = void 0;
const common_1 = require("@nestjs/common");
const api_message_decorator_1 = require("../common/decorators/api-message.decorator");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const create_formation_dto_1 = require("./dto/create-formation.dto");
const formations_service_1 = require("./formations.service");
const formation_mentions_constant_1 = require("./formation-mentions.constant");
let FormationsController = class FormationsController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(paginationDto) {
        return this.service.findAll(paginationDto);
    }
    findMentions() {
        return formation_mentions_constant_1.FORMATION_MENTIONS;
    }
    search(query, paginationDto) {
        return this.service.search(query, paginationDto);
    }
    findBySlug(slug) {
        return this.service.findBySlug(slug);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    create(dto) {
        return this.service.create(dto);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.FormationsController = FormationsController;
__decorate([
    (0, common_1.Get)(),
    (0, api_message_decorator_1.ApiMessage)('Formations récupérées'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], FormationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('mentions'),
    (0, api_message_decorator_1.ApiMessage)('Mentions récupérées'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FormationsController.prototype, "findMentions", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, api_message_decorator_1.ApiMessage)('Recherche effectuée'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], FormationsController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    (0, api_message_decorator_1.ApiMessage)('Formation récupérée'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FormationsController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, api_message_decorator_1.ApiMessage)('Formation récupérée'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FormationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, api_message_decorator_1.ApiMessage)('Formation créée avec succès'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_formation_dto_1.CreateFormationDto]),
    __metadata("design:returntype", void 0)
], FormationsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id'),
    (0, api_message_decorator_1.ApiMessage)('Formation mise à jour'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_formation_dto_1.UpdateFormationDto]),
    __metadata("design:returntype", void 0)
], FormationsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    (0, api_message_decorator_1.ApiMessage)('Formation supprimée'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FormationsController.prototype, "remove", null);
exports.FormationsController = FormationsController = __decorate([
    (0, common_1.Controller)('formations'),
    __metadata("design:paramtypes", [formations_service_1.FormationsService])
], FormationsController);
//# sourceMappingURL=formations.controller.js.map