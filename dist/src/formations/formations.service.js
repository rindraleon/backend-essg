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
exports.FormationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const formation_entity_1 = require("./entities/formation.entity");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let FormationsService = class FormationsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async findAll(paginationDto) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const [data, total] = await this.repo.findAndCount({
            order: sortBy ? { [sortBy]: sortOrder } : { id: 'ASC' },
            skip,
            take: limit,
        });
        return new pagination_dto_1.PaginationResponse(data, total, page, limit);
    }
    async search(query, paginationDto) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        if (!query) {
            const [data, total] = await this.repo.findAndCount({
                order: sortBy ? { [sortBy]: sortOrder } : { id: 'ASC' },
                skip,
                take: limit,
            });
            return new pagination_dto_1.PaginationResponse(data, total, page, limit);
        }
        const [data, total] = await this.repo
            .createQueryBuilder('formation')
            .where('LOWER(formation.titre) LIKE LOWER(:query)', { query: `%${query}%` })
            .orWhere('LOWER(formation.description) LIKE LOWER(:query)', { query: `%${query}%` })
            .orWhere('formation.domaine::text LIKE LOWER(:query)', { query: `%${query}%` })
            .orderBy(sortBy ? `formation.${sortBy}` : 'formation.id', sortOrder)
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return new pagination_dto_1.PaginationResponse(data, total, page, limit);
    }
    async findOne(id) {
        const item = await this.repo.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Formation not found');
        return item;
    }
    async findBySlug(slug) {
        const item = await this.repo.findOne({ where: { slug } });
        if (!item)
            throw new common_1.NotFoundException('Formation not found');
        return item;
    }
    async create(dto) {
        const item = this.repo.create(dto);
        return this.repo.save(item);
    }
    async update(id, dto) {
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.repo.delete(id);
    }
};
exports.FormationsService = FormationsService;
exports.FormationsService = FormationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(formation_entity_1.Formation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FormationsService);
//# sourceMappingURL=formations.service.js.map