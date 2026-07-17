import { Repository } from 'typeorm';
import { Actualite } from './entities/news-item.entity';
import { CreateActualiteDto, UpdateActualiteDto } from './dto/create-news.dto';
import { PaginationDto, PaginationResponse } from '../common/dto/pagination.dto';
export declare class NewsService {
    private readonly repo;
    constructor(repo: Repository<Actualite>);
    findAll(paginationDto: PaginationDto): Promise<PaginationResponse<Actualite>>;
    search(query: string, paginationDto: PaginationDto): Promise<PaginationResponse<Actualite>>;
    findOne(id: number): Promise<Actualite>;
    findBySlug(slug: string): Promise<Actualite>;
    create(dto: CreateActualiteDto): Promise<Actualite>;
    update(id: number, dto: UpdateActualiteDto): Promise<Actualite>;
    remove(id: number): Promise<void>;
}
