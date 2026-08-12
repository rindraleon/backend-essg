import {
  IsString,
  IsEmail,
  IsOptional,
  IsIn,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUtilisateurDto {
  @IsEmail()
  @MaxLength(120)
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  motDePasse: string;

  @IsString()
  @MaxLength(100)
  prenom: string;

  @IsString()
  @MaxLength(100)
  nom: string;

  @IsIn(['admin', 'editeur', 'lecteur'])
  @IsOptional()
  role?: 'admin' | 'editeur' | 'lecteur';

  @IsBoolean()
  @IsOptional()
  estActif?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  avatar?: string;
}
