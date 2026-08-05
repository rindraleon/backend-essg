import { IsOptional, IsString } from 'class-validator';

export class UploadAvatarDto {
  @IsString()
  @IsOptional()
  avatar?: string;
}
