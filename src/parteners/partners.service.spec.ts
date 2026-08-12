import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { Partenaire } from './entities/partner.entity';

describe('PartnersService', () => {
  let service: PartnersService;
  let repo: {
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const item: Partenaire = {
    id: 1,
    nom: 'Acme',
    slug: 'acme',
    type: 'Entreprise',
    secteur: 'Tech',
    description: 'x',
    dateDebut: undefined,
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
      providers: [PartnersService, { provide: getRepositoryToken(Partenaire), useValue: repo }],
    }).compile();

    service = module.get<PartnersService>(PartnersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll returns paginated data', async () => {
    repo.findAndCount.mockResolvedValue([[item], 1]);
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result.meta.total).toBe(1);
  });

  it('findBySlug returns a partner', async () => {
    repo.findOne.mockResolvedValue(item);
    expect((await service.findBySlug('acme')).id).toBe(1);
  });

  it('findByName returns a partner', async () => {
    repo.findOne.mockResolvedValue(item);
    expect((await service.findByName('Acme')).nom).toBe('Acme');
  });

  it('findOne throws NotFoundException when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('create generates a slug from the name', async () => {
    repo.create.mockImplementation((data: Partial<Partenaire>) => data);
    repo.save.mockResolvedValue(item);
    const result = await service.create({
      nom: 'Acme',
      type: 'Entreprise',
      secteur: 'x',
      description: 'x',
      dateDebut: '2024-01-01',
    } as never);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ slug: 'acme' }));
    expect(result).toBe(item);
  });
});
