import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { AdmissionStatus } from '../entities/admission.entity';

export class UpdateAdmissionStatusDto {
  @IsEnum(AdmissionStatus)
  statut: AdmissionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  commentaire?: string;
}
