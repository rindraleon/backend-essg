import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Actualite } from './entities/news-item.entity';
import { CreateActualiteDto, UpdateActualiteDto } from './dto/create-news.dto';
import {
  PaginationDto,
  PaginationResponse,
} from '../common/dto/pagination.dto';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(Actualite)
    private readonly repo: Repository<Actualite>,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Actualite>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      order: sortBy ? { [sortBy]: sortOrder } : { date: 'DESC' },
      skip,
      take: limit,
    });

    return new PaginationResponse(data, total, page, limit);
  }

  async search(
    query: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Actualite>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const whereCondition: FindOptionsWhere<Actualite> = {};

    if (query) {
      whereCondition.titre = query as FindOptionsWhere<Actualite>['titre'];
      whereCondition.contenu = query as FindOptionsWhere<Actualite>['contenu'];
    }

    const [data, total] = await this.repo.findAndCount({
      where: whereCondition,
      order: sortBy ? { [sortBy]: sortOrder } : { date: 'DESC' },
      skip,
      take: limit,
    });

    return new PaginationResponse(data, total, page, limit);
  }

  async findOne(id: number): Promise<Actualite> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Actualité non trouvée');
    return item;
  }

  async findBySlug(slug: string): Promise<Actualite> {
    const item = await this.repo.findOne({ where: { slug } });
    if (!item) throw new NotFoundException('Actualité non trouvée');
    return item;
  }

  async create(dto: CreateActualiteDto): Promise<Actualite> {
    const slug = generateSlug(dto.titre);
    const item = this.repo.create({
      ...dto,
      slug,
      resume: dto.resume || '',
      enVedette: dto.enVedette ?? false,
      statut: dto.statut ?? false,
      image: dto.image || '/images/hero-campus.jpg',
    });
    return this.repo.save(item);
  }

  async update(id: number, dto: UpdateActualiteDto): Promise<Actualite> {
    const updateData: any = { ...dto };
    
    // Si le titre est modifié, régénérer le slug
    if (dto.titre) {
      updateData.slug = generateSlug(dto.titre);
    }
    
    // Fournir des valeurs par défaut pour les champs optionnels
    if (dto.resume !== undefined) {
      updateData.resume = dto.resume || '';
    }
    if (dto.enVedette !== undefined) {
      updateData.enVedette = dto.enVedette;
    }
    if (dto.statut !== undefined) {
      updateData.statut = dto.statut;
    }
    if (dto.image !== undefined) {
      updateData.image = dto.image || '';
    }
    
    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
