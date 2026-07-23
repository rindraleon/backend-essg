import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AdmissionStatus } from '../entities/admission.entity';

export class UpdateAdmissionStatusDto {
  @IsEnum(AdmissionStatus)
  statut: AdmissionStatus;

  @IsOptional()
  @IsString()
  commentaire?: string;
}