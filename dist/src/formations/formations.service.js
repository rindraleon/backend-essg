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
const slug_util_1 = require("../common/utils/slug.util");
const formation_mentions_constant_1 = require("./formation-mentions.constant");
const formation_entity_1 = require("./entities/formation.entity");
const ressource_humaine_entity_1 = require("../ressources-humaines/entities/ressource-humaine.entity");
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
    ressourceRepo;
    constructor(repo, ressourceRepo) {
        this.repo = repo;
        this.ressourceRepo = ressourceRepo;
    }
    async resolveResponsable(responsableId) {
        if (responsableId === undefined)
            return null;
        if (responsableId === null)
            return { responsableId: null, responsable: '' };
        const ressource = await this.ressourceRepo.findOne({
            where: { id: responsableId },
            select: ['id', 'nom', 'prenom'],
        });
        if (!ressource) {
            throw new common_1.BadRequestException("La ressource humaine sélectionnée est introuvable.");
        }
        return {
            responsableId: ressource.id,
            responsable: `${ressource.prenom} ${ressource.nom}`.trim(),
        };
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
        const term = (0, search_util_1.buildIlikeTerm)(query);
        const [data, total] = await this.repo
            .createQueryBuilder('formation')
            .where(`formation.titre ILIKE :query ${search_util_1.ILIKE_ESCAPE}`, { query: term })
            .orWhere(`formation.description ILIKE :query ${search_util_1.ILIKE_ESCAPE}`, { query: term })
            .orWhere(`formation.mention ILIKE :query ${search_util_1.ILIKE_ESCAPE}`, { query: term })
            .orWhere(`formation.domaine::text ILIKE :query ${search_util_1.ILIKE_ESCAPE}`, { query: term })
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
        const { titre, mention } = this.resolveHierarchy(dto.titre, dto.mention);
        const slug = await (0, slug_util_1.buildUniqueSlug)(this.repo, titre);
        const responsableInfo = await this.resolveResponsable(dto.responsableId);
        const item = this.repo.create({
            ...dto,
            slug,
            mention,
            titre,
            duree: (0, text_util_1.capitalize)(dto.duree),
            description: (0, text_util_1.capitalize)(dto.description),
            ...(responsableInfo ?? {
                responsable: dto.responsable ? (0, text_util_1.capitalize)(dto.responsable) : dto.responsable,
            }),
            domaine: dto.domaine?.length ? (0, text_util_1.capitalizeArray)(dto.domaine) : [mention],
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
        delete updateData.slug;
        if (dto.titre !== undefined || dto.mention !== undefined) {
            const { titre, mention } = this.resolveHierarchy(dto.titre ?? current.titre, dto.mention ?? current.mention);
            updateData.titre = titre;
            updateData.mention = mention;
            if (!dto.domaine) {
                updateData.domaine = [mention];
            }
        }
        if ((0, slug_util_1.shouldRegenerateSlug)(current.titre, updateData.titre, current.slug)) {
            updateData.slug = await (0, slug_util_1.buildUniqueSlug)(this.repo, updateData.titre ?? current.titre, {
                excludeId: id,
            });
        }
        if (dto.duree)
            updateData.duree = (0, text_util_1.capitalize)(dto.duree);
        if (dto.description)
            updateData.description = (0, text_util_1.capitalize)(dto.description);
        const responsableInfo = await this.resolveResponsable(dto.responsableId);
        if (responsableInfo) {
            updateData.responsableId = responsableInfo.responsableId;
            updateData.responsable = responsableInfo.responsable;
        }
        else if (dto.responsable) {
            updateData.responsable = (0, text_util_1.capitalize)(dto.responsable);
        }
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
    resolveHierarchy(rawTitre, rawMention) {
        const titre = (0, formation_mentions_constant_1.canonicalTitre)(rawTitre.trim());
        const deduced = (0, formation_mentions_constant_1.findMentionByTitre)(titre);
        if (!rawMention) {
            return { titre, mention: deduced?.label ?? '' };
        }
        const mention = (0, formation_mentions_constant_1.canonicalMentionLabel)(rawMention.trim());
        if (deduced && !(0, formation_mentions_constant_1.isTitreInMention)(mention, titre)) {
            throw new common_1.BadRequestException(`Le titre « ${titre} » appartient à la mention « ${deduced.label} » et non à « ${mention} ».`);
        }
        return { titre, mention };
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
    __param(1, (0, typeorm_1.InjectRepository)(ressource_humaine_entity_1.RessourceHumaine)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FormationsService);
//# sourceMappingURL=formations.service.js.map