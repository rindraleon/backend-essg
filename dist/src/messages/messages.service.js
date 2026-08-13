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
var MessagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pagination_util_1 = require("../common/utils/pagination.util");
const search_util_1 = require("../common/utils/search.util");
const mail_service_1 = require("../mail/mail.service");
const message_entity_1 = require("./entities/message.entity");
const text_util_1 = require("../common/utils/text.util");
const MESSAGE_SORT_FIELDS = ['id', 'nom', 'prenom', 'email', 'sujet', 'lu', 'creeLe', 'misAJourLe'];
let MessagesService = MessagesService_1 = class MessagesService {
    repo;
    mailService;
    logger = new common_1.Logger(MessagesService_1.name);
    constructor(repo, mailService) {
        this.repo = repo;
        this.mailService = mailService;
    }
    async findFiltered(queryDto = {}) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'DESC', q, sujet, lu, dateDebut, dateFin, } = queryDto;
        const qb = this.repo.createQueryBuilder('message');
        if (q?.trim()) {
            const term = (0, search_util_1.buildIlikeTerm)(q);
            qb.andWhere(`(message.nom ILIKE :term ESCAPE '\\\\'
          OR message.prenom ILIKE :term ESCAPE '\\\\'
          OR message.email ILIKE :term ESCAPE '\\\\'
          OR message.telephone ILIKE :term ESCAPE '\\\\'
          OR message.sujet ILIKE :term ESCAPE '\\\\'
          OR message.message ILIKE :term ESCAPE '\\\\')`, { term });
        }
        if (sujet && sujet !== 'all') {
            qb.andWhere('LOWER(message.sujet) = LOWER(:sujet)', { sujet });
        }
        if (typeof lu === 'boolean') {
            qb.andWhere('message.lu = :lu', { lu });
        }
        if (dateDebut) {
            qb.andWhere('message.creeLe >= :dateDebut', { dateDebut });
        }
        if (dateFin) {
            qb.andWhere('message.creeLe <= :dateFin', { dateFin: `${dateFin}T23:59:59.999Z` });
        }
        const orderField = (0, search_util_1.sanitizeSortField)(sortBy, MESSAGE_SORT_FIELDS) ?? 'creeLe';
        qb.orderBy(`message.${orderField}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');
        qb.skip((page - 1) * limit).take(limit);
        const [items, total] = await qb.getManyAndCount();
        return (0, pagination_util_1.buildPaginatedData)(items, total, page, limit);
    }
    async findAll(queryDto = {}) {
        return this.findFiltered(queryDto);
    }
    async search(query, queryDto = {}) {
        return this.findFiltered({ ...queryDto, q: query || queryDto.q });
    }
    async findOne(id) {
        const item = await this.repo.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Message non trouvé');
        return item;
    }
    async create(dto) {
        const item = this.repo.create({
            ...dto,
            nom: (0, text_util_1.toUpperCase)(dto.nom),
            prenom: (0, text_util_1.capitalize)(dto.prenom),
            sujet: (0, text_util_1.capitalize)(dto.sujet),
            message: (0, text_util_1.capitalize)(dto.message),
        });
        const saved = await this.repo.save(item);
        try {
            await this.mailService.sendMessageReceiptEmail(saved.email, {
                nom: saved.nom,
                prenom: saved.prenom,
                sujet: saved.sujet,
            });
            this.logger.log(`Accusé de réception envoyé à ${saved.email}`);
        }
        catch (error) {
            this.logger.error(`Échec de l'envoi de l'accusé de réception à ${saved.email}`, error);
        }
        return saved;
    }
    async update(id, dto, reader) {
        const item = await this.findOne(id);
        if (dto.lu && !item.lu) {
            item.lu = true;
            item.luLe = new Date();
            item.luPar = reader?.email ?? item.luPar;
        }
        else if (dto.lu === false) {
            item.lu = false;
        }
        return this.repo.save(item);
    }
    async reply(id, dto, author) {
        const item = await this.findOne(id);
        const sujet = dto.sujet?.trim() || `Re : ${item.sujet}`;
        await this.mailService.sendMessageReplyEmail({
            to: item.email,
            prenom: item.prenom,
            nom: item.nom,
            sujet,
            message: dto.message,
        });
        item.lu = true;
        item.luLe = item.luLe ?? new Date();
        item.luPar = item.luPar ?? author.email;
        item.reponse = dto.message;
        item.reponseSujet = sujet;
        item.reponduLe = new Date();
        item.reponduPar = author.email;
        return this.repo.save(item);
    }
    async remove(id) {
        await this.findOne(id);
        await this.repo.delete(id);
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = MessagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        mail_service_1.MailService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map