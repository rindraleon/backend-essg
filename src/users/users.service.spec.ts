import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Utilisateur } from './entities/user.entity';
import { MailService } from '../mail/mail.service';

describe('UsersService', () => {
  let service: UsersService;
  let repo: {
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockUser: Utilisateur = {
    id: 1,
    email: 'john@essg.sn',
    motDePasse: 'hashed',
    prenom: 'John',
    nom: 'Doe',
    role: 'lecteur',
    estActif: true,
    avatar: undefined,
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
        UsersService,
        { provide: getRepositoryToken(Utilisateur), useValue: repo },
        {
          provide: MailService,
          useValue: { sendWelcomeEmail: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated sanitized users', async () => {
      repo.findAndCount.mockResolvedValue([[mockUser], 1]);
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect((result.items[0] as Partial<Utilisateur>).motDePasse).toBeUndefined();
    });
  });

  describe('search', () => {
    it('should search by name, email or prenom', async () => {
      repo.findAndCount.mockResolvedValue([[mockUser], 1]);
      const result = await service.search('john', { page: 1, limit: 10 });
      expect(result.meta.total).toBe(1);
      expect(repo.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a sanitized user', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
      expect((result as Partial<Utilisateur>).motDePasse).toBeUndefined();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should throw ConflictException when email already exists', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      await expect(
        service.create({
          email: 'john@essg.sn',
          motDePasse: 'password123',
          prenom: 'John',
          nom: 'Doe',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a user and send welcome email', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockUser);
      repo.save.mockResolvedValue(mockUser);
      const result = await service.create({
        email: 'john@essg.sn',
        motDePasse: 'password123',
        prenom: 'John',
        nom: 'Doe',
      });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ nom: 'DOE', prenom: 'John' }),
      );
      expect(result.id).toBe(1);
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      repo.update.mockResolvedValue(undefined);
      const result = await service.update(1, { nom: 'Smith' });
      expect(result.id).toBe(1);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException for missing user', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });

    it('should delete an existing user', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      repo.delete.mockResolvedValue(undefined);
      await expect(service.remove(1)).resolves.toBeUndefined();
    });
  });
});
