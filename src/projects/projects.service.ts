import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Projet } from './entities/project.entity';
import { CreateProjetDto, UpdateProjetDto } from './dto/create-project.dto';
import {
  PaginationDto,
  PaginationResponse,
} from '../common/dto/pagination.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Projet)
    private readonly repo: Repository<Projet>,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Projet>> {
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
  ): Promise<PaginationResponse<Projet>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const whereCondition: FindOptionsWhere<Projet> = {};

    if (query) {
      whereCondition.titre = query as FindOptionsWhere<Projet>['titre'];
      whereCondition.description =
        query as FindOptionsWhere<Projet>['description'];
    }

    const [data, total] = await this.repo.findAndCount({
      where: whereCondition,
      order: sortBy ? { [sortBy]: sortOrder } : { id: 'ASC' },
      skip,
      take: limit,
    });

    return new PaginationResponse(data, total, page, limit);
  }

  async findOne(id: number): Promise<Projet> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Projet non trouvé');
    return item;
  }

  async findBySlug(slug: string): Promise<Projet> {
    const item = await this.repo.findOne({ where: { slug } });
    if (!item) throw new NotFoundException('Projet non trouvé');
    return item;
  }

  async create(dto: CreateProjetDto): Promise<Projet> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: number, dto: UpdateProjetDto): Promise<Projet> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
