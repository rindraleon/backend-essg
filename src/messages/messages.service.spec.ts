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
  };

  const item: Message = {
    id: 1,
    prenom: 'A',
    nom: 'B',
    email: 'a@b.c',
    telephone: '',
    sujet: 'S',
    message: 'M',
    lu: false,
    creeLe: new Date(),
    misAJourLe: new Date(),
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: getRepositoryToken(Message), useValue: repo },
        {
          provide: MailService,
          useValue: { sendMessageReceiptEmail: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll returns paginated data', async () => {
    repo.findAndCount.mockResolvedValue([[item], 1]);
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
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
});
