import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedData } from '../common/interfaces/api-response.interface';
import { CreateProjetDto, UpdateProjetDto } from './dto/create-project.dto';
import { Projet } from './entities/project.entity';
import { Partenaire } from '../parteners/entities/partner.entity';
export declare class ProjectsService {
    private readonly repo;
    private readonly partnerRepo;
    constructor(repo: Repository<Projet>, partnerRepo: Repository<Partenaire>);
    private resolvePartenaires;
    private findPaginated;
    findAll(paginationDto: PaginationDto): Promise<PaginatedData<Projet>>;
    search(query: string, paginationDto: PaginationDto): Promise<PaginatedData<Projet>>;
    findOne(id: number): Promise<Projet>;
    findBySlug(slug: string): Promise<Projet>;
    create(dto: CreateProjetDto): Promise<Projet>;
    update(id: number, dto: UpdateProjetDto): Promise<Projet>;
    remove(id: number): Promise<void>;
}
