import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';

export class CreatePartenaireDto {
  @IsString()
  nom: string = '';

  @IsString()
  @IsOptional()
  slug?: string;

  @IsIn(['Entreprise', 'Institution', 'Organisation', 'Autre'])
  type: 'Entreprise' | 'Institution' | 'Organisation' | 'Autre' = 'Entreprise';

  @IsString()
  secteur: string = '';

  @IsString()
  description: string = '';

  @IsString()
  @IsOptional()
  siteWeb?: string;

  @IsString()
  @IsOptional()
  logo?: string = '🤝';

  @IsString()
  @IsOptional()
  contact?: string;

  @IsDateString()
  dateDebut: string = new Date().toISOString().split('T')[0];
}

export class UpdatePartenaireDto extends CreatePartenaireDto {}
