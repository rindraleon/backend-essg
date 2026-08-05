import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admission, AdmissionStatus } from './entities/admission.entity';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionStatusDto } from './dto/update-admission-status.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AdmissionsService {
  constructor(
    @InjectRepository(Admission)
    private readonly admissionsRepository: Repository<Admission>,
    private readonly mailService: MailService,
  ) {}

  async create(createAdmissionDto: CreateAdmissionDto): Promise<Admission> {
    const admission = this.admissionsRepository.create({
      ...createAdmissionDto,
      statut: AdmissionStatus.EN_ATTENTE,
    });
    const saved = await this.admissionsRepository.save(admission);

    try {
      await this.mailService.sendAdmissionConfirmationEmail(
        saved.email,
        saved.nom,
        saved.prenom,
        saved.formation,
        process.env.APP_URL || 'http://localhost:3000',
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'accusé de réception", error);
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

    return this.admissionsRepository.save(admission);
  }

  async remove(id: number): Promise<void> {
    const admission = await this.findOne(id);
    await this.admissionsRepository.remove(admission);
  }
}
