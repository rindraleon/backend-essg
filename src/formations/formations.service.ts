import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Formation } from './entities/formation.entity';
import {
  CreateFormationDto,
  UpdateFormationDto,
} from './dto/create-formation.dto';
import {
  PaginationDto,
  PaginationResponse,
} from '../common/dto/pagination.dto';

@Injectable()
export class FormationsService {
  constructor(
    @InjectRepository(Formation)
    private readonly repo: Repository<Formation>,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Formation>> {
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
  ): Promise<PaginationResponse<Formation>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    if (!query) {
      const [data, total] = await this.repo.findAndCount({
        order: sortBy ? { [sortBy]: sortOrder } : { id: 'ASC' },
        skip,
        take: limit,
      });
      return new PaginationResponse(data, total, page, limit);
    }

    const [data, total] = await this.repo
      .createQueryBuilder('formation')
      .where('LOWER(formation.titre) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('LOWER(formation.description) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('formation.domaine::text LIKE LOWER(:query)', { query: `%${query}%` })
      .orderBy(sortBy ? `formation.${sortBy}` : 'formation.id', sortOrder)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return new PaginationResponse(data, total, page, limit);
  }

  async findOne(id: number): Promise<Formation> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Formation not found');
    return item;
  }

  async findBySlug(slug: string): Promise<Formation> {
    const item = await this.repo.findOne({ where: { slug } });
    if (!item) throw new NotFoundException('Formation not found');
    return item;
  }

  async create(dto: CreateFormationDto): Promise<Formation> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: number, dto: UpdateFormationDto): Promise<Formation> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
