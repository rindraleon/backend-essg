import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateRessourceHumaineDto, UpdateRessourceHumaineDto } from './dto/create-ressource-humaine.dto';
import { RessourcesHumainesService } from './ressources-humaines.service';
export declare class RessourcesHumainesController {
    private readonly service;
    constructor(service: RessourcesHumainesService);
    findAll(paginationDto: PaginationQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedData<import("./entities/ressource-humaine.entity").RessourceHumaine>>;
    search(query: string, paginationDto: PaginationQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedData<import("./entities/ressource-humaine.entity").RessourceHumaine>>;
    findBySlug(slug: string): Promise<import("./entities/ressource-humaine.entity").RessourceHumaine>;
    findOne(id: number): Promise<import("./entities/ressource-humaine.entity").RessourceHumaine>;
    create(dto: CreateRessourceHumaineDto): Promise<import("./entities/ressource-humaine.entity").RessourceHumaine>;
    update(id: number, dto: UpdateRessourceHumaineDto): Promise<import("./entities/ressource-humaine.entity").RessourceHumaine>;
    remove(id: number): Promise<void>;
}
