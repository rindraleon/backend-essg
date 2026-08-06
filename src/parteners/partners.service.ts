import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Partenaire } from './entities/partner.entity';
import { CreatePartenaireDto, UpdatePartenaireDto } from './dto/create-partner.dto';
import { PaginationDto, PaginationResponse } from '../common/dto/pagination.dto';

// Fonction pour générer un slug à partir d'une chaîne
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]/g, '-') // Remplacer chaque caractère non alphanumérique par un tiret
    .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul tiret
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et fin
};

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

  async findById(id: number): Promise<Partenaire> {
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

  async findOne(id: number): Promise<Partenaire> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Partenaire non trouvé');
    return item;
  }

  async create(dto: CreatePartenaireDto): Promise<Partenaire> {
    // Générer le slug à partir du nom si non fourni
    const slug = dto.slug || generateSlug(dto.nom);
    
    const item = this.repo.create({
      ...dto,
      slug,
      dateDebut: new Date(dto.dateDebut),
    });
    return this.repo.save(item);
  }

  async update(id: number, dto: UpdatePartenaireDto): Promise<Partenaire> {
    // Générer le slug à partir du nom si non fourni
    const slug = dto.slug || generateSlug(dto.nom);
    
    await this.repo.update(id, {
      ...dto,
      slug,
      dateDebut: new Date(dto.dateDebut),
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
