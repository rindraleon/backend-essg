import { UsersService } from './users.service';
import { CreateUtilisateurDto } from './dto/create-user.dto';
import { UpdateUtilisateurDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
export declare class UsersController {
    private readonly service;
    constructor(service: UsersService);
    findAll(paginationDto: PaginationQueryDto): Promise<import("../common/dto/pagination.dto").PaginationResponse<{
        id: number;
        creeLe: Date;
        misAJourLe: Date;
        email: string;
        prenom: string;
        nom: string;
        role: "admin" | "editeur" | "lecteur";
        estActif: boolean;
        avatar?: string | undefined;
    }>>;
    search(query: string, paginationDto: PaginationQueryDto): Promise<import("../common/dto/pagination.dto").PaginationResponse<{
        id: number;
        creeLe: Date;
        misAJourLe: Date;
        email: string;
        prenom: string;
        nom: string;
        role: "admin" | "editeur" | "lecteur";
        estActif: boolean;
        avatar?: string | undefined;
    }>>;
    findOne(id: number): Promise<{
        id: number;
        creeLe: Date;
        misAJourLe: Date;
        email: string;
        prenom: string;
        nom: string;
        role: "admin" | "editeur" | "lecteur";
        estActif: boolean;
        avatar?: string | undefined;
    }>;
    create(dto: CreateUtilisateurDto): Promise<{
        id: number;
        creeLe: Date;
        misAJourLe: Date;
        email: string;
        prenom: string;
        nom: string;
        role: "admin" | "editeur" | "lecteur";
        estActif: boolean;
        avatar?: string | undefined;
    }>;
    update(id: number, dto: UpdateUtilisateurDto, req: {
        user: {
            userId: number;
            role: string;
        };
    }): Promise<{
        id: number;
        creeLe: Date;
        misAJourLe: Date;
        email: string;
        prenom: string;
        nom: string;
        role: "admin" | "editeur" | "lecteur";
        estActif: boolean;
        avatar?: string | undefined;
    }>;
    uploadAvatar(id: number, file: Express.Multer.File, req: {
        user: {
            userId: number;
            role: string;
        };
    }): Promise<{
        id: number;
        creeLe: Date;
        misAJourLe: Date;
        email: string;
        prenom: string;
        nom: string;
        role: "admin" | "editeur" | "lecteur";
        estActif: boolean;
        avatar?: string | undefined;
    }>;
    remove(id: number): Promise<void>;
}
