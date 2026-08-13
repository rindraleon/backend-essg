import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateProjetDto, UpdateProjetDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private readonly service;
    constructor(service: ProjectsService);
    findAll(paginationDto: PaginationQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedData<import("./entities/project.entity").Projet>>;
    search(query: string, paginationDto: PaginationQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedData<import("./entities/project.entity").Projet>>;
    findBySlug(slug: string): Promise<import("./entities/project.entity").Projet>;
    findOne(id: number): Promise<import("./entities/project.entity").Projet>;
    create(dto: CreateProjetDto): Promise<import("./entities/project.entity").Projet>;
    update(id: number, dto: UpdateProjetDto): Promise<import("./entities/project.entity").Projet>;
    remove(id: number): Promise<void>;
}
