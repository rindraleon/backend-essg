import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Pagination dédiée à la liste des utilisateurs du back-office.
 *
 * Même plafond que `PresenceQueryDto` : les deux requêtes (liste des
 * comptes et carte de présence) doivent couvrir le même ensemble
 * d'utilisateurs, sinon la colonne « Présence » serait fausse pour les
 * comptes hors page.
 */
export class UsersListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;
}
