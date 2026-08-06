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
exports.RessourcesHumainesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ressource_humaine_entity_1 = require("./entities/ressource-humaine.entity");
const pagination_dto_1 = require("../common/dto/pagination.dto");
function generateSlug(nom, prenom) {
    return `${nom}-${prenom}`
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
let RessourcesHumainesService = class RessourcesHumainesService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async findAll(paginationDto) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const [data, total] = await this.repo.findAndCount({
            where: { actif: true },
            order: sortBy ? { [sortBy]: sortOrder } : { ordre: 'ASC', id: 'ASC' },
            skip,
            take: limit,
        });
        return new pagination_dto_1.PaginationResponse(data, total, page, limit);
    }
    async findAllIncludingInactive(paginationDto) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const [data, total] = await this.repo.findAndCount({
            order: sortBy ? { [sortBy]: sortOrder } : { ordre: 'ASC', id: 'ASC' },
            skip,
            take: limit,
        });
        return new pagination_dto_1.PaginationResponse(data, total, page, limit);
    }
    async search(query, paginationDto) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const whereCondition = { actif: true };
        if (query) {
            const searchTerm = `%${query}%`;
            return this.repo
                .createQueryBuilder('ressource')
                .where('ressource.actif = :actif', { actif: true })
                .andWhere('(ressource.nom ILIKE :search OR ressource.prenom ILIKE :search OR ressource.poste ILIKE :search)', { search: searchTerm })
                .orderBy(sortBy ? `ressource.${sortBy}` : 'ressource.ordre', sortOrder)
                .skip(skip)
                .take(limit)
                .getManyAndCount()
                .then(([data, total]) => new pagination_dto_1.PaginationResponse(data, total, page, limit));
        }
        const [data, total] = await this.repo.findAndCount({
            where: whereCondition,
            order: sortBy ? { [sortBy]: sortOrder } : { ordre: 'ASC', id: 'ASC' },
            skip,
            take: limit,
        });
        return new pagination_dto_1.PaginationResponse(data, total, page, limit);
    }
    async findOne(id) {
        const item = await this.repo.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Ressource humaine non trouvée');
        return item;
    }
    async findBySlug(slug) {
        const item = await this.repo.findOne({ where: { slug } });
        if (!item)
            throw new common_1.NotFoundException('Ressource humaine non trouvée');
        return item;
    }
    async create(dto) {
        const slug = generateSlug(dto.nom, dto.prenom);
        const item = this.repo.create({
            ...dto,
            slug,
            actif: dto.actif ?? true,
            ordre: dto.ordre ?? 0,
            photo: dto.photo || '',
        });
        return this.repo.save(item);
    }
    async update(id, dto) {
        const updateData = { ...dto };
        if (dto.nom || dto.prenom) {
            const current = await this.findOne(id);
            const nom = dto.nom || current.nom;
            const prenom = dto.prenom || current.prenom;
            updateData.slug = generateSlug(nom, prenom);
        }
        if (dto.actif !== undefined) {
            updateData.actif = dto.actif;
        }
        if (dto.ordre !== undefined) {
            updateData.ordre = dto.ordre;
        }
        if (dto.photo !== undefined) {
            updateData.photo = dto.photo || '';
        }
        await this.repo.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        await this.repo.delete(id);
    }
};
exports.RessourcesHumainesService = RessourcesHumainesService;
exports.RessourcesHumainesService = RessourcesHumainesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ressource_humaine_entity_1.RessourceHumaine)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RessourcesHumainesService);
//# sourceMappingURL=ressources-humaines.service.js.map