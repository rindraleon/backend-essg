import { Repository } from 'typeorm';
import { Formation } from './entities/formation.entity';
import { CreateFormationDto, UpdateFormationDto } from './dto/create-formation.dto';
import { PaginationDto, PaginationResponse } from '../common/dto/pagination.dto';
export declare class FormationsService {
    private readonly repo;
    constructor(repo: Repository<Formation>);
    findAll(paginationDto: PaginationDto): Promise<PaginationResponse<Formation>>;
    search(query: string, paginationDto: PaginationDto): Promise<PaginationResponse<Formation>>;
    findOne(id: number): Promise<Formation>;
    findBySlug(slug: string): Promise<Formation>;
    create(dto: CreateFormationDto): Promise<Formation>;
    update(id: number, dto: UpdateFormationDto): Promise<Formation>;
    remove(id: number): Promise<void>;
}
