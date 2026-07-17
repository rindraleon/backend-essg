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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../users/entities/user.entity");
let AuthService = class AuthService {
    jwtService;
    configService;
    userRepo;
    initialized = false;
    constructor(jwtService, configService, userRepo) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.userRepo = userRepo;
    }
    async onModuleInit() {
        const adminEmail = this.configService.get('ADMIN_EMAIL', 'admin@essg.sn');
        const adminPassword = this.configService.get('ADMIN_PASSWORD', 'Admin@2026');
        const existingAdmin = await this.userRepo.findOne({
            where: { email: adminEmail },
        });
        if (!existingAdmin) {
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
            const admin = this.userRepo.create({
                email: adminEmail,
                motDePasse: passwordHash,
                prenom: 'Admin',
                nom: 'System',
                role: 'admin',
                estActif: true,
            });
            await this.userRepo.save(admin);
            console.log(`[Auth] Default admin account created: ${adminEmail}`);
        }
        else {
            console.log(`[Auth] Admin account already exists: ${adminEmail}`);
        }
        this.initialized = true;
    }
    async validateUser(email, password) {
        const user = await this.userRepo.findOne({
            where: { email: email.toLowerCase() },
        });
        if (!user)
            return null;
        const isMatch = await bcrypt.compare(password, user.motDePasse);
        if (!isMatch)
            return null;
        return { id: user.id, email: user.email, role: user.role };
    }
    async login(email, password) {
        const user = await this.validateUser(email, password);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const payload = { email: user.email, sub: user.id };
        return {
            accessToken: this.jwtService.sign(payload),
            email: user.email,
        };
    }
    async validateToken(payload) {
        const user = await this.userRepo.findOne({
            where: { id: payload.sub, email: payload.email },
        });
        return !!user;
    }
    async getUserById(id) {
        return this.userRepo.findOne({
            where: { id },
            select: ['id', 'email', 'role'],
        });
    }
    async getUserForAuth(id, email) {
        return this.userRepo.findOne({
            where: { id, email },
            select: ['id', 'email', 'role', 'prenom', 'nom', 'avatar'],
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.Utilisateur)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map