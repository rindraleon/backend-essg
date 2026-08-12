import { Test, TestingModule } from '@nestjs/testing';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';
import { StorageService } from '../common/storage/storage.service';

describe('PartnersController', () => {
  let controller: PartnersController;
  let service: {
    findAll: jest.Mock;
    search: jest.Mock;
    findOne: jest.Mock;
    findBySlug: jest.Mock;
    findByName: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };
  let storage: { upload: jest.Mock };

  const item = { id: 1, nom: 'Acme', slug: 'acme' };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ items: [item], meta: {} }),
      search: jest.fn().mockResolvedValue({ items: [item], meta: {} }),
      findOne: jest.fn().mockResolvedValue(item),
      findBySlug: jest.fn().mockResolvedValue(item),
      findByName: jest.fn().mockResolvedValue(item),
      create: jest.fn().mockResolvedValue(item),
      update: jest.fn().mockResolvedValue(item),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    storage = {
      upload: jest
        .fn()
        .mockResolvedValue({ url: '/uploads/x.png', objectName: 'x.png', bucket: 'essg' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnersController],
      providers: [
        { provide: PartnersService, useValue: service },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    controller = module.get<PartnersController>(PartnersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to service', async () => {
    await controller.findAll({ page: 1, limit: 10 });
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findByName returns item', async () => {
    expect(await controller.findByName('Acme')).toEqual(item);
  });

  it('create with a file uploads logo to storage', async () => {
    const dto = {
      nom: 'Acme',
      type: 'Entreprise',
      secteur: 'x',
      description: 'x',
      dateDebut: '2024-01-01',
    } as never;
    const file = {
      buffer: Buffer.from('x'),
      originalname: 'a.png',
      mimetype: 'image/png',
    } as Express.Multer.File;
    await controller.create(dto, file);
    expect(storage.upload).toHaveBeenCalled();
    expect(service.create).toHaveBeenCalled();
  });

  it('remove delegates to service', async () => {
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
