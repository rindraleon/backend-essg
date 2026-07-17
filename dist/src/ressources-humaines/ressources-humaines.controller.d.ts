import { RessourcesHumainesService } from './ressources-humaines.service';
import { CreateRessourceHumaineDto, UpdateRessourceHumaineDto } from './dto/create-ressource-humaine.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
export declare class RessourcesHumainesController {
    private readonly service;
    constructor(service: RessourcesHumainesService);
    findAll(paginationDto: PaginationQueryDto): Promise<import("../common/dto/pagination.dto").PaginationResponse<import("./entities/ressource-humaine.entity").RessourceHumaine>>;
    search(query: string, paginationDto: PaginationQueryDto): Promise<import("../common/dto/pagination.dto").PaginationResponse<import("./entities/ressource-humaine.entity").RessourceHumaine>>;
    findOne(id: number): Promise<import("./entities/ressource-humaine.entity").RessourceHumaine>;
    create(dto: CreateRessourceHumaineDto): Promise<import("./entities/ressource-humaine.entity").RessourceHumaine>;
    update(id: number, dto: UpdateRessourceHumaineDto): Promise<import("./entities/ressource-humaine.entity").RessourceHumaine>;
    remove(id: number): Promise<void>;
}
