import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogService } from './activity-log.service';

describe('ActivityLogController', () => {
  let controller: ActivityLogController;
  let service: { findAll: jest.Mock; findOne: jest.Mock };

  const item = { id: 1, module: 'users', action: 'create' };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ items: [item], meta: {} }),
      findOne: jest.fn().mockResolvedValue(item),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityLogController],
      providers: [{ provide: ActivityLogService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ActivityLogController>(ActivityLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to service', async () => {
    await controller.findAll({ page: 1, limit: 20 });
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne returns a log', async () => {
    expect(await controller.findOne(1)).toEqual(item);
  });

  it('requires the admin role', () => {
    const rolesGuard = new RolesGuard({
      getAllAndOverride: () => ['admin'],
    } as never);
    expect(() =>
      rolesGuard.canActivate({
        switchToHttp: () => ({
          getRequest: () => ({ user: { role: 'lecteur' } }),
        }),
        getHandler: () => () => undefined,
        getClass: () => class {},
      } as never),
    ).toThrow(ForbiddenException);
  });
});
