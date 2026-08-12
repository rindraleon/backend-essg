import { IsString, IsArray, IsOptional, IsIn, MaxLength } from 'class-validator';

export class CreateProjetDto {
  @IsString()
  @MaxLength(150)
  titre: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  slug?: string;

  @IsIn(['International', 'Service public', 'Recherche', 'Partenariat'])
  type: 'International' | 'Service public' | 'Recherche' | 'Partenariat';

  @IsString()
  @MaxLength(20)
  date: string;

  @IsString()
  @MaxLength(10000)
  description: string;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  partenaires: string[];

  @IsString()
  @IsOptional()
  @MaxLength(255)
  image?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  ville?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  pays?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  adresse?: string;
}

export class UpdateProjetDto extends CreateProjetDto {}
