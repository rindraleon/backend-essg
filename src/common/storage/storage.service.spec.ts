import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StorageService } from './storage.service';

const clientMock = {
  bucketExists: jest.fn(),
  makeBucket: jest.fn(),
  putObject: jest.fn(),
  getObject: jest.fn(),
  statObject: jest.fn(),
  removeObject: jest.fn(),
};

jest.mock('minio', () => ({
  Client: jest.fn(() => clientMock),
}));

describe('StorageService', () => {
  let service: StorageService;
  let client: typeof clientMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback?: unknown) => {
              const values: Record<string, unknown> = {
                MINIO_ENDPOINT: 'localhost',
                MINIO_PORT: 9000,
                MINIO_USE_SSL: 'false',
                MINIO_ACCESS_KEY: 'key',
                MINIO_SECRET_KEY: 'secret',
                MINIO_BUCKET: 'essg',
                MINIO_PUBLIC_URL: '',
              };
              return values[key] ?? fallback;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    client = (service as unknown as { client: typeof clientMock }).client;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('ensureBucket creates the bucket when missing', async () => {
    client.bucketExists.mockResolvedValue(false);
    client.makeBucket.mockResolvedValue(undefined);
    await service.ensureBucket('essg');
    expect(client.makeBucket).toHaveBeenCalledWith('essg', '');
  });

  it('upload stores an object and returns a URL', async () => {
    client.putObject.mockResolvedValue({});
    const result = await service.upload(Buffer.from('data'), 'photo.png', {
      mimetype: 'image/png',
    });
    expect(result.url).toContain('/uploads/');
    expect(result.url).toMatch(/\.png$/);
    expect(result.objectName).toMatch(/\.png$/);
  });

  it('upload rejects empty buffers', async () => {
    await expect(service.upload(Buffer.alloc(0), 'x.png')).rejects.toThrow(BadRequestException);
  });

  it('download returns a buffer', async () => {
    client.getObject.mockResolvedValue(Readable.from([Buffer.from('hello')]));
    const buffer = await service.download('x.png');
    expect(buffer.toString()).toBe('hello');
  });

  it('download throws NotFoundException when object is missing', async () => {
    client.getObject.mockRejectedValue(new Error('no such object'));
    await expect(service.download('x.png')).rejects.toThrow(NotFoundException);
  });

  it('exists returns true when statObject succeeds', async () => {
    client.statObject.mockResolvedValue({});
    await expect(service.exists('x.png')).resolves.toBe(true);
  });

  it('exists returns false when statObject fails', async () => {
    client.statObject.mockRejectedValue(new Error('not found'));
    await expect(service.exists('x.png')).resolves.toBe(false);
  });

  it('delete removes an object', async () => {
    client.removeObject.mockResolvedValue(undefined);
    await expect(service.delete('x.png')).resolves.toBeUndefined();
  });
});
