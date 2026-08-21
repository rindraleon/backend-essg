import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Projet } from './entities/project.entity';
import { Partenaire } from '../parteners/entities/partner.entity';

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

    const partnerRepo = {
      find: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Projet), useValue: repo },
        { provide: getRepositoryToken(Partenaire), useValue: partnerRepo },
      ],
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

  describe('sources', () => {
    it('create with zero sources stores an empty array', async () => {
      repo.create.mockReturnValue(item);
      repo.save.mockResolvedValue(item);
      await service.create({
        titre: 'Projet A',
        type: 'Recherche',
        date: '2024',
        description: 'x',
        partenaires: [],
      } as never);
      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ sources: [] }));
    });

    it('create with one source normalizes title and url', async () => {
      repo.create.mockReturnValue(item);
      repo.save.mockResolvedValue(item);
      await service.create({
        titre: 'Projet A',
        type: 'Recherche',
        date: '2024',
        description: 'x',
        partenaires: [],
        sources: [{ title: '  Source 1 ', url: 'data.gov.mg/dataset' }],
      } as never);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sources: [{ title: 'Source 1', url: 'https://data.gov.mg/dataset' }],
        }),
      );
    });

    it('create with multiple sources keeps them all', async () => {
      repo.create.mockReturnValue(item);
      repo.save.mockResolvedValue(item);
      await service.create({
        titre: 'Projet A',
        type: 'Recherche',
        date: '2024',
        description: 'x',
        partenaires: [],
        sources: [
          { title: 'A', url: 'https://a.example.com' },
          { title: 'B', url: 'https://b.example.com' },
        ],
      } as never);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sources: [
            { title: 'A', url: 'https://a.example.com/' },
            { title: 'B', url: 'https://b.example.com/' },
          ],
        }),
      );
    });

    it('create rejects an incomplete source (missing url)', async () => {
      await expect(
        service.create({
          titre: 'Projet A',
          type: 'Recherche',
          date: '2024',
          description: 'x',
          partenaires: [],
          sources: [{ title: 'A' }],
        } as never),
      ).rejects.toThrow(BadRequestException);
    });

    it('create rejects an invalid url', async () => {
      await expect(
        service.create({
          titre: 'Projet A',
          type: 'Recherche',
          date: '2024',
          description: 'x',
          partenaires: [],
          sources: [{ title: 'A', url: 'not a url !!!' }],
        } as never),
      ).rejects.toThrow(BadRequestException);
    });

    it('update replaces the sources', async () => {
      repo.findOne.mockResolvedValue(item);
      repo.update.mockResolvedValue(undefined);
      await service.update(1, {
        sources: [{ title: 'Nouvelle', url: 'https://new.example.com' }],
      } as never);
      expect(repo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          sources: [{ title: 'Nouvelle', url: 'https://new.example.com/' }],
        }),
      );
    });
  });

  it('remove throws for missing item', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
  });
});
