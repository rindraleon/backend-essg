import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedData } from '../common/interfaces/api-response.interface';
import { CreateFormationDto, UpdateFormationDto } from './dto/create-formation.dto';
import { Formation } from './entities/formation.entity';
import { RessourceHumaine } from '../ressources-humaines/entities/ressource-humaine.entity';
export declare class FormationsService {
    private readonly repo;
    private readonly ressourceRepo;
    constructor(repo: Repository<Formation>, ressourceRepo: Repository<RessourceHumaine>);
    private resolveResponsable;
    findAll(paginationDto: PaginationDto): Promise<PaginatedData<Formation>>;
    search(query: string, paginationDto: PaginationDto): Promise<PaginatedData<Formation>>;
    findOne(id: number): Promise<Formation>;
    findBySlug(slug: string): Promise<Formation>;
    create(dto: CreateFormationDto): Promise<Formation>;
    update(id: number, dto: UpdateFormationDto): Promise<Formation>;
    remove(id: number): Promise<void>;
    private resolveHierarchy;
    private saveOrConflict;
    private rethrowUnique;
}
