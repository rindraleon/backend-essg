import * as nodemailer from 'nodemailer';
export declare class MailService {
    private transporter;
    constructor();
    sendMail(options: nodemailer.SendMailOptions): Promise<void>;
}
