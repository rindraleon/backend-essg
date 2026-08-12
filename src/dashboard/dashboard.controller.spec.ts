import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: { getStats: jest.Mock; getRecentActivities: jest.Mock; getOverview: jest.Mock };

  beforeEach(async () => {
    service = {
      getStats: jest.fn().mockResolvedValue({ totalUsers: 5 }),
      getRecentActivities: jest.fn().mockResolvedValue([]),
      getOverview: jest.fn().mockResolvedValue({ stats: {}, recentActivities: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: service }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getStats returns stats', async () => {
    expect((await controller.getStats()).totalUsers).toBe(5);
  });

  it('getOverview returns overview', async () => {
    expect(await controller.getOverview()).toEqual({ stats: {}, recentActivities: [] });
  });
});
