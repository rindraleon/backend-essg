import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { StorageService } from '../common/storage/storage.service';
import { CreatePartenaireDto, UpdatePartenaireDto } from './dto/create-partner.dto';
import { PartnersService } from './partners.service';
export declare class PartnersController {
    private readonly service;
    private readonly storageService;
    constructor(service: PartnersService, storageService: StorageService);
    findAll(paginationDto: PaginationQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedData<import("./entities/partner.entity").Partenaire>>;
    search(query: string, paginationDto: PaginationQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedData<import("./entities/partner.entity").Partenaire>>;
    findOne(id: number): Promise<import("./entities/partner.entity").Partenaire>;
    findBySlug(slug: string): Promise<import("./entities/partner.entity").Partenaire>;
    findByName(nom: string): Promise<import("./entities/partner.entity").Partenaire>;
    create(dto: CreatePartenaireDto, file?: Express.Multer.File): Promise<import("./entities/partner.entity").Partenaire>;
    update(id: number, dto: UpdatePartenaireDto, file?: Express.Multer.File): Promise<import("./entities/partner.entity").Partenaire>;
    remove(id: number): Promise<void>;
}
