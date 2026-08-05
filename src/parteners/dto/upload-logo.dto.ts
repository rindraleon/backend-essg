import { IsOptional, IsString } from 'class-validator';

export class UploadLogoDto {
  @IsOptional()
  @IsString()
  logo?: string;
}
