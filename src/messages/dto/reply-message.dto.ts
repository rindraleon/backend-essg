import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReplyMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sujet?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  message: string;
}
