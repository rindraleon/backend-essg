import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { Utilisateur } from './entities/user.entity';
import { CreateUtilisateurDto } from './dto/create-user.dto';
import { UpdateUtilisateurDto } from './dto/update-user.dto';
import { PaginationDto, PaginationResponse } from '../common/dto/pagination.dto';
type SanitizedUtilisateur = Omit<Utilisateur, 'motDePasse'>;
export declare class UsersService {
    private readonly repo;
    private readonly mailService;
    private readonly logger;
    constructor(repo: Repository<Utilisateur>, mailService: MailService);
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
