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
exports.AdmissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const admission_entity_1 = require("./entities/admission.entity");
const mail_service_1 = require("../mail/mail.service");
let AdmissionsService = class AdmissionsService {
    admissionsRepository;
    mailService;
    constructor(admissionsRepository, mailService) {
        this.admissionsRepository = admissionsRepository;
        this.mailService = mailService;
    }
    async create(createAdmissionDto) {
        const admission = this.admissionsRepository.create({
            ...createAdmissionDto,
            statut: admission_entity_1.AdmissionStatus.EN_ATTENTE,
        });
        const saved = await this.admissionsRepository.save(admission);
        try {
            await this.mailService.sendAdmissionConfirmationEmail(saved.email, saved.nom, saved.prenom, saved.formation, process.env.APP_URL || 'http://localhost:3000');
        }
        catch (error) {
            console.error("Erreur lors de l'envoi de l'accusé de réception", error);
        }
        return saved;
    }
    async findAll() {
        return this.admissionsRepository.find({
            order: { creeLe: 'DESC' },
        });
    }
    async findOne(id) {
        const admission = await this.admissionsRepository.findOne({ where: { id } });
        if (!admission) {
            throw new common_1.NotFoundException(`Admission avec l'ID ${id} non trouvée`);
        }
        return admission;
    }
    async updateStatus(id, updateStatusDto) {
        const admission = await this.findOne(id);
        admission.statut = updateStatusDto.statut;
        admission.commentaire = updateStatusDto.commentaire || admission.commentaire;
        return this.admissionsRepository.save(admission);
    }
    async remove(id) {
        const admission = await this.findOne(id);
        await this.admissionsRepository.remove(admission);
    }
};
exports.AdmissionsService = AdmissionsService;
exports.AdmissionsService = AdmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admission_entity_1.Admission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        mail_service_1.MailService])
], AdmissionsService);
//# sourceMappingURL=admissions.service.js.map