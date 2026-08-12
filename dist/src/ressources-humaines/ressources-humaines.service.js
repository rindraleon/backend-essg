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
const pagination_util_1 = require("../common/utils/pagination.util");
const ressource_humaine_entity_1 = require("./entities/ressource-humaine.entity");
const text_util_1 = require("../common/utils/text.util");
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
    async findPaginated(where, paginationDto, defaultOrder = { ordre: 'ASC', id: 'ASC' }) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const [data, total] = await this.repo.findAndCount({
            where,
            order: sortBy ? { [sortBy]: sortOrder } : defaultOrder,
            skip,
            take: limit,
        });
        return (0, pagination_util_1.buildPaginatedData)(data, total, page, limit);
    }
    async findAll(paginationDto) {
        return this.findPaginated({ actif: true }, paginationDto);
    }
    async findAllIncludingInactive(paginationDto) {
        return this.findPaginated({}, paginationDto);
    }
    async search(query, paginationDto) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        if (!query) {
            return this.findAll(paginationDto);
        }
        const [data, total] = await this.repo
            .createQueryBuilder('ressource')
            .where('ressource.actif = :actif', { actif: true })
            .andWhere('(ressource.nom ILIKE :search OR ressource.prenom ILIKE :search OR ressource.poste ILIKE :search)', { search: `%${query}%` })
            .orderBy(sortBy ? `ressource.${sortBy}` : 'ressource.ordre', sortOrder)
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return (0, pagination_util_1.buildPaginatedData)(data, total, page, limit);
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
        const item = this.repo.create({
            ...dto,
            nom: (0, text_util_1.toUpperCase)(dto.nom),
            prenom: (0, text_util_1.capitalize)(dto.prenom),
            poste: (0, text_util_1.capitalize)(dto.poste),
            description: dto.description ? (0, text_util_1.capitalize)(dto.description) : dto.description,
            slug: generateSlug(dto.nom, dto.prenom),
            actif: dto.actif ?? true,
            ordre: dto.ordre ?? 0,
            photo: dto.photo || '',
        });
        return this.repo.save(item);
    }
    async update(id, dto) {
        const current = await this.findOne(id);
        const updateData = { ...dto };
        if (dto.nom) {
            updateData.nom = (0, text_util_1.toUpperCase)(dto.nom);
        }
        if (dto.prenom) {
            updateData.prenom = (0, text_util_1.capitalize)(dto.prenom);
        }
        if (dto.poste) {
            updateData.poste = (0, text_util_1.capitalize)(dto.poste);
        }
        if (dto.description) {
            updateData.description = (0, text_util_1.capitalize)(dto.description);
        }
        if (dto.nom || dto.prenom) {
            updateData.slug = generateSlug((0, text_util_1.toUpperCase)(dto.nom || current.nom), (0, text_util_1.capitalize)(dto.prenom || current.prenom));
        }
        await this.repo.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
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