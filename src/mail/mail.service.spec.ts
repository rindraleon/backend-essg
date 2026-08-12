import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { MailService } from './mail.service';
import { AdmissionStatus } from '../admissions/entities/admission.entity';

jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;
  let sendMailMock: jest.Mock;

  beforeEach(async () => {
    sendMailMock = jest.fn().mockResolvedValue({ messageId: 'id' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: sendMailMock });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback?: unknown) => {
              const values: Record<string, unknown> = {
                SMTP_HOST: 'smtp.test.com',
                SMTP_PORT: 587,
                SMTP_SECURE: false,
                SMTP_USER: 'user@test.com',
                SMTP_PASS: 'pass',
                SMTP_FROM: 'no-reply@test.com',
                APP_URL: 'http://localhost:3000',
              };
              return values[key] ?? fallback;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sendWelcomeEmail sends a mail to the recipient', async () => {
    await service.sendWelcomeEmail('a@b.c', 'Doe', 'John', 'secret');
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'a@b.c',
        subject: expect.any(String) as unknown,
      } as Record<string, unknown>),
    );
  });

  it('sendAdmissionConfirmationEmail sends a receipt', async () => {
    await service.sendAdmissionConfirmationEmail('a@b.c', 'Doe', 'John', 'Licence', 'ESSG-1');
    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ to: 'a@b.c' }));
  });

  it('sendAdmissionStatusEmail sends a status notification', async () => {
    await service.sendAdmissionStatusEmail('a@b.c', {
      nom: 'Doe',
      prenom: 'John',
      formation: 'Licence',
      reference: 'ESSG-1',
      statut: AdmissionStatus.ACCEPTE,
      date: '01/01/2024',
    });
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'a@b.c',
        html: expect.stringContaining('Admission acceptée') as unknown,
      }),
    );
  });

  it('sendMessageReceiptEmail sends a receipt', async () => {
    await service.sendMessageReceiptEmail('a@b.c', {
      nom: 'Doe',
      prenom: 'John',
      sujet: 'Question',
    });
    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ to: 'a@b.c' }));
  });

  it('sendMail propagates errors', async () => {
    sendMailMock.mockRejectedValue(new Error('smtp down'));
    await expect(service.sendWelcomeEmail('a@b.c', 'Doe', 'John', 'x')).rejects.toThrow(
      'smtp down',
    );
  });
});
