import { Repository } from 'typeorm';
import { RessourceHumaine } from './entities/ressource-humaine.entity';
import { CreateRessourceHumaineDto, UpdateRessourceHumaineDto } from './dto/create-ressource-humaine.dto';
import { PaginationDto, PaginationResponse } from '../common/dto/pagination.dto';
export declare class RessourcesHumainesService {
    private readonly repo;
    constructor(repo: Repository<RessourceHumaine>);
    findAll(paginationDto: PaginationDto): Promise<PaginationResponse<RessourceHumaine>>;
    findAllIncludingInactive(paginationDto: PaginationDto): Promise<PaginationResponse<RessourceHumaine>>;
    search(query: string, paginationDto: PaginationDto): Promise<PaginationResponse<RessourceHumaine>>;
    findOne(id: number): Promise<RessourceHumaine>;
    findBySlug(slug: string): Promise<RessourceHumaine>;
    create(dto: CreateRessourceHumaineDto): Promise<RessourceHumaine>;
    update(id: number, dto: UpdateRessourceHumaineDto): Promise<RessourceHumaine>;
    remove(id: number): Promise<void>;
}
