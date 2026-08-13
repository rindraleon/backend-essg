import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { MailService } from './mail.service';
import { AdmissionStatus } from '../admissions/entities/admission.entity';

jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;
  let sendMailMock: jest.Mock;
  let verifyMock: jest.Mock;

  beforeEach(async () => {
    sendMailMock = jest.fn().mockResolvedValue({ messageId: 'id', accepted: ['a@b.c'] });
    verifyMock = jest.fn().mockResolvedValue(true);
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
      verify: verifyMock,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback?: unknown) => {
              const values: Record<string, unknown> = {
                SMTP_HOST: 'smtp.test.com',
                SMTP_PORT: '587',
                SMTP_SECURE: 'false',
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

  it('sendEmail rejects an invalid address', async () => {
    await expect(
      service.sendEmail({ to: 'not-an-email', subject: 'x', html: '<p>x</p>' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('sendEmail confirms transmission only when SMTP accepts the recipient', async () => {
    await service.sendEmail({ to: 'a@b.c', subject: 'Hello', html: '<p>Hi</p>' });
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'a@b.c',
        subject: 'Hello',
        html: '<p>Hi</p>',
      }),
    );
  });

  it('sendEmail fails when SMTP accepts nobody', async () => {
    sendMailMock.mockResolvedValue({ messageId: 'id', accepted: [], rejected: ['a@b.c'] });
    await expect(
      service.sendEmail({ to: 'a@b.c', subject: 'Hello', html: '<p>Hi</p>' }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
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

  it('sendAdmissionStatusEmail includes complementary fields', async () => {
    await service.sendAdmissionStatusEmail('a@b.c', {
      nom: 'Doe',
      prenom: 'John',
      formation: 'Licence',
      reference: 'ESSG-1',
      statut: AdmissionStatus.ACCEPTE,
      date: '01/01/2024',
      reponseDate: '2026-09-01',
      reponseHeure: '09:00',
      reponseLieu: 'Campus Andrainjato',
      reponseMessage: 'Merci de vous présenter avec vos originaux.',
    });
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'a@b.c',
        html: expect.stringContaining('Campus Andrainjato') as unknown,
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

  it('sendEmail maps SMTP connection errors', async () => {
    sendMailMock.mockRejectedValue(Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' }));
    await expect(service.sendEmail({ to: 'a@b.c', subject: 'x', html: '<p>x</p>' })).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
