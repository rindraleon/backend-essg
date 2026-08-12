import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Projet } from './entities/project.entity';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repo: {
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  const item = {
    id: 1,
    titre: 'Projet A',
    type: 'Recherche',
    date: '2024',
    description: 'x',
    partenaires: [],
    image: '',
    creeLe: new Date(),
    misAJourLe: new Date(),
  };

  beforeEach(async () => {
    const qb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
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
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService, { provide: getRepositoryToken(Projet), useValue: repo }],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
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

  it('findOne returns an item', async () => {
    repo.findOne.mockResolvedValue(item);
    expect((await service.findOne(1)).id).toBe(1);
  });

  it('findOne throws NotFoundException when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('create saves an item', async () => {
    repo.create.mockReturnValue(item);
    repo.save.mockResolvedValue(item);
    await expect(
      service.create({
        titre: 'Projet A',
        type: 'Recherche',
        date: '2024',
        description: 'x',
        partenaires: [],
      } as never),
    ).resolves.toBe(item);
  });

  it('remove throws for missing item', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
  });
});
