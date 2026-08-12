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
exports.PartnersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pagination_util_1 = require("../common/utils/pagination.util");
const partner_entity_1 = require("./entities/partner.entity");
const text_util_1 = require("../common/utils/text.util");
const generateSlug = (text) => text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
let PartnersService = class PartnersService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async findPaginated(where, paginationDto) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const [data, total] = await this.repo.findAndCount({
            where,
            order: sortBy ? { [sortBy]: sortOrder } : { id: 'ASC' },
            skip,
            take: limit,
        });
        return (0, pagination_util_1.buildPaginatedData)(data, total, page, limit);
    }
    async findAll(paginationDto) {
        return this.findPaginated({}, paginationDto);
    }
    async search(query, paginationDto) {
        const where = query
            ? [{ nom: (0, typeorm_2.ILike)(`%${query}%`) }, { description: (0, typeorm_2.ILike)(`%${query}%`) }]
            : [{}];
        return this.findPaginated(where, paginationDto);
    }
    async findOne(id) {
        const item = await this.repo.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Partenaire non trouvé');
        return item;
    }
    async findBySlug(slug) {
        const item = await this.repo.findOne({ where: { slug } });
        if (!item)
            throw new common_1.NotFoundException('Partenaire non trouvé');
        return item;
    }
    async findByName(nom) {
        const item = await this.repo.findOne({ where: { nom } });
        if (!item)
            throw new common_1.NotFoundException('Partenaire non trouvé');
        return item;
    }
    async create(dto) {
        const slug = dto.slug || generateSlug(dto.nom);
        const item = this.repo.create({
            ...dto,
            nom: (0, text_util_1.toUpperCase)(dto.nom),
            secteur: (0, text_util_1.capitalize)(dto.secteur),
            description: (0, text_util_1.capitalize)(dto.description),
            slug,
            dateDebut: new Date(dto.dateDebut),
        });
        return this.repo.save(item);
    }
    async update(id, dto) {
        await this.findOne(id);
        const slug = dto.slug || generateSlug(dto.nom);
        await this.repo.update(id, {
            ...dto,
            nom: (0, text_util_1.toUpperCase)(dto.nom),
            secteur: (0, text_util_1.capitalize)(dto.secteur),
            description: (0, text_util_1.capitalize)(dto.description),
            slug,
            dateDebut: new Date(dto.dateDebut),
        });
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.repo.delete(id);
    }
};
exports.PartnersService = PartnersService;
exports.PartnersService = PartnersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(partner_entity_1.Partenaire)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PartnersService);
//# sourceMappingURL=partners.service.js.map