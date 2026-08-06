import { Repository } from 'typeorm';
import { Partenaire } from './entities/partner.entity';
import { CreatePartenaireDto, UpdatePartenaireDto } from './dto/create-partner.dto';
import { PaginationDto, PaginationResponse } from '../common/dto/pagination.dto';
export declare class PartnersService {
    private readonly repo;
    constructor(repo: Repository<Partenaire>);
    findAll(paginationDto: PaginationDto): Promise<PaginationResponse<Partenaire>>;
    search(query: string, paginationDto: PaginationDto): Promise<PaginationResponse<Partenaire>>;
    findById(id: number): Promise<Partenaire>;
    findBySlug(slug: string): Promise<Partenaire>;
    findByName(nom: string): Promise<Partenaire>;
    findOne(id: number): Promise<Partenaire>;
    create(dto: CreatePartenaireDto): Promise<Partenaire>;
    update(id: number, dto: UpdatePartenaireDto): Promise<Partenaire>;
    remove(id: number): Promise<void>;
}
