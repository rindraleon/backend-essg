import {
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
  IsIn,
  IsInt,
} from 'class-validator';

export class CreateFormationDto {
  @IsString()
  slug: string;

  @IsArray()
  @IsString({ each: true })
  domaine: string[];

  @IsString()
  titre: string;

  @IsIn(['Licence', 'Master', 'Doctorat'])
  niveau: 'Licence' | 'Master' | 'Doctorat';

  @IsString()
  duree: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  objectifs: string[];

  @IsArray()
  @IsString({ each: true })
  debouches: string[];

  @IsString()
  conditionsAcces: string;

  @IsArray()
  @IsString({ each: true })
  programme: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  conditions?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  competences?: string[];

  @IsArray()
  @IsOptional()
  modules?: any[];

  @IsString()
  @IsOptional()
  responsable?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  enVedette?: boolean;

  @IsInt()
  credits: number;
}

export class UpdateFormationDto extends CreateFormationDto {}
