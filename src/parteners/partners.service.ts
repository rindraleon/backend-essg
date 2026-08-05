import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Partenaire } from './entities/partner.entity';
import { CreatePartenaireDto, UpdatePartenaireDto } from './dto/create-partner.dto';
import { PaginationDto, PaginationResponse } from '../common/dto/pagination.dto';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partenaire)
    private readonly repo: Repository<Partenaire>,
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginationResponse<Partenaire>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      order: sortBy ? { [sortBy]: sortOrder } : { id: 'ASC' },
      skip,
      take: limit,
    });

    return new PaginationResponse(data, total, page, limit);
  }

  async search(
    query: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Partenaire>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const whereCondition: FindOptionsWhere<Partenaire> = {};

    if (query) {
      whereCondition.nom = query as FindOptionsWhere<Partenaire>['nom'];
      whereCondition.description = query as FindOptionsWhere<Partenaire>['description'];
    }

    const [data, total] = await this.repo.findAndCount({
      where: whereCondition,
      order: sortBy ? { [sortBy]: sortOrder } : { id: 'ASC' },
      skip,
      take: limit,
    });

    return new PaginationResponse(data, total, page, limit);
  }

  async findOne(id: number): Promise<Partenaire> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Partenaire non trouvé');
    return item;
  }

  async create(dto: CreatePartenaireDto): Promise<Partenaire> {
    const item = this.repo.create({
      ...dto,
      dateDebut: new Date(dto.dateDebut),
    });
    return this.repo.save(item);
  }

  async update(id: number, dto: UpdatePartenaireDto): Promise<Partenaire> {
    await this.repo.update(id, {
      ...dto,
      dateDebut: new Date(dto.dateDebut),
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
