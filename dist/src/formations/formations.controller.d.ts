import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateFormationDto, UpdateFormationDto } from './dto/create-formation.dto';
import { FormationsService } from './formations.service';
export declare class FormationsController {
    private readonly service;
    constructor(service: FormationsService);
    findAll(paginationDto: PaginationQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedData<import("./entities/formation.entity").Formation>>;
    search(query: string, paginationDto: PaginationQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedData<import("./entities/formation.entity").Formation>>;
    findBySlug(slug: string): Promise<import("./entities/formation.entity").Formation>;
    findOne(id: number): Promise<import("./entities/formation.entity").Formation>;
    create(dto: CreateFormationDto): Promise<import("./entities/formation.entity").Formation>;
    update(id: number, dto: UpdateFormationDto): Promise<import("./entities/formation.entity").Formation>;
    remove(id: number): Promise<void>;
}
