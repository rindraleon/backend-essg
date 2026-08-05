import { Injectable, Logger } from '@nestjs/common';
import nodemailer, {
  type SendMailOptions,
  type SentMessageInfo,
  type Transporter,
} from 'nodemailer';

function formatRecipient(to: SendMailOptions['to']): string {
  return JSON.stringify(to) ?? 'unknown recipient';
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter<SentMessageInfo>;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const recipient = formatRecipient(options.to);

    try {
      await this.transporter.sendMail(options);
      this.logger.log(`Email sent to ${recipient}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${recipient}`,
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
    siteUrl: string,
  ): Promise<void> {
    const subject = 'Accusé de réception - Candidature ESSG';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Accusé de réception - ESSG</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #2563eb;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f8fafc;
            padding: 30px;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 8px 8px;
          }
          .info-box {
            background-color: #ffffff;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-item {
            margin: 10px 0;
            padding: 10px;
            background-color: #f1f5f9;
            border-radius: 4px;
          }
          .info-label {
            font-weight: bold;
            color: #475569;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #64748b;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ESSG - Accusé de réception</h1>
          <p>Votre candidature a été enregistrée</p>
        </div>
        
        <div class="content">
          <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
          
          <p>Nous vous confirmons la bonne réception de votre dossier de candidature pour la formation <strong>${formation}</strong>.</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #2563eb;">Détails de votre candidature</h3>
            <div class="info-item">
              <div class="info-label">Candidat :</div>
              <div>${prenom} ${nom}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Formation souhaitée :</div>
              <div>${formation}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Statut :</div>
              <div>En attente d'étude</div>
            </div>
          </div>

          <p>Notre équipe pédagogique va étudier votre dossier dans les plus brefs délais. Vous recevrez une réponse par email concernant la suite de votre candidature.</p>
          
          <p>Pour toute information complémentaire, n'hésitez pas à nous contacter.</p>
          
          <a href="${siteUrl}" class="button">Visiter notre site</a>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} ESSG - Tous droits réservés</p>
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </body>
      </html>
    `;

    await this.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      html: htmlContent,
    });
  }

  async sendWelcomeEmail(
    email: string,
    nom: string,
    prenom: string,
    motDePasse: string,
    siteUrl: string,
  ): Promise<void> {
    const subject = 'Bienvenue sur ESSG - Votre compte a été créé';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue sur ESSG</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #2563eb;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f8fafc;
            padding: 30px;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 8px 8px;
          }
          .credentials {
            background-color: #ffffff;
            border: 2px solid #2563eb;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
          }
          .credentials h3 {
            margin-top: 0;
            color: #2563eb;
          }
          .credential-item {
            margin: 10px 0;
            padding: 10px;
            background-color: #f1f5f9;
            border-radius: 4px;
          }
          .credential-label {
            font-weight: bold;
            color: #475569;
          }
          .credential-value {
            color: #1e293b;
            font-family: 'Courier New', monospace;
            font-size: 16px;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #64748b;
            font-size: 12px;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Bienvenue sur ESSG</h1>
          <p>Votre compte a été créé avec succès</p>
        </div>
        
        <div class="content">
          <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
          
          <p>Nous sommes ravis de vous accueillir sur la plateforme ESSG. Votre compte administrateur a été créé avec succès.</p>
          
          <div class="credentials">
            <h3>Vos identifiants de connexion</h3>
            <div class="credential-item">
              <div class="credential-label">Email :</div>
              <div class="credential-value">${email}</div>
            </div>
            <div class="credential-item">
              <div class="credential-label">Mot de passe :</div>
              <div class="credential-value">${motDePasse}</div>
            </div>
          </div>

          <div class="warning">
            <strong>⚠️ Important :</strong> Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.
          </div>
          
          <p>Cliquez sur le bouton ci-dessous pour accéder à la plateforme :</p>
          
          <a href="${siteUrl}" class="button">Accéder à ESSG</a>
          
          <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
          <a href="${siteUrl}">${siteUrl}</a></p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} ESSG - Tous droits réservés</p>
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </body>
      </html>
    `;

    await this.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      html: htmlContent,
    });
  }
}
