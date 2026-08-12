import { Test, TestingModule } from '@nestjs/testing';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';
import { StorageService } from '../common/storage/storage.service';
import { AdmissionStatus } from './entities/admission.entity';

describe('AdmissionsController', () => {
  let controller: AdmissionsController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    updateStatus: jest.Mock;
    remove: jest.Mock;
  };
  let storage: { upload: jest.Mock };

  const item = { id: 1, nom: 'Doe', prenom: 'John', statut: AdmissionStatus.EN_ATTENTE };

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue(item),
      findAll: jest.fn().mockResolvedValue([item]),
      findOne: jest.fn().mockResolvedValue(item),
      updateStatus: jest.fn().mockResolvedValue({ ...item, statut: AdmissionStatus.ACCEPTE }),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    storage = {
      upload: jest
        .fn()
        .mockResolvedValue({ url: '/uploads/x.pdf', objectName: 'x.pdf', bucket: 'essg' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdmissionsController],
      providers: [
        { provide: AdmissionsService, useValue: service },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    controller = module.get<AdmissionsController>(AdmissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to service', async () => {
    expect(await controller.findAll()).toEqual([item]);
  });

  it('findOne returns item', async () => {
    expect(await controller.findOne(1)).toEqual(item);
  });

  it('updateStatus delegates to service', async () => {
    const result = await controller.updateStatus(1, { statut: AdmissionStatus.ACCEPTE });
    expect(service.updateStatus).toHaveBeenCalledWith(1, { statut: AdmissionStatus.ACCEPTE });
    expect(result.statut).toBe(AdmissionStatus.ACCEPTE);
  });

  it('create with CV uploads file to storage', async () => {
    const dto = {} as never;
    const files = {
      cv: [
        { buffer: Buffer.from('x'), originalname: 'a.pdf', mimetype: 'application/pdf' },
      ] as Express.Multer.File[],
    };
    await controller.create(dto, files);
    expect(storage.upload).toHaveBeenCalled();
    expect(service.create).toHaveBeenCalled();
  });

  it('remove delegates to service', async () => {
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
