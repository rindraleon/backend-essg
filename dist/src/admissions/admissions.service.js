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
var AdmissionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdmissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const storage_service_1 = require("../common/storage/storage.service");
const search_util_1 = require("../common/utils/search.util");
const pagination_util_1 = require("../common/utils/pagination.util");
const file_type_util_1 = require("../common/utils/file-type.util");
const email_domain_service_1 = require("../common/validators/email-domain.service");
const mail_service_1 = require("../mail/mail.service");
const text_util_1 = require("../common/utils/text.util");
const admission_entity_1 = require("./entities/admission.entity");
const ADMISSION_SORT_FIELDS = [
    'id',
    'nom',
    'prenom',
    'email',
    'telephone',
    'formation',
    'niveau',
    'statut',
    'creeLe',
    'misAJourLe',
];
let AdmissionsService = AdmissionsService_1 = class AdmissionsService {
    admissionsRepository;
    mailService;
    storageService;
    emailDomainService;
    logger = new common_1.Logger(AdmissionsService_1.name);
    constructor(admissionsRepository, mailService, storageService, emailDomainService) {
        this.admissionsRepository = admissionsRepository;
        this.mailService = mailService;
        this.storageService = storageService;
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
    buildReference(id) {
        return `ESSG-${id}`;
    }
    async create(createAdmissionDto) {
        await this.assertEmailDomainExists(createAdmissionDto.email);
        const admission = this.admissionsRepository.create({
            ...createAdmissionDto,
            nom: (0, text_util_1.toUpperCase)(createAdmissionDto.nom),
            prenom: (0, text_util_1.capitalize)(createAdmissionDto.prenom),
            formation: (0, text_util_1.capitalize)(createAdmissionDto.formation),
            diplomePrecedent: (0, text_util_1.capitalize)(createAdmissionDto.diplomePrecedent),
            niveau: (0, text_util_1.capitalize)(createAdmissionDto.niveau),
            statut: admission_entity_1.AdmissionStatus.EN_ATTENTE,
        });
        const saved = await this.admissionsRepository.save(admission);
        try {
            await this.mailService.sendAdmissionConfirmationEmail(saved.email, saved.nom, saved.prenom, saved.formation, this.buildReference(saved.id));
            this.logger.log(`Accusé de réception envoyé à ${saved.email}`);
        }
        catch (error) {
            this.logger.error(`Échec de l'envoi de l'accusé de réception à ${saved.email}`, error);
        }
        return saved;
    }
    async findAll(query = {}) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'DESC', q, statut, niveau, formation, dateDebut, } = query;
        const qb = this.admissionsRepository.createQueryBuilder('admission');
        if (q?.trim()) {
            const term = (0, search_util_1.buildIlikeTerm)(q);
            qb.andWhere(`(admission.nom ILIKE :term ${search_util_1.ILIKE_ESCAPE}
          OR admission.prenom ILIKE :term ${search_util_1.ILIKE_ESCAPE}
          OR admission.email ILIKE :term ${search_util_1.ILIKE_ESCAPE}
          OR admission.telephone ILIKE :term ${search_util_1.ILIKE_ESCAPE}
          OR admission.formation ILIKE :term ${search_util_1.ILIKE_ESCAPE})`, { term });
        }
        if (statut) {
            qb.andWhere('admission.statut = :statut', { statut });
        }
        if (niveau && niveau !== 'all') {
            qb.andWhere(`admission.niveau ILIKE :niveau ${search_util_1.ILIKE_ESCAPE}`, {
                niveau: (0, search_util_1.buildIlikeTerm)(niveau),
            });
        }
        if (formation && formation !== 'all') {
            qb.andWhere(`admission.formation ILIKE :formation ${search_util_1.ILIKE_ESCAPE}`, {
                formation: (0, search_util_1.buildIlikeTerm)(formation),
            });
        }
        if (dateDebut) {
            qb.andWhere('admission.creeLe >= :dateDebut', { dateDebut });
        }
        const orderField = (0, search_util_1.sanitizeSortField)(sortBy, ADMISSION_SORT_FIELDS) ?? 'creeLe';
        qb.orderBy(`admission.${orderField}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');
        qb.skip((page - 1) * limit).take(limit);
        const [items, total] = await qb.getManyAndCount();
        return (0, pagination_util_1.buildPaginatedData)(items, total, page, limit);
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
        if (updateStatusDto.commentaire !== undefined) {
            admission.commentaire = updateStatusDto.commentaire;
        }
        if (updateStatusDto.reponseDate !== undefined) {
            admission.reponseDate = updateStatusDto.reponseDate || null;
        }
        if (updateStatusDto.reponseHeure !== undefined) {
            admission.reponseHeure = updateStatusDto.reponseHeure || null;
        }
        if (updateStatusDto.reponseLieu !== undefined) {
            admission.reponseLieu = updateStatusDto.reponseLieu || null;
        }
        if (updateStatusDto.reponseInstructions !== undefined) {
            admission.reponseInstructions = updateStatusDto.reponseInstructions || null;
        }
        if (updateStatusDto.reponseMessage !== undefined) {
            admission.reponseMessage = updateStatusDto.reponseMessage || null;
        }
        const saved = await this.admissionsRepository.save(admission);
        await this.notifyStatusChange(saved);
        return saved;
    }
    async getDocument(id, kind) {
        if (kind !== 'cv' && kind !== 'lettre') {
            throw new common_1.BadRequestException('Type de document invalide');
        }
        const admission = await this.findOne(id);
        const storedUrl = kind === 'cv' ? admission.cvPath : admission.lettreMotivationPath;
        if (!storedUrl) {
            throw new common_1.NotFoundException('Document introuvable');
        }
        const objectName = this.storageService.extractObjectName(storedUrl);
        const buffer = await this.storageService.download(objectName);
        const detected = (0, file_type_util_1.detectFileType)(buffer);
        const base = kind === 'cv'
            ? `CV-${admission.nom}-${admission.prenom}`
            : `Lettre-${admission.nom}-${admission.prenom}`;
        return {
            buffer,
            filename: (0, file_type_util_1.withDetectedExtension)(base, detected.extension),
            mimetype: detected.mimetype,
            inlineViewable: detected.inlineViewable,
        };
    }
    async notifyStatusChange(admission) {
        await this.mailService.sendAdmissionStatusEmail(admission.email, {
            nom: admission.nom,
            prenom: admission.prenom,
            formation: admission.formation,
            reference: this.buildReference(admission.id),
            statut: admission.statut,
            date: new Date().toLocaleDateString('fr-FR'),
            commentaire: admission.commentaire || undefined,
            reponseDate: admission.reponseDate || undefined,
            reponseHeure: admission.reponseHeure || undefined,
            reponseLieu: admission.reponseLieu || undefined,
            reponseInstructions: admission.reponseInstructions || undefined,
            reponseMessage: admission.reponseMessage || undefined,
        });
        this.logger.log(`Notification de statut envoyée à ${admission.email}`);
    }
    async remove(id) {
        const admission = await this.findOne(id);
        await this.admissionsRepository.remove(admission);
        await Promise.all([
            this.storageService.deleteStoredRef(admission.cvPath),
            this.storageService.deleteStoredRef(admission.lettreMotivationPath),
        ]);
    }
};
exports.AdmissionsService = AdmissionsService;
exports.AdmissionsService = AdmissionsService = AdmissionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admission_entity_1.Admission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        mail_service_1.MailService,
        storage_service_1.StorageService,
        email_domain_service_1.EmailDomainService])
], AdmissionsService);
//# sourceMappingURL=admissions.service.js.map