import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedData } from '../common/interfaces/api-response.interface';
import { buildPaginatedData } from '../common/utils/pagination.util';
import { CreateFormationDto, UpdateFormationDto } from './dto/create-formation.dto';
import { Formation } from './entities/formation.entity';
import { capitalize, capitalizeArray } from '../common/utils/text.util';

@Injectable()
export class FormationsService {
  constructor(
    @InjectRepository(Formation)
    private readonly repo: Repository<Formation>,
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginatedData<Formation>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      order: sortBy ? { [sortBy]: sortOrder } : { id: 'ASC' },
      skip,
      take: limit,
    });

    return buildPaginatedData(data, total, page, limit);
  }

  async search(query: string, paginationDto: PaginationDto): Promise<PaginatedData<Formation>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    if (!query) {
      return this.findAll(paginationDto);
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

    return buildPaginatedData(data, total, page, limit);
  }

  async findOne(id: number): Promise<Formation> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Formation non trouvée');
    return item;
  }

  async findBySlug(slug: string): Promise<Formation> {
    const item = await this.repo.findOne({ where: { slug } });
    if (!item) throw new NotFoundException('Formation non trouvée');
    return item;
  }

  async create(dto: CreateFormationDto): Promise<Formation> {
    const item = this.repo.create({
      ...dto,
      titre: capitalize(dto.titre),
      duree: capitalize(dto.duree),
      description: capitalize(dto.description),
      responsable: dto.responsable ? capitalize(dto.responsable) : dto.responsable,
      domaine: capitalizeArray(dto.domaine),
      objectifs: capitalizeArray(dto.objectifs),
      debouches: capitalizeArray(dto.debouches),
      conditions: capitalizeArray(dto.conditions ?? []),
      competences: capitalizeArray(dto.competences ?? []),
      programme: capitalizeArray(dto.programme),
    });
    return this.repo.save(item);
  }

  async update(id: number, dto: UpdateFormationDto): Promise<Formation> {
    await this.findOne(id);
    const updateData: Partial<Formation> = { ...dto };
    if (dto.titre) updateData.titre = capitalize(dto.titre);
    if (dto.duree) updateData.duree = capitalize(dto.duree);
    if (dto.description) updateData.description = capitalize(dto.description);
    if (dto.responsable) updateData.responsable = capitalize(dto.responsable);
    if (dto.domaine) updateData.domaine = capitalizeArray(dto.domaine);
    if (dto.objectifs) updateData.objectifs = capitalizeArray(dto.objectifs);
    if (dto.debouches) updateData.debouches = capitalizeArray(dto.debouches);
    if (dto.conditions) updateData.conditions = capitalizeArray(dto.conditions);
    if (dto.competences) updateData.competences = capitalizeArray(dto.competences);
    if (dto.programme) updateData.programme = capitalizeArray(dto.programme);
    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
