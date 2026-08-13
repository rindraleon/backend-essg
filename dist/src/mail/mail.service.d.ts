import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdmissionNotificationData } from './templates/admission/admission-status.template';
import { MessageReceiptTemplateData } from './templates/message-receipt.template';
export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
}
export declare class MailService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private readonly transporter;
    private readonly from;
    private readonly replyTo;
    private readonly appUrl;
    private readonly configured;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    sendEmail(options: SendEmailOptions): Promise<void>;
    sendMail(options: {
        to: string;
        subject: string;
        html: string;
    }): Promise<void>;
    sendAdmissionConfirmationEmail(email: string, nom: string, prenom: string, formation: string, reference: string): Promise<void>;
    sendAdmissionStatusEmail(email: string, data: Omit<AdmissionNotificationData, 'email' | 'siteUrl'>): Promise<void>;
    sendWelcomeEmail(email: string, nom: string, prenom: string, motDePasse: string): Promise<void>;
    sendMessageReceiptEmail(email: string, data: MessageReceiptTemplateData): Promise<void>;
    sendMessageReplyEmail(options: {
        to: string;
        prenom: string;
        nom: string;
        sujet: string;
        message: string;
    }): Promise<void>;
    private readString;
    private readNumber;
    private readBoolean;
}
