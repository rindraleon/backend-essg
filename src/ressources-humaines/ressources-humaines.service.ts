import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { RessourceHumaine } from './entities/ressource-humaine.entity';
import {
  CreateRessourceHumaineDto,
  UpdateRessourceHumaineDto,
} from './dto/create-ressource-humaine.dto';
import { PaginationDto, PaginationResponse } from '../common/dto/pagination.dto';

function generateSlug(nom: string, prenom: string): string {
  return `${nom}-${prenom}`
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class RessourcesHumainesService {
  constructor(
    @InjectRepository(RessourceHumaine)
    private readonly repo: Repository<RessourceHumaine>,
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginationResponse<RessourceHumaine>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      where: { actif: true },
      order: sortBy ? { [sortBy]: sortOrder } : { ordre: 'ASC', id: 'ASC' },
      skip,
      take: limit,
    });

    return new PaginationResponse(data, total, page, limit);
  }

  async findAllIncludingInactive(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<RessourceHumaine>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      order: sortBy ? { [sortBy]: sortOrder } : { ordre: 'ASC', id: 'ASC' },
      skip,
      take: limit,
    });

    return new PaginationResponse(data, total, page, limit);
  }

  async search(
    query: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<RessourceHumaine>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const whereCondition: FindOptionsWhere<RessourceHumaine> = { actif: true };

    if (query) {
      const searchTerm = `%${query}%`;
      return this.repo
        .createQueryBuilder('ressource')
        .where('ressource.actif = :actif', { actif: true })
        .andWhere(
          '(ressource.nom ILIKE :search OR ressource.prenom ILIKE :search OR ressource.poste ILIKE :search)',
          { search: searchTerm },
        )
        .orderBy(sortBy ? `ressource.${sortBy}` : 'ressource.ordre', sortOrder)
        .skip(skip)
        .take(limit)
        .getManyAndCount()
        .then(([data, total]) => new PaginationResponse(data, total, page, limit));
    }

    const [data, total] = await this.repo.findAndCount({
      where: whereCondition,
      order: sortBy ? { [sortBy]: sortOrder } : { ordre: 'ASC', id: 'ASC' },
      skip,
      take: limit,
    });

    return new PaginationResponse(data, total, page, limit);
  }

  async findOne(id: number): Promise<RessourceHumaine> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Ressource humaine non trouvée');
    return item;
  }

  async findBySlug(slug: string): Promise<RessourceHumaine> {
    const item = await this.repo.findOne({ where: { slug } });
    if (!item) throw new NotFoundException('Ressource humaine non trouvée');
    return item;
  }

  async create(dto: CreateRessourceHumaineDto): Promise<RessourceHumaine> {
    const slug = generateSlug(dto.nom, dto.prenom);
    const item = this.repo.create({
      ...dto,
      slug,
      actif: dto.actif ?? true,
      ordre: dto.ordre ?? 0,
      photo: dto.photo || '',
    });
    return this.repo.save(item);
  }

  async update(id: number, dto: UpdateRessourceHumaineDto): Promise<RessourceHumaine> {
    const updateData: QueryDeepPartialEntity<RessourceHumaine> = { ...dto };

    if (dto.nom || dto.prenom) {
      const current = await this.findOne(id);
      const nom = dto.nom || current.nom;
      const prenom = dto.prenom || current.prenom;
      updateData.slug = generateSlug(nom, prenom);
    }

    if (dto.actif !== undefined) {
      updateData.actif = dto.actif;
    }
    if (dto.ordre !== undefined) {
      updateData.ordre = dto.ordre;
    }
    if (dto.photo !== undefined) {
      updateData.photo = dto.photo || '';
    }

    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
