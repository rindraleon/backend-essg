import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { StorageService } from '../common/storage/storage.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: {
    findAll: jest.Mock;
    search: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    updateAvatar: jest.Mock;
    remove: jest.Mock;
  };
  let storage: { upload: jest.Mock };

  const user = { id: 1, email: 'a@b.c' };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ items: [], meta: {} }),
      search: jest.fn().mockResolvedValue({ items: [], meta: {} }),
      findOne: jest.fn().mockResolvedValue(user),
      create: jest.fn().mockResolvedValue(user),
      update: jest.fn().mockResolvedValue(user),
      updateAvatar: jest.fn().mockResolvedValue(user),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    storage = {
      upload: jest
        .fn()
        .mockResolvedValue({ url: '/uploads/x.png', objectName: 'x.png', bucket: 'essg' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: service },
        { provide: StorageService, useValue: storage },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should delegate to service', async () => {
    await controller.findAll({ page: 1, limit: 10 });
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne should return the user', async () => {
    expect(await controller.findOne(1)).toEqual(user);
  });

  it('create should delegate to service', async () => {
    const dto = { email: 'a@b.c', motDePasse: 'secret1', prenom: 'A', nom: 'B' };
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should forbid non-admin from updating another profile', async () => {
    await expect(
      controller.update(2, { nom: 'X' }, { user: { userId: 1, role: 'lecteur' } }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('uploadAvatar should upload to storage and update avatar', async () => {
    const file = {
      buffer: Buffer.from('x'),
      originalname: 'a.png',
      mimetype: 'image/png',
    } as Express.Multer.File;
    await controller.uploadAvatar(1, file, { user: { userId: 1, role: 'admin' } });
    expect(storage.upload).toHaveBeenCalled();
    expect(service.updateAvatar).toHaveBeenCalledWith(1, '/uploads/x.png');
  });
});
