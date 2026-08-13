import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../common/storage/storage.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: StorageService,
          useValue: { ping: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return health check', async () => {
    const result = await service.check();
    expect(result.status).toBe('ok');
    expect(result.storage).toBe('minio');
    expect(result.timestamp).toBeDefined();
  });
});
