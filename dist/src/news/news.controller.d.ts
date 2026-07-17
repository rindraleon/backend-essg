import { NewsService } from './news.service';
import { CreateActualiteDto, UpdateActualiteDto } from './dto/create-news.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
export declare class NewsController {
    private readonly service;
    constructor(service: NewsService);
    findAll(paginationDto: PaginationQueryDto): Promise<import("../common/dto/pagination.dto").PaginationResponse<import("./entities/news-item.entity").Actualite>>;
    search(query: string, paginationDto: PaginationQueryDto): Promise<import("../common/dto/pagination.dto").PaginationResponse<import("./entities/news-item.entity").Actualite>>;
    findBySlug(slug: string): Promise<import("./entities/news-item.entity").Actualite>;
    findOne(id: number): Promise<import("./entities/news-item.entity").Actualite>;
    create(dto: CreateActualiteDto): Promise<import("./entities/news-item.entity").Actualite>;
    update(id: number, dto: UpdateActualiteDto): Promise<import("./entities/news-item.entity").Actualite>;
    remove(id: number): Promise<void>;
}
