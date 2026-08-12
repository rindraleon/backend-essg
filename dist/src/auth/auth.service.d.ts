import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Utilisateur } from '../users/entities/user.entity';
export interface AuthPayload {
    accessToken: string;
    email: string;
}
export interface JwtPayload {
    email: string;
    sub: number;
}
export declare class AuthService implements OnModuleInit {
    private readonly jwtService;
    private readonly configService;
    private readonly userRepo;
    private readonly logger;
    constructor(jwtService: JwtService, configService: ConfigService, userRepo: Repository<Utilisateur>);
    onModuleInit(): Promise<void>;
    validateUser(email: string, password: string): Promise<{
        id: number;
        email: string;
        role: string;
    } | null>;
    login(email: string, password: string): Promise<AuthPayload>;
    validateToken(payload: JwtPayload): Promise<boolean>;
    getUserById(id: number): Promise<Utilisateur | null>;
    getUserForAuth(id: number, email: string): Promise<Utilisateur | null>;
}
