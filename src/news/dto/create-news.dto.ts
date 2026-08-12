import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateActualiteDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  slug?: string;

  @IsString()
  @MaxLength(150)
  titre: string;

  @IsString()
  @MaxLength(60)
  categorie: string;

  @IsString()
  @MaxLength(20)
  date: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  resume?: string;

  @IsString()
  @MaxLength(30000)
  contenu: string;

  @IsString()
  @MaxLength(100)
  auteur: string;

  @IsBoolean()
  @IsOptional()
  statut?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  image?: string;

  @IsBoolean()
  @IsOptional()
  enVedette?: boolean;
}

export class UpdateActualiteDto extends CreateActualiteDto {}
