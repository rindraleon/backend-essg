import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Utilisateur } from './entities/user.entity';
import { CreateUtilisateurDto } from './dto/create-user.dto';
import { UpdateUtilisateurDto } from './dto/update-user.dto';
import {
  PaginationDto,
  PaginationResponse,
} from '../common/dto/pagination.dto';

type SanitizedUtilisateur = Omit<Utilisateur, 'motDePasse'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Utilisateur)
    private readonly repo: Repository<Utilisateur>,
  ) {}

  private sanitizeUser = (user: Utilisateur): SanitizedUtilisateur => {
    const { motDePasse, ...rest } = user;
    void motDePasse;
    return rest as SanitizedUtilisateur;
  };

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<SanitizedUtilisateur>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.repo.findAndCount({
      order: sortBy ? { [sortBy]: sortOrder } : { id: 'ASC' },
      skip,
      take: limit,
    });

    const sanitizedUsers = users.map(this.sanitizeUser);
    return new PaginationResponse(sanitizedUsers, total, page, limit);
  }

  async search(
    query: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<SanitizedUtilisateur>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const whereCondition: FindOptionsWhere<Utilisateur> = {};

    if (query) {
      whereCondition.nom = query as FindOptionsWhere<Utilisateur>['nom'];
      whereCondition.prenom = query as FindOptionsWhere<Utilisateur>['prenom'];
      whereCondition.email = query as FindOptionsWhere<Utilisateur>['email'];
    }

    const [users, total] = await this.repo.findAndCount({
      where: whereCondition,
      order: sortBy ? { [sortBy]: sortOrder } : { id: 'ASC' },
      skip,
      take: limit,
    });

    const sanitizedUsers = users.map(this.sanitizeUser);
    return new PaginationResponse(sanitizedUsers, total, page, limit);
  }

  async findOne(id: number): Promise<SanitizedUtilisateur> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return this.sanitizeUser(user);
  }

  async findByEmail(email: string): Promise<Utilisateur | null> {
    return this.repo.findOne({ where: { email } });
  }

  async create(dto: CreateUtilisateurDto): Promise<SanitizedUtilisateur> {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('Cet email existe déjà');

    const hashedPassword = await bcrypt.hash(dto.motDePasse, 10);
    const user = this.repo.create({ ...dto, motDePasse: hashedPassword });
    const saved = await this.repo.save(user);
    return this.sanitizeUser(saved);
  }

  async update(
    id: number,
    dto: UpdateUtilisateurDto,
  ): Promise<SanitizedUtilisateur> {
    if (dto.motDePasse) {
      dto.motDePasse = await bcrypt.hash(dto.motDePasse, 10);
    }
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async updateAvatar(id: number, avatarUrl: string): Promise<SanitizedUtilisateur> {
    await this.repo.update(id, { avatar: avatarUrl });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}