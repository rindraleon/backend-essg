import { IsString, IsArray, IsOptional, IsIn } from 'class-validator';

export class CreateProjetDto {
  @IsString()
  titre: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsIn(['International', 'Service public', 'Recherche', 'Partenariat'])
  type: 'International' | 'Service public' | 'Recherche' | 'Partenariat';

  @IsString()
  date: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  partenaires: string[];

  @IsString()
  @IsOptional()
  image?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  ville?: string;

  @IsString()
  @IsOptional()
  pays?: string;

  @IsString()
  @IsOptional()
  adresse?: string;
}

export class UpdateProjetDto extends CreateProjetDto {}
