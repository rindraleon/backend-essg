import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  prenom: string;

  @IsString()
  nom: string;

  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsString()
  sujet: string;

  @IsString()
  message: string;

  @IsBoolean()
  @IsOptional()
  lu?: boolean;
}

export class UpdateMessageDto {
  @IsBoolean()
  lu: boolean;
}
