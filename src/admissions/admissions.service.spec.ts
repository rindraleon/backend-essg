import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { Admission, AdmissionStatus } from './entities/admission.entity';
import { MailService } from '../mail/mail.service';

describe('AdmissionsService', () => {
  let service: AdmissionsService;
  let repo: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let mail: { sendAdmissionConfirmationEmail: jest.Mock; sendAdmissionStatusEmail: jest.Mock };

  const admission: Admission = {
    id: 1,
    nom: 'Doe',
    prenom: 'John',
    email: 'john@essg.sn',
    telephone: '',
    dateNaissance: '2000-01-01',
    niveau: 'Licence',
    formation: 'Licence Gestion',
    diplomePrecedent: 'Bac',
    cvPath: '',
    lettreMotivationPath: '',
    statut: AdmissionStatus.EN_ATTENTE,
    commentaire: '',
    creeLe: new Date(),
    misAJourLe: new Date(),
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    mail = {
      sendAdmissionConfirmationEmail: jest.fn().mockResolvedValue(undefined),
      sendAdmissionStatusEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdmissionsService,
        { provide: getRepositoryToken(Admission), useValue: repo },
        { provide: MailService, useValue: mail },
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

  it('findAll returns admissions ordered by date desc', async () => {
    repo.find.mockResolvedValue([admission]);
    expect(await service.findAll()).toHaveLength(1);
    expect(repo.find).toHaveBeenCalledWith({ order: { creeLe: 'DESC' } });
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
    const updated = { ...admission, statut: AdmissionStatus.ACCEPTE };
    repo.findOne.mockResolvedValue(admission);
    repo.save.mockResolvedValue(updated);
    const result = await service.updateStatus(1, { statut: AdmissionStatus.ACCEPTE });
    expect(result.statut).toBe(AdmissionStatus.ACCEPTE);
    expect(mail.sendAdmissionStatusEmail).toHaveBeenCalledWith(
      admission.email,
      expect.objectContaining({ statut: AdmissionStatus.ACCEPTE }),
    );
  });

  it('remove deletes an existing admission', async () => {
    repo.findOne.mockResolvedValue(admission);
    repo.remove.mockResolvedValue(undefined);
    await expect(service.remove(1)).resolves.toBeUndefined();
  });
});
