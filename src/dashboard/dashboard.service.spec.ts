import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { Utilisateur } from '../users/entities/user.entity';
import { Formation } from '../formations/entities/formation.entity';
import { Actualite } from '../news/entities/news-item.entity';
import { Projet } from '../projects/entities/project.entity';
import { Partenaire } from '../parteners/entities/partner.entity';
import { Admission } from '../admissions/entities/admission.entity';
import { RessourceHumaine } from '../ressources-humaines/entities/ressource-humaine.entity';

describe('DashboardService', () => {
  let service: DashboardService;

  const makeRepo = (count: number) => ({
    count: jest.fn().mockResolvedValue(count),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Utilisateur), useValue: makeRepo(5) },
        { provide: getRepositoryToken(Formation), useValue: makeRepo(3) },
        { provide: getRepositoryToken(Actualite), useValue: makeRepo(4) },
        { provide: getRepositoryToken(Projet), useValue: makeRepo(2) },
        { provide: getRepositoryToken(Partenaire), useValue: makeRepo(6) },
        { provide: getRepositoryToken(Admission), useValue: makeRepo(1) },
        { provide: getRepositoryToken(RessourceHumaine), useValue: makeRepo(7) },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getStats returns aggregated counts', async () => {
    const stats = await service.getStats();
    expect(stats.totalUsers).toBe(5);
    expect(stats.totalFormations).toBe(3);
    expect(stats.totalNews).toBe(4);
    expect(stats.totalProjects).toBe(2);
    expect(stats.totalPartners).toBe(6);
    expect(stats.totalAdmissions).toBe(1);
    expect(stats.totalResources).toBe(7);
  });

  it('getOverview combines stats and recent activities', async () => {
    const overview = await service.getOverview();
    expect(overview.stats.totalUsers).toBe(5);
    expect(Array.isArray(overview.recentActivities)).toBe(true);
  });
});
