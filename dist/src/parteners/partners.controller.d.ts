import { PartnersService } from './partners.service';
import { CreatePartenaireDto, UpdatePartenaireDto } from './dto/create-partner.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
export declare class PartnersController {
    private readonly service;
    constructor(service: PartnersService);
    findAll(paginationDto: PaginationQueryDto): Promise<import("../common/dto/pagination.dto").PaginationResponse<import("./entities/partner.entity").Partenaire>>;
    search(query: string, paginationDto: PaginationQueryDto): Promise<import("../common/dto/pagination.dto").PaginationResponse<import("./entities/partner.entity").Partenaire>>;
    findOne(id: number): Promise<import("./entities/partner.entity").Partenaire>;
    create(dto: CreatePartenaireDto, file: Express.Multer.File): Promise<import("./entities/partner.entity").Partenaire>;
    update(id: number, dto: UpdatePartenaireDto, file: Express.Multer.File): Promise<import("./entities/partner.entity").Partenaire>;
    remove(id: number): Promise<void>;
}
