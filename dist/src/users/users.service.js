"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const pagination_util_1 = require("../common/utils/pagination.util");
const mail_service_1 = require("../mail/mail.service");
const user_entity_1 = require("./entities/user.entity");
const text_util_1 = require("../common/utils/text.util");
let UsersService = UsersService_1 = class UsersService {
    repo;
    mailService;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(repo, mailService) {
        this.repo = repo;
        this.mailService = mailService;
    }
    sanitizeUser(user) {
        const { motDePasse, ...rest } = user;
        void motDePasse;
        return rest;
    }
    async findPaginated(where, paginationDto) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const [users, total] = await this.repo.findAndCount({
            where,
            order: sortBy ? { [sortBy]: sortOrder } : { id: 'ASC' },
            skip,
            take: limit,
        });
        return (0, pagination_util_1.buildPaginatedData)(users.map((user) => this.sanitizeUser(user)), total, page, limit);
    }
    async findAll(paginationDto) {
        return this.findPaginated({}, paginationDto);
    }
    async search(query, paginationDto) {
        const where = query
            ? [
                { nom: (0, typeorm_2.ILike)(`%${query}%`) },
                { prenom: (0, typeorm_2.ILike)(`%${query}%`) },
                { email: (0, typeorm_2.ILike)(`%${query}%`) },
            ]
            : [{}];
        return this.findPaginated(where, paginationDto);
    }
    async findOne(id) {
        const user = await this.repo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        return this.sanitizeUser(user);
    }
    async findByEmail(email) {
        return this.repo.findOne({ where: { email } });
    }
    async create(dto) {
        const existing = await this.findByEmail(dto.email);
        if (existing)
            throw new common_1.ConflictException('Cet email existe déjà');
        const hashedPassword = await bcrypt.hash(dto.motDePasse, 10);
        const user = this.repo.create({
            ...dto,
            nom: (0, text_util_1.toUpperCase)(dto.nom),
            prenom: (0, text_util_1.capitalize)(dto.prenom),
            motDePasse: hashedPassword,
        });
        const saved = await this.repo.save(user);
        try {
            await this.mailService.sendWelcomeEmail(saved.email, saved.nom, saved.prenom, dto.motDePasse);
            this.logger.log(`Email de bienvenue envoyé à ${saved.email}`);
        }
        catch (error) {
            this.logger.error(`Échec de l'envoi de l'email de bienvenue à ${saved.email}`, error);
        }
        return this.sanitizeUser(saved);
    }
    async update(id, dto) {
        const user = await this.findOne(id);
        const data = { ...dto };
        if (dto.motDePasse) {
            data.motDePasse = await bcrypt.hash(dto.motDePasse, 10);
        }
        if (dto.nom) {
            data.nom = (0, text_util_1.toUpperCase)(dto.nom);
        }
        if (dto.prenom) {
            data.prenom = (0, text_util_1.capitalize)(dto.prenom);
        }
        await this.repo.update(id, data);
        return this.findOne(user.id);
    }
    async updateAvatar(id, avatarUrl) {
        await this.repo.update(id, { avatar: avatarUrl });
        return this.findOne(id);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.repo.delete(user.id);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.Utilisateur)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        mail_service_1.MailService])
], UsersService);
//# sourceMappingURL=users.service.js.map