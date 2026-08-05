import { type SendMailOptions } from 'nodemailer';
export declare class MailService {
    private readonly logger;
    private readonly transporter;
    constructor();
    sendMail(options: SendMailOptions): Promise<void>;
    sendAdmissionConfirmationEmail(email: string, nom: string, prenom: string, formation: string, siteUrl: string): Promise<void>;
    sendWelcomeEmail(email: string, nom: string, prenom: string, motDePasse: string, siteUrl: string): Promise<void>;
}
