import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { AdmissionStatus } from '../entities/admission.entity';

export class CreateAdmissionDto {
  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsDateString()
  dateNaissance: string;

  @IsString()
  niveau: string;

  @IsString()
  formation: string;

  @IsString()
  diplomePrecedent: string;

  @IsOptional()
  @IsString()
  cvPath?: string;

  @IsOptional()
  @IsString()
  lettreMotivationPath?: string;

  @IsOptional()
  @IsEnum(AdmissionStatus)
  statut?: AdmissionStatus;

  @IsOptional()
  @IsString()
  commentaire?: string;
}