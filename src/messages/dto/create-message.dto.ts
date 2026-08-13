import { IsString, IsOptional, IsBoolean, IsEmail, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  prenom: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nom: string;

  @IsEmail()
  @MaxLength(120)
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  telephone?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  sujet: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  message: string;

  @IsBoolean()
  @IsOptional()
  lu?: boolean;
}

export class UpdateMessageDto {
  @IsBoolean()
  lu: boolean;
}
