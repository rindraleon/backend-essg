import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { FormationsService } from './formations.service';
import { Formation } from './entities/formation.entity';

describe('FormationsService', () => {
  let service: FormationsService;
  let repo: {
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  const formation: Formation = {
    id: 1,
    slug: 'licence-gestion',
    domaine: ['Gestion'],
    titre: 'Licence Gestion',
    niveau: 'Licence',
    duree: '3 ans',
    description: 'Formation',
    objectifs: [],
    debouches: [],
    conditionsAcces: '',
    conditions: [],
    competences: [],
    modules: [],
    credits: 180,
    responsable: '',
    email: '',
    programme: [],
    image: '/images/hero-campus.jpg',
    enVedette: false,
    creeLe: new Date(),
    misAJourLe: new Date(),
  };

  beforeEach(async () => {
    const qb = {
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[formation], 1]),
    };
    repo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FormationsService, { provide: getRepositoryToken(Formation), useValue: repo }],
    }).compile();

    service = module.get<FormationsService>(FormationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll returns paginated data', async () => {
    repo.findAndCount.mockResolvedValue([[formation], 1]);
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('findOne returns a formation', async () => {
    repo.findOne.mockResolvedValue(formation);
    expect((await service.findOne(1)).id).toBe(1);
  });

  it('findOne throws NotFoundException when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('create saves a formation', async () => {
    repo.create.mockReturnValue(formation);
    repo.save.mockResolvedValue(formation);
    const dto = {
      titre: 'Licence Gestion',
      slug: 'licence-gestion',
      domaine: ['Gestion'],
      niveau: 'Licence',
      duree: '3 ans',
      description: 'x',
      objectifs: [],
      debouches: [],
      conditionsAcces: '',
      programme: [],
      credits: 180,
    } as never;
    await expect(service.create(dto)).resolves.toBe(formation);
  });

  it('remove throws for missing formation', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
  });
});
