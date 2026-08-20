import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { AppSetting } from './entities/setting.entity';

describe('SettingsService', () => {
  let service: SettingsService;
  let repo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  const setting: AppSetting = {
    id: 1,
    admissionsOuvertes: true,
    creeLe: new Date(),
    misAJourLe: new Date(),
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn((data: Partial<AppSetting>) => data as AppSetting),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingsService, { provide: getRepositoryToken(AppSetting), useValue: repo }],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getPublic returns the admissions flag', async () => {
    repo.findOne.mockResolvedValue(setting);
    await expect(service.getPublic()).resolves.toEqual({ admissionsOuvertes: true });
  });

  it('getPublic creates the row on first access', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.save.mockResolvedValue({ ...setting, admissionsOuvertes: true });
    const result = await service.getPublic();
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, admissionsOuvertes: true }),
    );
    expect(result).toEqual({ admissionsOuvertes: true });
  });

  it('update changes the flag and persists', async () => {
    repo.findOne.mockResolvedValue(setting);
    repo.save.mockImplementation((value: AppSetting) => Promise.resolve(value));
    const result = await service.update({ admissionsOuvertes: false });
    expect(result.admissionsOuvertes).toBe(false);
    expect(repo.save).toHaveBeenCalled();
  });
});
