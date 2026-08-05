import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn(['date', 'titre', 'categorie', 'id', 'creeLe', 'misAJourLe', 'ordre'])
  sortBy?: 'date' | 'titre' | 'categorie' | 'id' | 'creeLe' | 'misAJourLe' | 'ordre';

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

// DTO pour accepter les paramètres de pagination depuis les query strings
export class PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn(['date', 'titre', 'categorie', 'id', 'creeLe', 'misAJourLe', 'ordre'])
  sortBy?: 'date' | 'titre' | 'categorie' | 'id' | 'creeLe' | 'misAJourLe' | 'ordre';

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}
