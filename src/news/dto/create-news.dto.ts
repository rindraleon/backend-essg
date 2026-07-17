import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateActualiteDto {
  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  titre: string;

  @IsString()
  categorie: string;

  @IsString()
  date: string;

  @IsString()
  @IsOptional()
  resume?: string;

  @IsString()
  contenu: string;

  @IsString()
  auteur: string;

  @IsBoolean()
  @IsOptional()
  statut?: boolean;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  enVedette?: boolean;
}

export class UpdateActualiteDto extends CreateActualiteDto {}
