import { ConfigService } from '@nestjs/config';
import { AdmissionNotificationData } from './templates/admission/admission-status.template';
import { MessageReceiptTemplateData } from './templates/message-receipt.template';
export interface MailOptions {
    to: string;
    subject: string;
    html: string;
}
export declare class MailService {
    private readonly configService;
    private readonly logger;
    private readonly transporter;
    private readonly from;
    private readonly appUrl;
    constructor(configService: ConfigService);
    private formatRecipient;
    sendMail(options: MailOptions): Promise<void>;
    sendAdmissionConfirmationEmail(email: string, nom: string, prenom: string, formation: string, reference: string): Promise<void>;
    sendAdmissionStatusEmail(email: string, data: Omit<AdmissionNotificationData, 'email' | 'siteUrl'>): Promise<void>;
    sendWelcomeEmail(email: string, nom: string, prenom: string, motDePasse: string): Promise<void>;
    sendMessageReceiptEmail(email: string, data: MessageReceiptTemplateData): Promise<void>;
}
