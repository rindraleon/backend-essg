import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { Admission, AdmissionStatus } from './entities/admission.entity';
import { AdmissionFile, AdmissionFileType } from './entities/admission-file.entity';
import { MailService } from '../mail/mail.service';
import { StorageService } from '../common/storage/storage.service';
import { SettingsService } from '../settings/settings.service';
import { EmailDomainService } from '../common/validators/email-domain.service';

describe('AdmissionsService', () => {
  let service: AdmissionsService;
  let repo: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let filesRepo: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let mail: {
    sendAdmissionConfirmationEmail: jest.Mock;
    sendAdmissionStatusEmail: jest.Mock;
    sendAdminsAdmissionNotification: jest.Mock;
  };
  let settings: { getPublic: jest.Mock };
  let storage: {
    extractObjectName: jest.Mock;
    download: jest.Mock;
    deleteStoredRef: jest.Mock;
  };
  let queryBuilder: {
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  const admission: Admission = {
    id: 1,
    nom: 'Doe',
    prenom: 'John',
    email: 'john@essg.sn',
    telephone: '770000000',
    dateNaissance: '2000-01-01',
    niveau: 'Licence',
    formation: 'Licence Gestion',
    diplomePrecedent: 'Bac',
    adresse: 'Antananarivo',
    numeroBaccalaureat: 'BAC-2020-001',
    licenceEtablissement: null,
    licenceMention: null,
    licenceAnneeObtention: null,
    numeroBordereau: 'BV-2026-001',
    cvPath: '',
    lettreMotivationPath: '',
    files: [],
    statut: AdmissionStatus.EN_ATTENTE,
    commentaire: '',
    reponseDate: null,
    reponseHeure: null,
    reponseLieu: null,
    reponseInstructions: null,
    reponseMessage: null,
    creeLe: new Date(),
    misAJourLe: new Date(),
  };

  const dto = {
    nom: 'Doe',
    prenom: 'John',
    email: 'john@essg.sn',
    telephone: '770000000',
    dateNaissance: '2000-01-01',
    niveau: 'licence',
    formation: 'Licence Gestion',
    diplomePrecedent: 'Bac',
    adresse: 'Antananarivo',
    numeroBaccalaureat: 'BAC-2020-001',
    numeroBordereau: 'BV-2026-001',
  };

  const pdfFixture = (originalname: string, objectPath: string) => ({
    buffer: Buffer.from('%PDF-1.4'),
    originalname,
    mimetype: 'application/pdf',
    objectPath,
  });

  const licenceFiles = {
    releve_bac: pdfFixture('releve.pdf', 'admissions/releves-bac/x.pdf'),
    bordereau: pdfFixture('bordereau.pdf', 'admissions/bordereaux/x.pdf'),
  };

  const masterFiles = {
    releve_l3: pdfFixture('releve-l3.pdf', 'admissions/releves-l3/x.pdf'),
    bordereau: pdfFixture('bordereau.pdf', 'admissions/bordereaux/x.pdf'),
  };

  const bordereauOnly = {
    bordereau: pdfFixture('bordereau.pdf', 'admissions/bordereaux/x.pdf'),
  };

  beforeEach(async () => {
    queryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[admission], 1]),
    };
    repo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    filesRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((data: Partial<AdmissionFile>) => data as AdmissionFile),
      save: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    mail = {
      sendAdmissionConfirmationEmail: jest.fn().mockResolvedValue(undefined),
      sendAdmissionStatusEmail: jest.fn().mockResolvedValue(undefined),
      sendAdminsAdmissionNotification: jest.fn().mockResolvedValue(undefined),
    };
    settings = { getPublic: jest.fn().mockResolvedValue({ admissionsOuvertes: true }) };
    storage = {
      extractObjectName: jest.fn((url: string) => url.split('/').pop()),
      download: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4')),
      deleteStoredRef: jest.fn().mockResolvedValue(undefined),
    };
    const emailDomain = { check: jest.fn().mockResolvedValue({ reason: null }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdmissionsService,
        { provide: getRepositoryToken(Admission), useValue: repo },
        { provide: getRepositoryToken(AdmissionFile), useValue: filesRepo },
        { provide: MailService, useValue: mail },
        { provide: StorageService, useValue: storage },
        { provide: EmailDomainService, useValue: emailDomain },
        { provide: SettingsService, useValue: settings },
      ],
    }).compile();

    service = module.get<AdmissionsService>(AdmissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(admission);
      repo.save.mockResolvedValue(admission);
      repo.findOne.mockImplementation((opts?: { where?: Record<string, unknown> }) => {
        if (opts?.where && 'id' in opts.where) {
          return Promise.resolve(admission);
        }
        return Promise.resolve(null);
      });
    });

    it('saves a licence admission and notifies admin + candidate', async () => {
      const files = licenceFiles;
      const result = await service.create({ ...dto } as never, files);
      expect(result.statut).toBe(AdmissionStatus.EN_ATTENTE);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ nom: 'DOE', prenom: 'John', statut: AdmissionStatus.EN_ATTENTE }),
      );
      expect(filesRepo.save).toHaveBeenCalled();
      expect(mail.sendAdmissionConfirmationEmail).toHaveBeenCalled();
      expect(mail.sendAdminsAdmissionNotification).toHaveBeenCalledWith(
        expect.objectContaining({ reference: 'ESSG-1', fileCount: 2 }),
      );
    });

    it('rejects a licence admission without bac proof file', async () => {
      const files = bordereauOnly;
      await expect(service.create({ ...dto } as never, files)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('rejects a licence admission without bac number', async () => {
      await expect(
        service.create({ ...dto, numeroBaccalaureat: undefined } as never, {
          releve_bac: {
            buffer: Buffer.from('%PDF-1.4'),
            originalname: 'releve.pdf',
            mimetype: 'application/pdf',
            objectPath: 'admissions/releves-bac/x.pdf',
          },
          bordereau: {
            buffer: Buffer.from('%PDF-1.4'),
            originalname: 'bordereau.pdf',
            mimetype: 'application/pdf',
            objectPath: 'admissions/bordereaux/x.pdf',
          },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects an admission without bordereau number', async () => {
      await expect(
        service.create({ ...dto, numeroBordereau: undefined } as never, {
          releve_bac: {
            buffer: Buffer.from('%PDF-1.4'),
            originalname: 'releve.pdf',
            mimetype: 'application/pdf',
            objectPath: 'admissions/releves-bac/x.pdf',
          },
          bordereau: {
            buffer: Buffer.from('%PDF-1.4'),
            originalname: 'bordereau.pdf',
            mimetype: 'application/pdf',
            objectPath: 'admissions/bordereaux/x.pdf',
          },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a master admission without L3 transcript', async () => {
      await expect(
        service.create(
          {
            ...dto,
            niveau: 'master',
            numeroBaccalaureat: undefined,
            licenceEtablissement: 'Université de Fianarantsoa',
            licenceMention: 'Géographie',
          } as never,
          {
            bordereau: {
              buffer: Buffer.from('%PDF-1.4'),
              originalname: 'bordereau.pdf',
              mimetype: 'application/pdf',
              objectPath: 'admissions/bordereaux/x.pdf',
            },
          },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('accepts a master admission with L3 transcript and licence info', async () => {
      const files = masterFiles;
      await expect(
        service.create(
          {
            ...dto,
            niveau: 'master',
            numeroBaccalaureat: undefined,
            licenceEtablissement: 'Université de Fianarantsoa',
            licenceMention: 'Géographie',
          } as never,
          files,
        ),
      ).resolves.toBeDefined();
    });

    it('rejects a file whose mimetype is not allowed', async () => {
      await expect(
        service.create({ ...dto } as never, {
          releve_bac: {
            buffer: Buffer.from('PK\x03\x04fake'),
            originalname: 'releve.docx',
            mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            objectPath: 'admissions/releves-bac/x.docx',
          },
          ...bordereauOnly,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects when the bac number is already used', async () => {
      repo.findOne.mockImplementation((opts?: { where?: Record<string, unknown> }) => {
        const where = opts?.where as Record<string, unknown>;
        if (where?.numeroBaccalaureat) return Promise.resolve(admission);
        if (where?.id) return Promise.resolve(admission);
        return Promise.resolve(null);
      });
      await expect(
        service.create({ ...dto } as never, {
          releve_bac: {
            buffer: Buffer.from('%PDF-1.4'),
            originalname: 'releve.pdf',
            mimetype: 'application/pdf',
            objectPath: 'admissions/releves-bac/x.pdf',
          },
          bordereau: {
            buffer: Buffer.from('%PDF-1.4'),
            originalname: 'bordereau.pdf',
            mimetype: 'application/pdf',
            objectPath: 'admissions/bordereaux/x.pdf',
          },
        }),
      ).rejects.toThrow(ConflictException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('rejects when the bordereau number is already used', async () => {
      repo.findOne.mockImplementation((opts?: { where?: Record<string, unknown> }) => {
        const where = opts?.where as Record<string, unknown>;
        if (where?.numeroBordereau) return Promise.resolve(admission);
        if (where?.id) return Promise.resolve(admission);
        return Promise.resolve(null);
      });
      await expect(
        service.create({ ...dto } as never, {
          releve_bac: {
            buffer: Buffer.from('%PDF-1.4'),
            originalname: 'releve.pdf',
            mimetype: 'application/pdf',
            objectPath: 'admissions/releves-bac/x.pdf',
          },
          bordereau: {
            buffer: Buffer.from('%PDF-1.4'),
            originalname: 'bordereau.pdf',
            mimetype: 'application/pdf',
            objectPath: 'admissions/bordereaux/x.pdf',
          },
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('refuses new admissions when admissions are closed', async () => {
      settings.getPublic.mockResolvedValue({ admissionsOuvertes: false });
      await expect(
        service.create({ ...dto } as never, {
          releve_bac: {
            buffer: Buffer.from('%PDF-1.4'),
            originalname: 'releve.pdf',
            mimetype: 'application/pdf',
            objectPath: 'admissions/releves-bac/x.pdf',
          },
          bordereau: {
            buffer: Buffer.from('%PDF-1.4'),
            originalname: 'bordereau.pdf',
            mimetype: 'application/pdf',
            objectPath: 'admissions/bordereaux/x.pdf',
          },
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('keeps the admission saved even when admin notification fails', async () => {
      mail.sendAdminsAdmissionNotification.mockRejectedValue(new Error('SMTP down'));
      const files = licenceFiles;
      await expect(service.create({ ...dto } as never, files)).resolves.toBeDefined();
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('checkDuplicate', () => {
    it('returns availability for both numbers', async () => {
      repo.findOne.mockImplementation((opts?: { where?: Record<string, unknown> }) => {
        const where = opts?.where as Record<string, unknown>;
        if (where?.numeroBaccalaureat === 'BAC-2020-001') return Promise.resolve(admission);
        return Promise.resolve(null);
      });
      const result = await service.checkDuplicate({
        numeroBaccalaureat: 'BAC-2020-001',
        numeroBordereau: 'BV-9999',
      });
      expect(result).toEqual({
        numeroBaccalaureatDisponible: false,
        numeroBordereauDisponible: true,
      });
    });
  });

  describe('files', () => {
    it('getFile streams a stored file', async () => {
      const file: AdmissionFile = {
        id: 5,
        admissionId: 1,
        admission: admission,
        type: AdmissionFileType.RELEVE_BAC,
        originalName: 'Relevé.pdf',
        objectPath: 'admissions/releves-bac/x.pdf',
        mimetype: 'application/pdf',
        size: 123,
        creeLe: new Date(),
      };
      repo.findOne.mockResolvedValue(admission);
      filesRepo.findOne.mockResolvedValue(file);
      const result = await service.getFile(1, 5);
      expect(result.mimetype).toBe('application/pdf');
      expect(result.filename).toBe('Releve.pdf');
    });

    it('getFile throws when the file does not belong to the admission', async () => {
      repo.findOne.mockResolvedValue(admission);
      filesRepo.findOne.mockResolvedValue(null);
      await expect(service.getFile(1, 99)).rejects.toThrow(NotFoundException);
    });

    it('removeFile deletes the MinIO object and the row', async () => {
      const file: AdmissionFile = {
        id: 5,
        admissionId: 1,
        admission: admission,
        type: AdmissionFileType.BORDEREAU,
        originalName: 'bordereau.pdf',
        objectPath: 'admissions/bordereaux/x.pdf',
        mimetype: 'application/pdf',
        size: 123,
        creeLe: new Date(),
      };
      repo.findOne.mockResolvedValue(admission);
      filesRepo.findOne.mockResolvedValue(file);
      await service.removeFile(1, 5);
      expect(storage.deleteStoredRef).toHaveBeenCalledWith('admissions/bordereaux/x.pdf');
      expect(filesRepo.delete).toHaveBeenCalledWith(5);
    });
  });

  describe('legacy getDocument', () => {
    it('returns the stored PDF from legacy columns', async () => {
      repo.findOne.mockResolvedValue({ ...admission, cvPath: 'admissions/cv/old.pdf' });
      filesRepo.findOne.mockResolvedValue(null);
      const file = await service.getDocument(1, 'cv');
      expect(file.mimetype).toBe('application/pdf');
      expect(file.filename).toContain('CV-');
    });

    it('throws when kind is invalid', async () => {
      await expect(service.getDocument(1, 'photo')).rejects.toThrow(BadRequestException);
    });
  });

  it('findAll returns paginated admissions', async () => {
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(repo.createQueryBuilder).toHaveBeenCalledWith('admission');
  });

  it('findAll applies search and filters', async () => {
    await service.findAll({
      page: 1,
      limit: 10,
      q: 'john',
      statut: AdmissionStatus.EN_ATTENTE,
      niveau: 'Licence',
      formation: 'Gestion',
    });
    expect(queryBuilder.andWhere).toHaveBeenCalled();
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('admission.creeLe', 'DESC');
  });

  it('findOne returns an admission', async () => {
    repo.findOne.mockResolvedValue(admission);
    expect((await service.findOne(1)).id).toBe(1);
    expect(repo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ relations: { files: true } }),
    );
  });

  it('findOne throws NotFoundException when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('updateStatus updates and notifies the candidate', async () => {
    const updated = { ...admission, statut: AdmissionStatus.ACCEPTE, reponseLieu: 'Campus' };
    repo.findOne.mockResolvedValue(admission);
    repo.save.mockResolvedValue(updated);
    const result = await service.updateStatus(1, {
      statut: AdmissionStatus.ACCEPTE,
      reponseLieu: 'Campus',
    });
    expect(result.statut).toBe(AdmissionStatus.ACCEPTE);
    expect(mail.sendAdmissionStatusEmail).toHaveBeenCalledWith(
      admission.email,
      expect.objectContaining({ statut: AdmissionStatus.ACCEPTE, reponseLieu: 'Campus' }),
    );
  });

  it('remove deletes an existing admission and its files', async () => {
    repo.findOne.mockResolvedValue({
      ...admission,
      files: [
        {
          id: 1,
          objectPath: 'admissions/releves-bac/x.pdf',
        },
      ],
    });
    repo.remove.mockResolvedValue(undefined);
    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(storage.deleteStoredRef).toHaveBeenCalledWith('admissions/releves-bac/x.pdf');
  });
});
