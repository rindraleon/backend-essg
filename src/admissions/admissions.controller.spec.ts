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
    getDocument: jest.Mock;
    getFiles: jest.Mock;
    getFile: jest.Mock;
    removeFile: jest.Mock;
    checkDuplicate: jest.Mock;
    remove: jest.Mock;
  };
  let storage: { upload: jest.Mock; uploadPrivate: jest.Mock };

  const item = { id: 1, nom: 'Doe', prenom: 'John', statut: AdmissionStatus.EN_ATTENTE };

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue(item),
      findAll: jest.fn().mockResolvedValue([item]),
      findOne: jest.fn().mockResolvedValue(item),
      updateStatus: jest.fn().mockResolvedValue({ ...item, statut: AdmissionStatus.ACCEPTE }),
      getDocument: jest.fn(),
      getFiles: jest.fn().mockResolvedValue([]),
      getFile: jest.fn(),
      removeFile: jest.fn().mockResolvedValue(undefined),
      checkDuplicate: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    storage = {
      upload: jest
        .fn()
        .mockResolvedValue({ url: '/uploads/x.pdf', objectName: 'x.pdf', bucket: 'essg' }),
      uploadPrivate: jest
        .fn()
        .mockImplementation((_buffer, _name, options: { prefix?: string }) => {
          const prefix = options?.prefix ?? 'admissions';
          return Promise.resolve({
            url: `${prefix}/x.pdf`,
            objectName: `${prefix}/x.pdf`,
            bucket: 'essg',
          });
        }),
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
    expect(await controller.findAll({})).toEqual([item]);
  });

  it('findOne returns item', async () => {
    expect(await controller.findOne(1)).toEqual(item);
  });

  it('updateStatus delegates to service', async () => {
    const result = await controller.updateStatus(1, { statut: AdmissionStatus.ACCEPTE });
    expect(service.updateStatus).toHaveBeenCalledWith(1, { statut: AdmissionStatus.ACCEPTE });
    expect(result.statut).toBe(AdmissionStatus.ACCEPTE);
  });

  it('create uploads each file to storage and forwards objectPaths', async () => {
    const dto = { niveau: 'licence' } as never;
    const files = {
      cv: [
        { buffer: Buffer.from('x'), originalname: 'a.pdf', mimetype: 'application/pdf' },
      ] as Express.Multer.File[],
      releveBac: [
        { buffer: Buffer.from('y'), originalname: 'r.pdf', mimetype: 'application/pdf' },
      ] as Express.Multer.File[],
      bordereau: [
        { buffer: Buffer.from('z'), originalname: 'b.pdf', mimetype: 'application/pdf' },
      ] as Express.Multer.File[],
    };
    await controller.create(dto, files);
    expect(storage.uploadPrivate).toHaveBeenCalledWith(
      expect.any(Buffer),
      'a.pdf',
      expect.objectContaining({ prefix: 'admissions/cv' }),
    );
    expect(storage.uploadPrivate).toHaveBeenCalledWith(
      expect.any(Buffer),
      'r.pdf',
      expect.objectContaining({ prefix: 'admissions/releves-bac' }),
    );
    expect(service.create).toHaveBeenCalledWith(dto, expect.anything());
    const calls = (service.create as unknown as { mock: { calls: Array<[unknown, unknown]> } }).mock
      .calls;
    const uploaded = calls[0]?.[1] as
      | {
          cv?: { objectPath?: string };
          releveBac?: { objectPath?: string };
          releve_bac?: { objectPath?: string };
          bordereau?: { objectPath?: string };
        }
      | undefined;
    expect(uploaded?.cv?.objectPath).toBe('admissions/cv/x.pdf');
    expect(uploaded?.releve_bac?.objectPath).toBe('admissions/releves-bac/x.pdf');
    expect(uploaded?.bordereau?.objectPath).toBe('admissions/bordereaux/x.pdf');
  });

  it('checkDuplicate delegates to service', async () => {
    await controller.checkDuplicate('BAC-1', 'BV-1');
    expect(service.checkDuplicate).toHaveBeenCalledWith({
      numeroBaccalaureat: 'BAC-1',
      numeroBordereau: 'BV-1',
    });
  });

  it('getFiles delegates to service', async () => {
    expect(await controller.getFiles(1)).toEqual([]);
    expect(service.getFiles).toHaveBeenCalledWith(1);
  });

  it('removeFile delegates to service', async () => {
    await controller.removeFile(1, 5);
    expect(service.removeFile).toHaveBeenCalledWith(1, 5);
  });

  it('remove delegates to service', async () => {
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
