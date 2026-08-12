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
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pagination_util_1 = require("../common/utils/pagination.util");
const news_item_entity_1 = require("./entities/news-item.entity");
const text_util_1 = require("../common/utils/text.util");
function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
let NewsService = class NewsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async findPaginated(where, paginationDto) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const [data, total] = await this.repo.findAndCount({
            where,
            order: sortBy ? { [sortBy]: sortOrder } : { date: 'DESC' },
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
            ? [{ titre: (0, typeorm_2.ILike)(`%${query}%`) }, { contenu: (0, typeorm_2.ILike)(`%${query}%`) }]
            : [{}];
        return this.findPaginated(where, paginationDto);
    }
    async findOne(id) {
        const item = await this.repo.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Actualité non trouvée');
        return item;
    }
    async findBySlug(slug) {
        const item = await this.repo.findOne({ where: { slug } });
        if (!item)
            throw new common_1.NotFoundException('Actualité non trouvée');
        return item;
    }
    async create(dto) {
        const item = this.repo.create({
            ...dto,
            slug: dto.slug || generateSlug(dto.titre),
            titre: (0, text_util_1.capitalize)(dto.titre),
            categorie: (0, text_util_1.capitalize)(dto.categorie),
            auteur: (0, text_util_1.capitalize)(dto.auteur),
            resume: dto.resume ? (0, text_util_1.capitalize)(dto.resume) : dto.resume,
            contenu: (0, text_util_1.capitalize)(dto.contenu),
            enVedette: dto.enVedette ?? false,
            statut: dto.statut ?? false,
            image: dto.image || '/images/hero-campus.jpg',
        });
        return this.repo.save(item);
    }
    async update(id, dto) {
        await this.findOne(id);
        const updateData = { ...dto };
        if (dto.titre) {
            updateData.titre = (0, text_util_1.capitalize)(dto.titre);
            updateData.slug = generateSlug(dto.titre);
        }
        if (dto.categorie)
            updateData.categorie = (0, text_util_1.capitalize)(dto.categorie);
        if (dto.auteur)
            updateData.auteur = (0, text_util_1.capitalize)(dto.auteur);
        if (dto.resume)
            updateData.resume = (0, text_util_1.capitalize)(dto.resume);
        if (dto.contenu)
            updateData.contenu = (0, text_util_1.capitalize)(dto.contenu);
        await this.repo.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.repo.delete(id);
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(news_item_entity_1.Actualite)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NewsService);
//# sourceMappingURL=news.service.js.map