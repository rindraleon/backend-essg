import { IsString, IsOptional, IsBoolean, IsInt, IsEmail, MinLength, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRessourceHumaineDto {
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  nom!: string;

  @IsString()
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le prénom ne peut pas dépasser 100 caractères' })
  prenom!: string;

  @IsString()
  @MinLength(2, { message: 'Le poste doit contenir au moins 2 caractères' })
  @MaxLength(150, { message: 'Le poste ne peut pas dépasser 150 caractères' })
  poste!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'La description ne peut pas dépasser 1000 caractères' })
  description?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  @MaxLength(150, { message: "L'email ne peut pas dépasser 150 caractères" })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Le téléphone ne peut pas dépasser 20 caractères' })
  telephone?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "L'ordre doit être un nombre entier" })
  @Min(0, { message: "L'ordre ne peut pas être négatif" })
  @Max(9999, { message: "L'ordre ne peut pas dépasser 9999" })
  ordre?: number;
}

export class UpdateRessourceHumaineDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  nom?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le prénom ne peut pas dépasser 100 caractères' })
  prenom?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Le poste doit contenir au moins 2 caractères' })
  @MaxLength(150, { message: 'Le poste ne peut pas dépasser 150 caractères' })
  poste?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'La description ne peut pas dépasser 1000 caractères' })
  description?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  @MaxLength(150, { message: "L'email ne peut pas dépasser 150 caractères" })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Le téléphone ne peut pas dépasser 20 caractères' })
  telephone?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "L'ordre doit être un nombre entier" })
  @Min(0, { message: "L'ordre ne peut pas être négatif" })
  @Max(9999, { message: "L'ordre ne peut pas dépasser 9999" })
  ordre?: number;
}