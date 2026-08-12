import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedData } from '../common/interfaces/api-response.interface';
import { CreateActualiteDto, UpdateActualiteDto } from './dto/create-news.dto';
import { Actualite } from './entities/news-item.entity';
export declare class NewsService {
    private readonly repo;
    constructor(repo: Repository<Actualite>);
    private findPaginated;
    findAll(paginationDto: PaginationDto): Promise<PaginatedData<Actualite>>;
    search(query: string, paginationDto: PaginationDto): Promise<PaginatedData<Actualite>>;
    findOne(id: number): Promise<Actualite>;
    findBySlug(slug: string): Promise<Actualite>;
    create(dto: CreateActualiteDto): Promise<Actualite>;
    update(id: number, dto: UpdateActualiteDto): Promise<Actualite>;
    remove(id: number): Promise<void>;
}
