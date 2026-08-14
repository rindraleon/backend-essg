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
const message_reply_template_1 = require("./templates/message-reply.template");
const welcome_template_1 = require("./templates/welcome.template");
const mail_errors_1 = require("./mail.errors");
const common_2 = require("@nestjs/common");
let MailService = MailService_1 = class MailService {
    configService;
    logger = new common_1.Logger(MailService_1.name);
    transporter;
    from;
    replyTo;
    appUrl;
    configured;
    constructor(configService) {
        this.configService = configService;
        const host = this.readString('SMTP_HOST', 'smtp.gmail.com');
        const port = this.readNumber('SMTP_PORT', 587);
        const secure = port === 465;
        const user = this.readString('SMTP_USER', '');
        const pass = this.readString('SMTP_PASS', '');
        this.from = this.readString('SMTP_FROM', user || 'no-reply@essg.mg');
        this.replyTo = this.readString('SMTP_REPLY_TO', this.from);
        this.appUrl = this.readString('APP_URL', 'http://localhost:3000');
        this.configured = Boolean(host && user && pass && !user.startsWith('your-'));
        const explicitSecure = this.readBoolean('SMTP_SECURE', false);
        if (explicitSecure !== secure) {
            this.logger.warn(`SMTP_SECURE=${explicitSecure} ignoré : incohérent avec le port ${port} — ${secure ? 'TLS direct (465)' : 'STARTTLS (587/25)'} utilisé`);
        }
        this.transporter = nodemailer_1.default.createTransport({
            host,
            port,
            secure,
            auth: this.configured ? { user, pass } : undefined,
            tls: { minVersion: 'TLSv1.2' },
            connectionTimeout: 15_000,
            greetingTimeout: 10_000,
            socketTimeout: 20_000,
        });
        this.logger.log(`SMTP initialisé (host=${host} port=${port} secure=${secure} from=${this.from} configuré=${this.configured})`);
    }
    async onModuleInit() {
        if (!this.configured) {
            this.logger.warn('SMTP non configuré — les envois d’email échoueront jusqu’à correction du .env');
            return;
        }
        try {
            await this.transporter.verify();
            this.logger.log('Connexion SMTP vérifiée');
        }
        catch (error) {
            this.logger.error('Échec de la vérification SMTP — vérifiez host, port, TLS et identifiants', error instanceof Error ? error.stack : error);
        }
    }
    async sendEmail(options) {
        const to = options.to.trim();
        if (!(0, mail_errors_1.isValidEmail)(to)) {
            this.logger.warn(`Envoi refusé : adresse invalide (${to || 'vide'})`);
            throw new common_2.BadRequestException(mail_errors_1.MAIL_ERROR.INVALID_ADDRESS);
        }
        if (!this.configured) {
            this.logger.error(`Envoi impossible vers ${to} : SMTP non configuré`);
            throw new common_2.ServiceUnavailableException(mail_errors_1.MAIL_ERROR.SMTP_CONNECTION);
        }
        try {
            const info = await this.transporter.sendMail({
                from: this.from,
                to,
                replyTo: options.replyTo || this.replyTo,
                subject: options.subject,
                html: options.html,
                text: options.text ?? (0, mail_errors_1.htmlToText)(options.html),
            });
            const accepted = Array.isArray(info.accepted) ? info.accepted.length : 0;
            if (accepted === 0) {
                this.logger.error(`SMTP n’a accepté aucun destinataire pour ${to} (rejected=${JSON.stringify(info.rejected)} response=${info.response})`);
                throw new common_2.ServiceUnavailableException(mail_errors_1.MAIL_ERROR.SEND_FAILED);
            }
            this.logger.log(`Email transmis à ${to} (messageId=${info.messageId ?? 'n/a'})`);
        }
        catch (error) {
            if (error instanceof common_2.BadRequestException || error instanceof common_2.ServiceUnavailableException) {
                throw error;
            }
            this.logger.error(`Échec d’envoi SMTP vers ${to} : ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : error);
            throw (0, mail_errors_1.toMailHttpException)(error);
        }
    }
    async sendMail(options) {
        await this.sendEmail(options);
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
        await this.sendEmail({
            to: email,
            subject: 'Accusé de réception - Candidature ESSG',
            html: (0, confirmation_template_1.renderAdmissionConfirmationTemplate)(data),
        });
    }
    async sendAdmissionStatusEmail(email, data) {
        const subjectByStatus = {
            [admission_entity_1.AdmissionStatus.ACCEPTE]: 'Confirmation de votre admission — ESSG',
            [admission_entity_1.AdmissionStatus.REFUSE]: 'Décision concernant votre candidature — ESSG',
            [admission_entity_1.AdmissionStatus.EN_COURS_ETUDE]: 'Votre dossier est en cours d’étude — ESSG',
            [admission_entity_1.AdmissionStatus.EN_ATTENTE]: 'Votre dossier est en attente — ESSG',
        };
        const notificationData = {
            ...data,
            email,
            siteUrl: this.appUrl,
        };
        await this.sendEmail({
            to: email,
            subject: subjectByStatus[data.statut],
            html: (0, admission_status_template_1.renderAdmissionStatusTemplate)(notificationData),
        });
    }
    async sendWelcomeEmail(email, nom, prenom, motDePasse) {
        await this.sendEmail({
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
        await this.sendEmail({
            to: email,
            subject: 'Accusé de réception - ESSG',
            html: (0, message_receipt_template_1.renderMessageReceiptTemplate)({
                ...data,
                siteUrl: this.appUrl,
            }),
        });
    }
    async sendMessageReplyEmail(options) {
        await this.sendEmail({
            to: options.to,
            subject: options.sujet,
            html: (0, message_reply_template_1.renderMessageReplyTemplate)({
                prenom: options.prenom,
                nom: options.nom,
                sujet: options.sujet,
                message: options.message,
                siteUrl: this.appUrl,
            }),
        });
    }
    readString(key, fallback) {
        const value = this.configService.get(key, fallback);
        return typeof value === 'string' ? value : fallback;
    }
    readNumber(key, fallback) {
        const raw = this.configService.get(key, fallback);
        const parsed = typeof raw === 'number' ? raw : Number(raw);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    readBoolean(key, fallback) {
        const raw = this.configService.get(key);
        if (typeof raw === 'boolean')
            return raw;
        if (typeof raw === 'string') {
            const normalized = raw.trim().toLowerCase();
            if (['true', '1', 'yes'].includes(normalized))
                return true;
            if (['false', '0', 'no'].includes(normalized))
                return false;
        }
        return fallback;
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map