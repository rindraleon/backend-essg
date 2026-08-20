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
const slug_util_1 = require("../common/utils/slug.util");
const duplicate_util_1 = require("../common/utils/duplicate.util");
const email_domain_service_1 = require("../common/validators/email-domain.service");
const search_util_1 = require("../common/utils/search.util");
function normalizeList(values) {
    if (!values)
        return undefined;
    const seen = new Set();
    return values
        .map((value) => value.trim())
        .filter((value) => {
        if (!value)
            return false;
        const key = value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
function normalizeExperiences(values) {
    if (!values)
        return undefined;
    return values
        .filter((item) => item?.poste?.trim())
        .map((item) => ({
        poste: (0, text_util_1.capitalize)(item.poste.trim()),
        organisation: item.organisation?.trim() || undefined,
        periode: item.periode?.trim() || undefined,
    }));
}
let RessourcesHumainesService = class RessourcesHumainesService {
    repo;
    emailDomainService;
    constructor(repo, emailDomainService) {
        this.repo = repo;
        this.emailDomainService = emailDomainService;
    }
    async assertEmailDomainExists(email) {
        if (!email)
            return;
        const result = await this.emailDomainService.check(email);
        if (result.reason) {
            throw new common_1.BadRequestException(result.reason);
        }
    }
    async findPaginated(where, paginationDto, defaultOrder = { ordre: 'DESC', id: 'DESC' }) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'DESC' } = paginationDto;
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
            .andWhere(`(ressource.nom ILIKE :search ${search_util_1.ILIKE_ESCAPE}
          OR ressource.prenom ILIKE :search ${search_util_1.ILIKE_ESCAPE}
          OR ressource.poste ILIKE :search ${search_util_1.ILIKE_ESCAPE})`, { search: (0, search_util_1.buildIlikeTerm)(query) })
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
        await this.assertEmailDomainExists(dto.email);
        await (0, duplicate_util_1.assertEmailIsAvailable)(this.repo, dto.email, 'une autre ressource humaine');
        await (0, duplicate_util_1.assertPhoneIsAvailable)(this.repo, dto.telephone, 'une autre ressource humaine');
        const item = this.repo.create({
            ...dto,
            nom: (0, text_util_1.toUpperCase)(dto.nom),
            prenom: (0, text_util_1.capitalize)(dto.prenom),
            poste: (0, text_util_1.capitalize)(dto.poste),
            description: dto.description ? (0, text_util_1.capitalize)(dto.description) : dto.description,
            slug: await (0, slug_util_1.buildUniqueSlug)(this.repo, `${dto.nom} ${dto.prenom}`),
            actif: dto.actif ?? true,
            ordre: dto.ordre ?? 0,
            photo: dto.photo || '',
            adresse: dto.adresse?.trim() || undefined,
            experiences: normalizeExperiences(dto.experiences) ?? [],
            formations: normalizeList(dto.formations) ?? [],
            diplomes: normalizeList(dto.diplomes) ?? [],
            competences: normalizeList(dto.competences) ?? [],
            langues: normalizeList(dto.langues) ?? [],
        });
        return this.repo.save(item);
    }
    async update(id, dto) {
        const current = await this.findOne(id);
        await this.assertEmailDomainExists(dto.email);
        await (0, duplicate_util_1.assertEmailIsAvailable)(this.repo, dto.email, 'une autre ressource humaine', {
            excludeId: id,
        });
        await (0, duplicate_util_1.assertPhoneIsAvailable)(this.repo, dto.telephone, 'une autre ressource humaine', {
            excludeId: id,
        });
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
        if (dto.experiences)
            updateData.experiences = normalizeExperiences(dto.experiences);
        if (dto.formations)
            updateData.formations = normalizeList(dto.formations);
        if (dto.diplomes)
            updateData.diplomes = normalizeList(dto.diplomes);
        if (dto.competences)
            updateData.competences = normalizeList(dto.competences);
        if (dto.langues)
            updateData.langues = normalizeList(dto.langues);
        const nextFullName = `${dto.nom ?? current.nom} ${dto.prenom ?? current.prenom}`;
        const currentFullName = `${current.nom} ${current.prenom}`;
        if ((0, slug_util_1.shouldRegenerateSlug)(currentFullName, nextFullName, current.slug)) {
            updateData.slug = await (0, slug_util_1.buildUniqueSlug)(this.repo, nextFullName, { excludeId: id });
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
    __metadata("design:paramtypes", [typeorm_2.Repository,
        email_domain_service_1.EmailDomainService])
], RessourcesHumainesService);
//# sourceMappingURL=ressources-humaines.service.js.map