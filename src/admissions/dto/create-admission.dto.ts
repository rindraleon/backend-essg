import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { AdmissionStatus } from '../entities/admission.entity';

export class CreateAdmissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nom: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  prenom: string;

  @IsEmail()
  @MaxLength(120)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telephone?: string;

  @IsDateString()
  dateNaissance: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  niveau: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  formation: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  diplomePrecedent: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  cvPath?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  lettreMotivationPath?: string;

  @IsOptional()
  @IsEnum(AdmissionStatus)
  statut?: AdmissionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  commentaire?: string;
}
