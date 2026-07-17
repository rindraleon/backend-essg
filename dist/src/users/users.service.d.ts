import { Repository } from 'typeorm';
import { Utilisateur } from './entities/user.entity';
import { CreateUtilisateurDto } from './dto/create-user.dto';
import { UpdateUtilisateurDto } from './dto/update-user.dto';
import { PaginationDto, PaginationResponse } from '../common/dto/pagination.dto';
type SanitizedUtilisateur = Omit<Utilisateur, 'motDePasse'>;
export declare class UsersService {
    private readonly repo;
    constructor(repo: Repository<Utilisateur>);
    private sanitizeUser;
    findAll(paginationDto: PaginationDto): Promise<PaginationResponse<SanitizedUtilisateur>>;
    search(query: string, paginationDto: PaginationDto): Promise<PaginationResponse<SanitizedUtilisateur>>;
    findOne(id: number): Promise<SanitizedUtilisateur>;
    findByEmail(email: string): Promise<Utilisateur | null>;
    create(dto: CreateUtilisateurDto): Promise<SanitizedUtilisateur>;
    update(id: number, dto: UpdateUtilisateurDto): Promise<SanitizedUtilisateur>;
    updateAvatar(id: number, avatarUrl: string): Promise<SanitizedUtilisateur>;
    remove(id: number): Promise<void>;
}
export {};
