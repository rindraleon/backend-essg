import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedData } from '../common/interfaces/api-response.interface';
import { buildPaginatedData } from '../common/utils/pagination.util';
import { CreateProjetDto, UpdateProjetDto } from './dto/create-project.dto';
import { Projet } from './entities/project.entity';
import { capitalize, capitalizeArray, slugify } from '../common/utils/text.util';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Projet)
    private readonly repo: Repository<Projet>,
  ) {}

  private async findPaginated(
    where: FindOptionsWhere<Projet> | FindOptionsWhere<Projet>[],
    paginationDto: PaginationDto,
  ): Promise<PaginatedData<Projet>> {
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

  async findAll(paginationDto: PaginationDto): Promise<PaginatedData<Projet>> {
    return this.findPaginated({}, paginationDto);
  }

  async search(query: string, paginationDto: PaginationDto): Promise<PaginatedData<Projet>> {
    const where: FindOptionsWhere<Projet>[] = query
      ? [{ titre: ILike(`%${query}%`) }, { description: ILike(`%${query}%`) }]
      : [{}];
    return this.findPaginated(where, paginationDto);
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
    const item = this.repo.create({
      ...dto,
      slug: dto.slug?.trim() ? slugify(dto.slug) : slugify(dto.titre),
      titre: capitalize(dto.titre),
      description: capitalize(dto.description),
      ville: dto.ville ? capitalize(dto.ville) : dto.ville,
      pays: dto.pays ? capitalize(dto.pays) : dto.pays,
      adresse: dto.adresse ? capitalize(dto.adresse) : dto.adresse,
      partenaires: capitalizeArray(dto.partenaires),
      galerie: dto.galerie ?? [],
    });
    return this.repo.save(item);
  }

  async update(id: number, dto: UpdateProjetDto): Promise<Projet> {
    await this.findOne(id);
    const updateData: Partial<Projet> = { ...dto };
    if (dto.titre) updateData.titre = capitalize(dto.titre);
    if (dto.description) updateData.description = capitalize(dto.description);
    if (dto.ville) updateData.ville = capitalize(dto.ville);
    if (dto.pays) updateData.pays = capitalize(dto.pays);
    if (dto.adresse) updateData.adresse = capitalize(dto.adresse);
    if (dto.partenaires) updateData.partenaires = capitalizeArray(dto.partenaires);
    if (dto.galerie) updateData.galerie = dto.galerie;
    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
