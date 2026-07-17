import { Repository } from 'typeorm';
import { Projet } from './entities/project.entity';
import { CreateProjetDto, UpdateProjetDto } from './dto/create-project.dto';
import { PaginationDto, PaginationResponse } from '../common/dto/pagination.dto';
export declare class ProjectsService {
    private readonly repo;
    constructor(repo: Repository<Projet>);
    findAll(paginationDto: PaginationDto): Promise<PaginationResponse<Projet>>;
    search(query: string, paginationDto: PaginationDto): Promise<PaginationResponse<Projet>>;
    findOne(id: number): Promise<Projet>;
    findBySlug(slug: string): Promise<Projet>;
    create(dto: CreateProjetDto): Promise<Projet>;
    update(id: number, dto: UpdateProjetDto): Promise<Projet>;
    remove(id: number): Promise<void>;
}
