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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("./entities/user.entity");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let UsersService = class UsersService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    sanitizeUser = (user) => {
        const { motDePasse, ...rest } = user;
        void motDePasse;
        return rest;
    };
    async findAll(paginationDto) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const [users, total] = await this.repo.findAndCount({
            order: sortBy ? { [sortBy]: sortOrder } : { id: 'ASC' },
            skip,
            take: limit,
        });
        const sanitizedUsers = users.map(this.sanitizeUser);
        return new pagination_dto_1.PaginationResponse(sanitizedUsers, total, page, limit);
    }
    async search(query, paginationDto) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
        const skip = (page - 1) * limit;
        const whereCondition = {};
        if (query) {
            whereCondition.nom = query;
            whereCondition.prenom = query;
            whereCondition.email = query;
        }
        const [users, total] = await this.repo.findAndCount({
            where: whereCondition,
            order: sortBy ? { [sortBy]: sortOrder } : { id: 'ASC' },
            skip,
            take: limit,
        });
        const sanitizedUsers = users.map(this.sanitizeUser);
        return new pagination_dto_1.PaginationResponse(sanitizedUsers, total, page, limit);
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
        const user = this.repo.create({ ...dto, motDePasse: hashedPassword });
        const saved = await this.repo.save(user);
        return this.sanitizeUser(saved);
    }
    async update(id, dto) {
        if (dto.motDePasse) {
            dto.motDePasse = await bcrypt.hash(dto.motDePasse, 10);
        }
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
    async updateAvatar(id, avatarUrl) {
        await this.repo.update(id, { avatar: avatarUrl });
        return this.findOne(id);
    }
    async remove(id) {
        await this.repo.delete(id);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.Utilisateur)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map