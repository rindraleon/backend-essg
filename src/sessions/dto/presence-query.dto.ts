import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Pagination dédiée à l'endpoint de présence back-office.
 *
 * La liste des utilisateurs est consommée en une seule page par le
 * back-office (le tableau est paginé côté client) : le plafond est donc
 * volontairement plus élevé que le `PaginationQueryDto` générique afin que
 * la carte de présence couvre exactement le même ensemble d'utilisateurs
 * que la liste affichée. Sans cet alignement, un utilisateur présent dans
 * la liste mais absent de la page de présence serait affiché « Hors ligne »
 * à tort.
 */
export class PresenceQueryDto {
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
}
