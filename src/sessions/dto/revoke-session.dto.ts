import { IsOptional, IsString, MaxLength } from 'class-validator';

/** Corps optionnel d'une révocation administrative (Spec §10). */
export class RevokeSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}
