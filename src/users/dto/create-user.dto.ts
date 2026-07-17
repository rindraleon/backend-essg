import {
  IsString,
  IsEmail,
  IsOptional,
  IsIn,
  IsBoolean,
  MinLength,
} from 'class-validator';

export class CreateUtilisateurDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  motDePasse: string;

  @IsString()
  prenom: string;

  @IsString()
  nom: string;

  @IsIn(['admin', 'editeur', 'lecteur'])
  @IsOptional()
  role?: 'admin' | 'editeur' | 'lecteur';

  @IsBoolean()
  @IsOptional()
  estActif?: boolean;

  @IsString()
  @IsOptional()
  avatar?: string;
}