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
const pagination_util_1 = require("../common/utils/pagination.util");
const search_util_1 = require("../common/utils/search.util");
const text_util_1 = require("../common/utils/text.util");
const formation_entity_1 = require("./entities/formation.entity");
const FORMATION_SORT_FIELDS = [
    'id',
    'titre',
    'slug',
    'niveau',
    'duree',
    'credits',
    'enVedette',
    'creeLe',
    'misAJourLe',
];
let FormationsService = class FormationsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async findAll(paginationDto) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const orderField = (0, search_util_1.sanitizeSortField)(sortBy, FORMATION_SORT_FIELDS) ?? 'id';
        const [data, total] = await this.repo.findAndCount({
            order: { [orderField]: sortOrder === 'DESC' ? 'DESC' : 'ASC' },
            skip,
            take: limit,
        });
        return (0, pagination_util_1.buildPaginatedData)(data, total, page, limit);
    }
    async search(query, paginationDto) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        if (!query?.trim()) {
            return this.findAll(paginationDto);
        }
        const orderField = (0, search_util_1.sanitizeSortField)(sortBy, FORMATION_SORT_FIELDS) ?? 'id';
        const term = `%${query.trim()}%`;
        const [data, total] = await this.repo
            .createQueryBuilder('formation')
            .where('LOWER(formation.titre) LIKE LOWER(:query)', { query: term })
            .orWhere('LOWER(formation.description) LIKE LOWER(:query)', { query: term })
            .orWhere('formation.domaine::text LIKE LOWER(:query)', { query: term })
            .orderBy(`formation.${orderField}`, sortOrder === 'DESC' ? 'DESC' : 'ASC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return (0, pagination_util_1.buildPaginatedData)(data, total, page, limit);
    }
    async findOne(id) {
        const item = await this.repo.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Formation non trouvée');
        return item;
    }
    async findBySlug(slug) {
        const item = await this.repo.findOne({ where: { slug } });
        if (!item)
            throw new common_1.NotFoundException('Formation non trouvée');
        return item;
    }
    async create(dto) {
        const slug = dto.slug?.trim() ? (0, text_util_1.slugify)(dto.slug) : (0, text_util_1.slugify)(dto.titre);
        const item = this.repo.create({
            ...dto,
            slug,
            titre: (0, text_util_1.capitalize)(dto.titre),
            duree: (0, text_util_1.capitalize)(dto.duree),
            description: (0, text_util_1.capitalize)(dto.description),
            responsable: dto.responsable ? (0, text_util_1.capitalize)(dto.responsable) : dto.responsable,
            domaine: (0, text_util_1.capitalizeArray)(dto.domaine),
            objectifs: (0, text_util_1.capitalizeArray)(dto.objectifs),
            debouches: (0, text_util_1.capitalizeArray)(dto.debouches),
            conditions: (0, text_util_1.capitalizeArray)(dto.conditions),
            competences: (0, text_util_1.capitalizeArray)(dto.competences),
            programme: (0, text_util_1.capitalizeArray)(dto.programme),
            image: dto.image || '/images/hero-campus.jpg',
        });
        return this.saveOrConflict(item);
    }
    async update(id, dto) {
        const current = await this.findOne(id);
        const updateData = { ...dto };
        if (dto.titre)
            updateData.titre = (0, text_util_1.capitalize)(dto.titre);
        if (dto.duree)
            updateData.duree = (0, text_util_1.capitalize)(dto.duree);
        if (dto.description)
            updateData.description = (0, text_util_1.capitalize)(dto.description);
        if (dto.responsable)
            updateData.responsable = (0, text_util_1.capitalize)(dto.responsable);
        if (dto.domaine)
            updateData.domaine = (0, text_util_1.capitalizeArray)(dto.domaine);
        if (dto.objectifs)
            updateData.objectifs = (0, text_util_1.capitalizeArray)(dto.objectifs);
        if (dto.debouches)
            updateData.debouches = (0, text_util_1.capitalizeArray)(dto.debouches);
        if (dto.conditions)
            updateData.conditions = (0, text_util_1.capitalizeArray)(dto.conditions);
        if (dto.competences)
            updateData.competences = (0, text_util_1.capitalizeArray)(dto.competences);
        if (dto.programme)
            updateData.programme = (0, text_util_1.capitalizeArray)(dto.programme);
        if (dto.slug?.trim()) {
            updateData.slug = (0, text_util_1.slugify)(dto.slug);
        }
        else if (dto.titre && !current.slug) {
            updateData.slug = (0, text_util_1.slugify)(dto.titre);
        }
        try {
            await this.repo.update(id, updateData);
        }
        catch (error) {
            this.rethrowUnique(error);
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.repo.delete(id);
    }
    async saveOrConflict(item) {
        try {
            return await this.repo.save(item);
        }
        catch (error) {
            this.rethrowUnique(error);
            throw error;
        }
    }
    rethrowUnique(error) {
        if (error instanceof typeorm_2.QueryFailedError) {
            const code = error.driverError?.code;
            if (code === '23505') {
                throw new common_1.ConflictException('Une formation avec ce slug existe déjà.');
            }
        }
    }
};
exports.FormationsService = FormationsService;
exports.FormationsService = FormationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(formation_entity_1.Formation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FormationsService);
//# sourceMappingURL=formations.service.js.map