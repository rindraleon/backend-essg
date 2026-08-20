import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { StorageService } from '../common/storage/storage.service';
import { CreateUtilisateurDto } from './dto/create-user.dto';
import { UpdateUtilisateurDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
interface AuthUser {
    userId: number;
    role: string;
}
export declare class UsersController {
    private readonly service;
    private readonly storageService;
    constructor(service: UsersService, storageService: StorageService);
    findAll(paginationDto: PaginationQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedData<{
        nom: string;
        prenom: string;
        email: string;
        id: number;
        creeLe: Date;
        misAJourLe: Date;
        role: "admin" | "editeur" | "lecteur";
        estActif: boolean;
        avatar?: string | undefined;
    }>>;
    search(query: string, paginationDto: PaginationQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedData<{
        nom: string;
        prenom: string;
        email: string;
        id: number;
        creeLe: Date;
        misAJourLe: Date;
        role: "admin" | "editeur" | "lecteur";
        estActif: boolean;
        avatar?: string | undefined;
    }>>;
    findOne(id: number, req: {
        user: AuthUser;
    }): Promise<{
        nom: string;
        prenom: string;
        email: string;
        id: number;
        creeLe: Date;
        misAJourLe: Date;
        role: "admin" | "editeur" | "lecteur";
        estActif: boolean;
        avatar?: string | undefined;
    }>;
    create(dto: CreateUtilisateurDto): Promise<{
        nom: string;
        prenom: string;
        email: string;
        id: number;
        creeLe: Date;
        misAJourLe: Date;
        role: "admin" | "editeur" | "lecteur";
        estActif: boolean;
        avatar?: string | undefined;
    }>;
    update(id: number, dto: UpdateUtilisateurDto, req: {
        user: AuthUser;
    }): Promise<{
        nom: string;
        prenom: string;
        email: string;
        id: number;
        creeLe: Date;
        misAJourLe: Date;
        role: "admin" | "editeur" | "lecteur";
        estActif: boolean;
        avatar?: string | undefined;
    }>;
    uploadAvatar(id: number, file: Express.Multer.File, req: {
        user: AuthUser;
    }): Promise<{
        nom: string;
        prenom: string;
        email: string;
        id: number;
        creeLe: Date;
        misAJourLe: Date;
        role: "admin" | "editeur" | "lecteur";
        estActif: boolean;
        avatar?: string | undefined;
    }>;
    remove(id: number): Promise<void>;
}
export {};
