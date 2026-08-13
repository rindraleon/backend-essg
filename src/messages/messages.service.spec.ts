import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';
import { MailService } from '../mail/mail.service';

describe('MessagesService', () => {
  let service: MessagesService;
  let repo: {
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let queryBuilder: {
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  const item: Message = {
    id: 1,
    prenom: 'A',
    nom: 'B',
    email: 'a@b.c',
    telephone: '770000000',
    sujet: 'S',
    message: 'M',
    lu: false,
    luLe: null,
    luPar: null,
    reponse: null,
    reponseSujet: null,
    reponduLe: null,
    reponduPar: null,
    creeLe: new Date(),
    misAJourLe: new Date(),
  };

  beforeEach(async () => {
    queryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[item], 1]),
    };
    repo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: getRepositoryToken(Message), useValue: repo },
        {
          provide: MailService,
          useValue: {
            sendMessageReceiptEmail: jest.fn().mockResolvedValue(undefined),
            sendMessageReplyEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll returns paginated data', async () => {
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('search filters by name, email and phone', async () => {
    const result = await service.search('770', { page: 1, limit: 10 });
    expect(queryBuilder.andWhere).toHaveBeenCalled();
    expect(result.items).toHaveLength(1);
  });

  it('findAll applies sujet, lu and date filters', async () => {
    await service.findAll({
      page: 1,
      limit: 10,
      sujet: 'admission',
      lu: false,
      dateDebut: '2026-01-01',
    });
    expect(queryBuilder.andWhere).toHaveBeenCalled();
    expect(queryBuilder.andWhere.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it('findOne throws NotFoundException when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('create saves a message and sends receipt', async () => {
    repo.create.mockReturnValue(item);
    repo.save.mockResolvedValue(item);
    await expect(
      service.create({ prenom: 'A', nom: 'B', email: 'a@b.c', sujet: 'S', message: 'M' }),
    ).resolves.toBe(item);
  });

  it('update marks a message as read with the reader email', async () => {
    repo.findOne.mockResolvedValue({ ...item });
    repo.save.mockImplementation(async (value: Message) => value);
    const result = await service.update(1, { lu: true }, {
      userId: 2,
      email: 'admin@essg.mg',
      role: 'admin',
      prenom: 'Admin',
      nom: 'ESSG',
    });
    expect(result.lu).toBe(true);
    expect(result.luPar).toBe('admin@essg.mg');
    expect(result.luLe).toBeInstanceOf(Date);
  });

  it('reply sends an email and stores the answer', async () => {
    repo.findOne.mockResolvedValue({ ...item });
    repo.save.mockImplementation(async (value: Message) => value);
    const result = await service.reply(
      1,
      { message: 'Merci pour votre message.', sujet: 'Re : S' },
      { userId: 2, email: 'admin@essg.mg', role: 'admin', prenom: 'Admin', nom: 'ESSG' },
    );
    expect(result.reponse).toBe('Merci pour votre message.');
    expect(result.reponduPar).toBe('admin@essg.mg');
    expect(result.lu).toBe(true);
  });
});
