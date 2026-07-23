import * as nodemailer from 'nodemailer';
export declare class MailService {
    private readonly logger;
    private transporter;
    constructor();
    sendMail(options: nodemailer.SendMailOptions): Promise<void>;
    sendAdmissionConfirmationEmail(email: string, nom: string, prenom: string, formation: string, siteUrl: string): Promise<void>;
    sendWelcomeEmail(email: string, nom: string, prenom: string, motDePasse: string, siteUrl: string): Promise<void>;
}
