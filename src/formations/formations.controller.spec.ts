import { Test, TestingModule } from '@nestjs/testing';
import { FormationsController } from './formations.controller';
import { FormationsService } from './formations.service';

describe('FormationsController', () => {
  let controller: FormationsController;
  let service: {
    findAll: jest.Mock;
    search: jest.Mock;
    findBySlug: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const item = { id: 1, titre: 'Licence Gestion', slug: 'licence-gestion' };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ items: [item], meta: {} }),
      search: jest.fn().mockResolvedValue({ items: [item], meta: {} }),
      findBySlug: jest.fn().mockResolvedValue(item),
      findOne: jest.fn().mockResolvedValue(item),
      create: jest.fn().mockResolvedValue(item),
      update: jest.fn().mockResolvedValue(item),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormationsController],
      providers: [{ provide: FormationsService, useValue: service }],
    }).compile();

    controller = module.get<FormationsController>(FormationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to service', async () => {
    await controller.findAll({ page: 1, limit: 10 });
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne returns item', async () => {
    expect(await controller.findOne(1)).toEqual(item);
  });

  it('findBySlug returns item', async () => {
    expect(await controller.findBySlug('licence-gestion')).toEqual(item);
  });

  it('create delegates to service', async () => {
    const dto = {} as never;
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('update delegates to service', async () => {
    const dto = {} as never;
    await controller.update(1, dto);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove delegates to service', async () => {
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
