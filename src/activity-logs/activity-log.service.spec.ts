import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ActivityLog } from './activity-log.entity';

describe('ActivityLogService', () => {
  let service: ActivityLogService;
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
    count: jest.Mock;
    find: jest.Mock;
    delete: jest.Mock;
  };

  const log: ActivityLog = {
    id: 1,
    userId: 1,
    action: 'create',
    description: "Création d'un utilisateur.",
    method: 'POST',
    endpoint: '/users',
    module: 'users',
    statusCode: 201,
    success: true,
    ipAddress: '127.0.0.1',
    metadata: { entityId: 1, entityType: 'User' },
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const qb = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[log], 1]),
    };
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(qb),
      findOne: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
      find: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue({ affected: 0 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityLogService, { provide: getRepositoryToken(ActivityLog), useValue: repo }],
    }).compile();

    service = module.get<ActivityLogService>(ActivityLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create persists a log', async () => {
    repo.create.mockReturnValue(log);
    repo.save.mockResolvedValue(log);
    const result = await service.create({
      userId: 1,
      action: 'create',
      description: "Création d'un utilisateur.",
      method: 'POST',
      endpoint: '/users',
      module: 'users',
      statusCode: 201,
      success: true,
      ipAddress: '127.0.0.1',
      metadata: { entityId: 1, entityType: 'User' },
    });
    expect(result).toBe(log);
    expect(repo.save).toHaveBeenCalledWith(log);
  });

  it('findAll returns paginated logs', async () => {
    const result = await service.findAll({ page: 1, limit: 20 });
    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('findAll applies module and method filters', async () => {
    await service.findAll({ page: 1, limit: 20, module: 'users', method: 'POST' });
    const qb = repo.createQueryBuilder.mock.results[0].value as { andWhere: jest.Mock };
    expect(qb.andWhere).toHaveBeenCalledWith('log.module = :module', { module: 'users' });
    expect(qb.andWhere).toHaveBeenCalledWith('log.method = :method', { method: 'POST' });
  });

  it('findOne returns a log', async () => {
    repo.findOne.mockResolvedValue(log);
    expect((await service.findOne(1)).id).toBe(1);
  });

  it('findOne throws NotFoundException when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });
});
