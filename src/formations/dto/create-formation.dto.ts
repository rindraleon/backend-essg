import { IsString, IsArray, IsBoolean, IsOptional, IsIn, IsInt, MaxLength } from 'class-validator';

export class CreateFormationDto {
  @IsString()
  @MaxLength(150)
  slug: string;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  domaine: string[];

  @IsString()
  @MaxLength(150)
  titre: string;

  @IsIn(['Licence', 'Master', 'Doctorat'])
  niveau: 'Licence' | 'Master' | 'Doctorat';

  @IsString()
  @MaxLength(60)
  duree: string;

  @IsString()
  @MaxLength(10000)
  description: string;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  objectifs: string[];

  @IsArray()
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  debouches: string[];

  @IsString()
  @MaxLength(10000)
  conditionsAcces: string;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  programme: string[];

  @IsArray()
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  @IsOptional()
  conditions?: string[];

  @IsArray()
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  @IsOptional()
  competences?: string[];

  @IsArray()
  @IsOptional()
  modules?: any[];

  @IsString()
  @IsOptional()
  @MaxLength(100)
  responsable?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  image?: string;

  @IsBoolean()
  @IsOptional()
  enVedette?: boolean;

  @IsInt()
  credits: number;
}

export class UpdateFormationDto extends CreateFormationDto {}
