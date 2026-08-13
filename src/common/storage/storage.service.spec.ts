import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';
import { BadRequestException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { StorageService } from './storage.service';

const clientMock = {
  bucketExists: jest.fn(),
  makeBucket: jest.fn(),
  putObject: jest.fn(),
  getObject: jest.fn(),
  statObject: jest.fn(),
  removeObject: jest.fn(),
  presignedPutObject: jest.fn(),
  presignedGetObject: jest.fn(),
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
                MINIO_PUBLIC_URL: 'http://localhost:9000',
                APP_URL: 'http://localhost:3000',
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
    client.bucketExists.mockResolvedValue(true);
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

  it('upload stores an object in MinIO and returns media metadata', async () => {
    client.putObject.mockResolvedValue({});
    const result = await service.upload(Buffer.from('data'), 'photo.png', {
      mimetype: 'image/png',
      prefix: 'images',
    });
    expect(result.url).toMatch(/^\/media\/images\/.+\.png$/);
    expect(result.objectKey).toMatch(/^images\/.+\.png$/);
    expect(result.objectName).toBe(result.objectKey);
    expect(result.fileName).toBe('photo.png');
    expect(result.mimeType).toBe('image/png');
    expect(result.size).toBe(4);
    expect(client.putObject).toHaveBeenCalled();
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
    await expect(service.delete('images/x.png')).resolves.toBeUndefined();
    expect(client.removeObject).toHaveBeenCalledWith('essg', 'images/x.png');
  });

  it('extractObjectName reads the file name from a stored URL', () => {
    expect(service.extractObjectName('/uploads/abc-123.pdf')).toBe('abc-123.pdf');
    expect(service.extractObjectName('/media/images/abc-123.png')).toBe('images/abc-123.png');
    expect(service.extractObjectName('http://localhost:9000/essg/abc-123.pdf')).toBe('abc-123.pdf');
    expect(service.extractObjectName('admissions/cv/abc-123.pdf')).toBe('admissions/cv/abc-123.pdf');
    expect(service.extractObjectName('http://localhost:9000/essg/admissions/cv/abc-123.pdf')).toBe(
      'admissions/cv/abc-123.pdf',
    );
  });

  it('uploadPrivate stores the document in MinIO under admissions/', async () => {
    client.putObject.mockResolvedValue({});
    const result = await service.uploadPrivate(Buffer.from('%PDF'), 'cv.pdf', {
      mimetype: 'application/pdf',
    });
    expect(result.objectName).toMatch(/^admissions\/.+\.pdf$/);
    expect(result.url).toBe(result.objectName);
    expect(client.putObject).toHaveBeenCalled();
  });

  it('createPresignedUpload returns a rewritten URL', async () => {
    client.presignedPutObject.mockResolvedValue('http://localhost:9000/essg/images/x.png?X-Amz-Signature=abc');
    const result = await service.createPresignedUpload('photo.png', {
      mimetype: 'image/png',
      prefix: 'images',
    });
    expect(result.uploadUrl).toContain('localhost:9000');
    expect(result.objectKey).toMatch(/^images\/.+\.png$/);
    expect(result.publicUrl).toMatch(/^\/media\/images\//);
    expect(result.expiresIn).toBe(600);
  });
});

describe('StorageService without MinIO', () => {
  it('upload throws when MinIO is not configured', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback?: unknown) => {
              if (key === 'MINIO_ACCESS_KEY' || key === 'MINIO_SECRET_KEY') return '';
              return fallback;
            }),
          },
        },
      ],
    }).compile();

    const service = module.get<StorageService>(StorageService);
    await expect(service.upload(Buffer.from('x'), 'a.png')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
