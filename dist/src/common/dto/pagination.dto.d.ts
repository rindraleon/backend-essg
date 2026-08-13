export declare class PaginationDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export declare class PaginationQueryDto extends PaginationDto {
    page?: number;
    limit?: number;
    q?: string;
}
