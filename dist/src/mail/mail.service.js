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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer_1 = __importDefault(require("nodemailer"));
const admission_entity_1 = require("../admissions/entities/admission.entity");
const confirmation_template_1 = require("./templates/admission/confirmation.template");
const admission_status_template_1 = require("./templates/admission/admission-status.template");
const message_receipt_template_1 = require("./templates/message-receipt.template");
const welcome_template_1 = require("./templates/welcome.template");
let MailService = MailService_1 = class MailService {
    configService;
    logger = new common_1.Logger(MailService_1.name);
    transporter;
    from;
    appUrl;
    constructor(configService) {
        this.configService = configService;
        this.from =
            this.configService.get('SMTP_FROM') ||
                this.configService.get('SMTP_USER') ||
                'no-reply@essg.sn';
        this.appUrl = this.configService.get('APP_URL', 'http://localhost:3000');
        this.transporter = nodemailer_1.default.createTransport({
            host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
            port: this.configService.get('SMTP_PORT', 587),
            secure: this.configService.get('SMTP_SECURE', false),
            auth: {
                user: this.configService.get('SMTP_USER', ''),
                pass: this.configService.get('SMTP_PASS', ''),
            },
        });
    }
    formatRecipient(to) {
        return to || 'destinataire inconnu';
    }
    async sendMail(options) {
        const recipient = this.formatRecipient(options.to);
        try {
            await this.transporter.sendMail({
                from: this.from,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });
            this.logger.log(`Email envoyé à ${recipient}`);
        }
        catch (error) {
            this.logger.error(`Échec d'envoi de l'email à ${recipient}`, error instanceof Error ? error.stack : error);
            throw error;
        }
    }
    async sendAdmissionConfirmationEmail(email, nom, prenom, formation, reference) {
        const data = {
            nom,
            prenom,
            formation,
            reference,
            date: new Date().toLocaleDateString('fr-FR'),
            siteUrl: this.appUrl,
        };
        await this.sendMail({
            to: email,
            subject: 'Accusé de réception - Candidature ESSG',
            html: (0, confirmation_template_1.renderAdmissionConfirmationTemplate)(data),
        });
    }
    async sendAdmissionStatusEmail(email, data) {
        const subjectByStatus = {
            [admission_entity_1.AdmissionStatus.ACCEPTE]: 'Votre admission à l’ESSG est acceptée',
            [admission_entity_1.AdmissionStatus.REFUSE]: 'Décision concernant votre candidature',
            [admission_entity_1.AdmissionStatus.EN_COURS_ETUDE]: 'Votre dossier est en cours d’étude',
            [admission_entity_1.AdmissionStatus.EN_ATTENTE]: 'Votre dossier est en attente',
        };
        const notificationData = {
            ...data,
            email,
            siteUrl: this.appUrl,
        };
        await this.sendMail({
            to: email,
            subject: subjectByStatus[data.statut],
            html: (0, admission_status_template_1.renderAdmissionStatusTemplate)(notificationData),
        });
    }
    async sendWelcomeEmail(email, nom, prenom, motDePasse) {
        await this.sendMail({
            to: email,
            subject: 'Bienvenue sur ESSG - Votre compte a été créé',
            html: (0, welcome_template_1.renderWelcomeTemplate)({
                nom,
                prenom,
                email,
                motDePasse,
                siteUrl: this.appUrl,
            }),
        });
    }
    async sendMessageReceiptEmail(email, data) {
        await this.sendMail({
            to: email,
            subject: 'Accusé de réception - ESSG',
            html: (0, message_receipt_template_1.renderMessageReceiptTemplate)({
                ...data,
                siteUrl: this.appUrl,
            }),
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map