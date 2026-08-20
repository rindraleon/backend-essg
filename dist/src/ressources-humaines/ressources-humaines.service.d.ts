import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedData } from '../common/interfaces/api-response.interface';
import { CreateRessourceHumaineDto, UpdateRessourceHumaineDto } from './dto/create-ressource-humaine.dto';
import { RessourceHumaine } from './entities/ressource-humaine.entity';
import { EmailDomainService } from '../common/validators/email-domain.service';
export declare class RessourcesHumainesService {
    private readonly repo;
    private readonly emailDomainService;
    constructor(repo: Repository<RessourceHumaine>, emailDomainService: EmailDomainService);
    private assertEmailDomainExists;
    private findPaginated;
    findAll(paginationDto: PaginationDto): Promise<PaginatedData<RessourceHumaine>>;
    findAllIncludingInactive(paginationDto: PaginationDto): Promise<PaginatedData<RessourceHumaine>>;
    search(query: string, paginationDto: PaginationDto): Promise<PaginatedData<RessourceHumaine>>;
    findOne(id: number): Promise<RessourceHumaine>;
    findBySlug(slug: string): Promise<RessourceHumaine>;
    create(dto: CreateRessourceHumaineDto): Promise<RessourceHumaine>;
    update(id: number, dto: UpdateRessourceHumaineDto): Promise<RessourceHumaine>;
    remove(id: number): Promise<void>;
}
