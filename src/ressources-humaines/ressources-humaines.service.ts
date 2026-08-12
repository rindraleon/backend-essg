import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedData } from '../common/interfaces/api-response.interface';
import { buildPaginatedData } from '../common/utils/pagination.util';
import {
  CreateRessourceHumaineDto,
  UpdateRessourceHumaineDto,
} from './dto/create-ressource-humaine.dto';
import { RessourceHumaine } from './entities/ressource-humaine.entity';
import { capitalize, toUpperCase } from '../common/utils/text.util';

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

  private async findPaginated(
    where: Record<string, unknown> | Record<string, unknown>[],
    paginationDto: PaginationDto,
    defaultOrder: Record<string, 'ASC' | 'DESC'> = { ordre: 'ASC', id: 'ASC' },
  ): Promise<PaginatedData<RessourceHumaine>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: sortBy ? { [sortBy]: sortOrder } : defaultOrder,
      skip,
      take: limit,
    });

    return buildPaginatedData(data, total, page, limit);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedData<RessourceHumaine>> {
    return this.findPaginated({ actif: true }, paginationDto);
  }

  async findAllIncludingInactive(
    paginationDto: PaginationDto,
  ): Promise<PaginatedData<RessourceHumaine>> {
    return this.findPaginated({}, paginationDto);
  }

  async search(
    query: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedData<RessourceHumaine>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    if (!query) {
      return this.findAll(paginationDto);
    }

    const [data, total] = await this.repo
      .createQueryBuilder('ressource')
      .where('ressource.actif = :actif', { actif: true })
      .andWhere(
        '(ressource.nom ILIKE :search OR ressource.prenom ILIKE :search OR ressource.poste ILIKE :search)',
        { search: `%${query}%` },
      )
      .orderBy(sortBy ? `ressource.${sortBy}` : 'ressource.ordre', sortOrder)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedData(data, total, page, limit);
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
    const item = this.repo.create({
      ...dto,
      nom: toUpperCase(dto.nom),
      prenom: capitalize(dto.prenom),
      poste: capitalize(dto.poste),
      description: dto.description ? capitalize(dto.description) : dto.description,
      slug: generateSlug(dto.nom, dto.prenom),
      actif: dto.actif ?? true,
      ordre: dto.ordre ?? 0,
      photo: dto.photo || '',
    });
    return this.repo.save(item);
  }

  async update(id: number, dto: UpdateRessourceHumaineDto): Promise<RessourceHumaine> {
    const current = await this.findOne(id);
    const updateData: Partial<RessourceHumaine> = { ...dto };
    if (dto.nom) {
      updateData.nom = toUpperCase(dto.nom);
    }
    if (dto.prenom) {
      updateData.prenom = capitalize(dto.prenom);
    }
    if (dto.poste) {
      updateData.poste = capitalize(dto.poste);
    }
    if (dto.description) {
      updateData.description = capitalize(dto.description);
    }
    if (dto.nom || dto.prenom) {
      updateData.slug = generateSlug(
        toUpperCase(dto.nom || current.nom),
        capitalize(dto.prenom || current.prenom),
      );
    }
    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
