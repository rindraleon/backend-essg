import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionStatusDto } from './dto/update-admission-status.dto';
import { Admission, AdmissionStatus } from './entities/admission.entity';
import { capitalize, toUpperCase } from '../common/utils/text.util';

@Injectable()
export class AdmissionsService {
  private readonly logger = new Logger(AdmissionsService.name);

  constructor(
    @InjectRepository(Admission)
    private readonly admissionsRepository: Repository<Admission>,
    private readonly mailService: MailService,
  ) {}

  private buildReference(id: number): string {
    return `ESSG-${id}`;
  }

  async create(createAdmissionDto: CreateAdmissionDto): Promise<Admission> {
    const admission = this.admissionsRepository.create({
      ...createAdmissionDto,
      nom: toUpperCase(createAdmissionDto.nom),
      prenom: capitalize(createAdmissionDto.prenom),
      formation: capitalize(createAdmissionDto.formation),
      diplomePrecedent: capitalize(createAdmissionDto.diplomePrecedent),
      niveau: capitalize(createAdmissionDto.niveau),
      statut: AdmissionStatus.EN_ATTENTE,
    });
    const saved = await this.admissionsRepository.save(admission);

    try {
      await this.mailService.sendAdmissionConfirmationEmail(
        saved.email,
        saved.nom,
        saved.prenom,
        saved.formation,
        this.buildReference(saved.id),
      );
      this.logger.log(`Accusé de réception envoyé à ${saved.email}`);
    } catch (error) {
      this.logger.error(`Échec de l'envoi de l'accusé de réception à ${saved.email}`, error);
    }

    return saved;
  }

  async findAll(): Promise<Admission[]> {
    return this.admissionsRepository.find({
      order: { creeLe: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Admission> {
    const admission = await this.admissionsRepository.findOne({ where: { id } });
    if (!admission) {
      throw new NotFoundException(`Admission avec l'ID ${id} non trouvée`);
    }
    return admission;
  }

  async updateStatus(id: number, updateStatusDto: UpdateAdmissionStatusDto): Promise<Admission> {
    const admission = await this.findOne(id);

    admission.statut = updateStatusDto.statut;
    admission.commentaire = updateStatusDto.commentaire || admission.commentaire;

    const saved = await this.admissionsRepository.save(admission);

    await this.notifyStatusChange(saved);

    return saved;
  }

  private async notifyStatusChange(admission: Admission): Promise<void> {
    try {
      await this.mailService.sendAdmissionStatusEmail(admission.email, {
        nom: admission.nom,
        prenom: admission.prenom,
        formation: admission.formation,
        reference: this.buildReference(admission.id),
        statut: admission.statut,
        date: new Date().toLocaleDateString('fr-FR'),
        commentaire: admission.commentaire || undefined,
      });
      this.logger.log(`Notification de statut envoyée à ${admission.email}`);
    } catch (error) {
      this.logger.error(`Échec de la notification de statut à ${admission.email}`, error);
    }
  }

  async remove(id: number): Promise<void> {
    const admission = await this.findOne(id);
    await this.admissionsRepository.remove(admission);
  }
}
