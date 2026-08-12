import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { AdmissionStatus } from '../admissions/entities/admission.entity';
import {
  AdmissionConfirmationData,
  renderAdmissionConfirmationTemplate,
} from './templates/admission/confirmation.template';
import {
  AdmissionNotificationData,
  renderAdmissionStatusTemplate,
} from './templates/admission/admission-status.template';
import {
  MessageReceiptTemplateData,
  renderMessageReceiptTemplate,
} from './templates/message-receipt.template';
import { renderWelcomeTemplate } from './templates/welcome.template';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.from =
      this.configService.get<string>('SMTP_FROM') ||
      this.configService.get<string>('SMTP_USER') ||
      'no-reply@essg.sn';
    this.appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER', ''),
        pass: this.configService.get<string>('SMTP_PASS', ''),
      },
    });
  }

  private formatRecipient(to: string): string {
    return to || 'destinataire inconnu';
  }

  async sendMail(options: MailOptions): Promise<void> {
    const recipient = this.formatRecipient(options.to);

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`Email envoyé à ${recipient}`);
    } catch (error) {
      this.logger.error(
        `Échec d'envoi de l'email à ${recipient}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async sendAdmissionConfirmationEmail(
    email: string,
    nom: string,
    prenom: string,
    formation: string,
    reference: string,
  ): Promise<void> {
    const data: AdmissionConfirmationData = {
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
      html: renderAdmissionConfirmationTemplate(data),
    });
  }

  async sendAdmissionStatusEmail(
    email: string,
    data: Omit<AdmissionNotificationData, 'email' | 'siteUrl'>,
  ): Promise<void> {
    const subjectByStatus: Record<AdmissionStatus, string> = {
      [AdmissionStatus.ACCEPTE]: 'Votre admission à l’ESSG est acceptée',
      [AdmissionStatus.REFUSE]: 'Décision concernant votre candidature',
      [AdmissionStatus.EN_COURS_ETUDE]: 'Votre dossier est en cours d’étude',
      [AdmissionStatus.EN_ATTENTE]: 'Votre dossier est en attente',
    };

    const notificationData: AdmissionNotificationData = {
      ...data,
      email,
      siteUrl: this.appUrl,
    };

    await this.sendMail({
      to: email,
      subject: subjectByStatus[data.statut],
      html: renderAdmissionStatusTemplate(notificationData),
    });
  }

  async sendWelcomeEmail(
    email: string,
    nom: string,
    prenom: string,
    motDePasse: string,
  ): Promise<void> {
    await this.sendMail({
      to: email,
      subject: 'Bienvenue sur ESSG - Votre compte a été créé',
      html: renderWelcomeTemplate({
        nom,
        prenom,
        email,
        motDePasse,
        siteUrl: this.appUrl,
      }),
    });
  }

  async sendMessageReceiptEmail(email: string, data: MessageReceiptTemplateData): Promise<void> {
    await this.sendMail({
      to: email,
      subject: 'Accusé de réception - ESSG',
      html: renderMessageReceiptTemplate({
        ...data,
        siteUrl: this.appUrl,
      }),
    });
  }
}
