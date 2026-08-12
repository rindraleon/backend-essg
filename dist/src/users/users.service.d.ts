import { Repository } from 'typeorm';
import { PaginatedData } from '../common/interfaces/api-response.interface';
import { MailService } from '../mail/mail.service';
import { CreateUtilisateurDto } from './dto/create-user.dto';
import { UpdateUtilisateurDto } from './dto/update-user.dto';
import { Utilisateur } from './entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
type SanitizedUtilisateur = Omit<Utilisateur, 'motDePasse'>;
export declare class UsersService {
    private readonly repo;
    private readonly mailService;
    private readonly logger;
    constructor(repo: Repository<Utilisateur>, mailService: MailService);
    private sanitizeUser;
    private findPaginated;
    findAll(paginationDto: PaginationDto): Promise<PaginatedData<SanitizedUtilisateur>>;
    search(query: string, paginationDto: PaginationDto): Promise<PaginatedData<SanitizedUtilisateur>>;
    findOne(id: number): Promise<SanitizedUtilisateur>;
    findByEmail(email: string): Promise<Utilisateur | null>;
    create(dto: CreateUtilisateurDto): Promise<SanitizedUtilisateur>;
    update(id: number, dto: UpdateUtilisateurDto): Promise<SanitizedUtilisateur>;
    updateAvatar(id: number, avatarUrl: string): Promise<SanitizedUtilisateur>;
    remove(id: number): Promise<void>;
}
export {};
