import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { Admission, AdmissionStatus } from './entities/admission.entity';
import { MailService } from '../mail/mail.service';
import { StorageService } from '../common/storage/storage.service';

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
  let mail: { sendAdmissionConfirmationEmail: jest.Mock; sendAdmissionStatusEmail: jest.Mock };
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
    cvPath: '/uploads/cv.pdf',
    lettreMotivationPath: '',
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
    mail = {
      sendAdmissionConfirmationEmail: jest.fn().mockResolvedValue(undefined),
      sendAdmissionStatusEmail: jest.fn().mockResolvedValue(undefined),
    };
    const storage = {
      extractObjectName: jest.fn((url: string) => url.split('/').pop()),
      download: jest.fn().mockResolvedValue(Buffer.from('%PDF')),
      deleteStoredRef: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdmissionsService,
        { provide: getRepositoryToken(Admission), useValue: repo },
        { provide: MailService, useValue: mail },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<AdmissionsService>(AdmissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create saves an admission in pending status and sends confirmation', async () => {
    repo.create.mockReturnValue(admission);
    repo.save.mockResolvedValue(admission);
    const result = await service.create({
      nom: 'Doe',
      prenom: 'John',
      email: 'john@essg.sn',
      dateNaissance: '2000-01-01',
      niveau: 'Licence',
      formation: 'Licence Gestion',
      diplomePrecedent: 'Bac',
    } as never);
    expect(result.statut).toBe(AdmissionStatus.EN_ATTENTE);
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ nom: 'DOE', prenom: 'John', statut: AdmissionStatus.EN_ATTENTE }),
    );
    expect(mail.sendAdmissionConfirmationEmail).toHaveBeenCalled();
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

  it('getDocument returns the stored PDF', async () => {
    repo.findOne.mockResolvedValue(admission);
    const file = await service.getDocument(1, 'cv');
    expect(file.mimetype).toBe('application/pdf');
    expect(file.filename).toContain('CV-');
  });

  it('getDocument throws when kind is invalid', async () => {
    await expect(service.getDocument(1, 'photo')).rejects.toThrow();
  });

  it('remove deletes an existing admission', async () => {
    repo.findOne.mockResolvedValue(admission);
    repo.remove.mockResolvedValue(undefined);
    await expect(service.remove(1)).resolves.toBeUndefined();
  });
});
