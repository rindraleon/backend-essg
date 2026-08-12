import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedData } from '../common/interfaces/api-response.interface';
import { CreatePartenaireDto, UpdatePartenaireDto } from './dto/create-partner.dto';
import { Partenaire } from './entities/partner.entity';
export declare class PartnersService {
    private readonly repo;
    constructor(repo: Repository<Partenaire>);
    private findPaginated;
    findAll(paginationDto: PaginationDto): Promise<PaginatedData<Partenaire>>;
    search(query: string, paginationDto: PaginationDto): Promise<PaginatedData<Partenaire>>;
    findOne(id: number): Promise<Partenaire>;
    findBySlug(slug: string): Promise<Partenaire>;
    findByName(nom: string): Promise<Partenaire>;
    create(dto: CreatePartenaireDto): Promise<Partenaire>;
    update(id: number, dto: UpdatePartenaireDto): Promise<Partenaire>;
    remove(id: number): Promise<void>;
}
