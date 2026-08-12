import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedData } from '../common/interfaces/api-response.interface';
import { buildPaginatedData } from '../common/utils/pagination.util';
import { CreatePartenaireDto, UpdatePartenaireDto } from './dto/create-partner.dto';
import { Partenaire } from './entities/partner.entity';
import { capitalize, toUpperCase } from '../common/utils/text.util';

const generateSlug = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partenaire)
    private readonly repo: Repository<Partenaire>,
  ) {}

  private async findPaginated(
    where: FindOptionsWhere<Partenaire> | FindOptionsWhere<Partenaire>[],
    paginationDto: PaginationDto,
  ): Promise<PaginatedData<Partenaire>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: sortBy ? { [sortBy]: sortOrder } : { id: 'ASC' },
      skip,
      take: limit,
    });

    return buildPaginatedData(data, total, page, limit);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedData<Partenaire>> {
    return this.findPaginated({}, paginationDto);
  }

  async search(query: string, paginationDto: PaginationDto): Promise<PaginatedData<Partenaire>> {
    const where: FindOptionsWhere<Partenaire>[] = query
      ? [{ nom: ILike(`%${query}%`) }, { description: ILike(`%${query}%`) }]
      : [{}];
    return this.findPaginated(where, paginationDto);
  }

  async findOne(id: number): Promise<Partenaire> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Partenaire non trouvé');
    return item;
  }

  async findBySlug(slug: string): Promise<Partenaire> {
    const item = await this.repo.findOne({ where: { slug } });
    if (!item) throw new NotFoundException('Partenaire non trouvé');
    return item;
  }

  async findByName(nom: string): Promise<Partenaire> {
    const item = await this.repo.findOne({ where: { nom } });
    if (!item) throw new NotFoundException('Partenaire non trouvé');
    return item;
  }

  async create(dto: CreatePartenaireDto): Promise<Partenaire> {
    const slug = dto.slug || generateSlug(dto.nom);
    const item = this.repo.create({
      ...dto,
      nom: toUpperCase(dto.nom),
      secteur: capitalize(dto.secteur),
      description: capitalize(dto.description),
      slug,
      dateDebut: new Date(dto.dateDebut),
    });
    return this.repo.save(item);
  }

  async update(id: number, dto: UpdatePartenaireDto): Promise<Partenaire> {
    await this.findOne(id);
    const slug = dto.slug || generateSlug(dto.nom);
    await this.repo.update(id, {
      ...dto,
      nom: toUpperCase(dto.nom),
      secteur: capitalize(dto.secteur),
      description: capitalize(dto.description),
      slug,
      dateDebut: new Date(dto.dateDebut),
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
