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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("./entities/message.entity");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const mail_service_1 = require("../mail/mail.service");
let MessagesService = class MessagesService {
    repo;
    mailService;
    constructor(repo, mailService) {
        this.repo = repo;
        this.mailService = mailService;
    }
    async findAll(paginationDto) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const [data, total] = await this.repo.findAndCount({
            order: sortBy ? { [sortBy]: sortOrder } : { creeLe: 'DESC' },
            skip,
            take: limit,
        });
        return new pagination_dto_1.PaginationResponse(data, total, page, limit);
    }
    async search(query, paginationDto) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const whereCondition = {};
        if (query) {
            whereCondition.nom = query;
            whereCondition.email = query;
            whereCondition.message = query;
        }
        const [data, total] = await this.repo.findAndCount({
            where: whereCondition,
            order: sortBy ? { [sortBy]: sortOrder } : { creeLe: 'DESC' },
            skip,
            take: limit,
        });
        return new pagination_dto_1.PaginationResponse(data, total, page, limit);
    }
    async findOne(id) {
        const item = await this.repo.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Message non trouvé');
        return item;
    }
    async create(dto) {
        const item = this.repo.create(dto);
        const saved = await this.repo.save(item);
        try {
            await this.mailService.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: saved.email,
                subject: 'Accusé de réception - ESSG',
                text: `Bonjour ${saved.prenom} ${saved.nom},\n\nNous avons bien reçu votre message concernant : ${saved.sujet}.\n\nNous vous répondrons dans les plus brefs délais.\n\nCordialement,\nL'équipe ESSG`,
            });
        }
        catch (error) {
            console.error("Erreur lors de l'envoi de l'accusé de réception", error);
        }
        return saved;
    }
    async update(id, dto) {
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.repo.delete(id);
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        mail_service_1.MailService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map