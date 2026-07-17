export declare class PaginationDto {
    page?: number;
    limit?: number;
    sortBy?: 'date' | 'titre' | 'categorie' | 'id' | 'creeLe' | 'misAJourLe' | 'ordre';
    sortOrder?: 'ASC' | 'DESC';
}
export declare class PaginationQueryDto {
    page?: number;
    limit?: number;
    sortBy?: 'date' | 'titre' | 'categorie' | 'id' | 'creeLe' | 'misAJourLe' | 'ordre';
    sortOrder?: 'ASC' | 'DESC';
}
export declare class PaginationResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    constructor(data: T[], total: number, page: number, limit: number);
}
