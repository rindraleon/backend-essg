import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Utilisateur } from '../users/entities/user.entity';
import { SessionsService } from '../sessions/sessions.service';

export interface AuthPayload {
  accessToken: string;
  email: string;
  sessionId: string;
  expiresAt: string;
}

export interface JwtPayload {
  email: string;
  sub: number;
  sid: string;
  stk: string;
}

/** Contexte HTTP utilisé pour créer la session (appareil/adresse IP). */
export interface LoginContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionsService: SessionsService,
    @InjectRepository(Utilisateur)
    private readonly userRepo: Repository<Utilisateur>,
  ) {}

  async onModuleInit() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@essg.sn');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD', 'Admin@2026');

    const existingAdmin = await this.userRepo.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

      const admin = this.userRepo.create({
        email: adminEmail,
        motDePasse: passwordHash,
        prenom: 'Admin',
        nom: 'System',
        role: 'admin',
        estActif: true,
      });

      await this.userRepo.save(admin);
      this.logger.log(`Compte administrateur par défaut créé: ${adminEmail}`);
    } else {
      this.logger.log(`Compte administrateur déjà existant: ${adminEmail}`);
    }
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<{ id: number; email: string; role: string } | null> {
    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) return null;
    if (!user.estActif) return null;

    const isMatch = await bcrypt.compare(password, user.motDePasse);
    if (!isMatch) return null;

    return { id: user.id, email: user.email, role: user.role };
  }

  /**
   * Connexion (Spec §3) : chaque connexion crée UNE session serveur unique.
   * Plusieurs utilisateurs et plusieurs sessions par utilisateur peuvent
   * coexister : les sessions sont totalement indépendantes.
   */
  async login(email: string, password: string, context: LoginContext = {}): Promise<AuthPayload> {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const { session, sessionToken } = await this.sessionsService.create(user.id, context, email);

    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      sid: session.id,
      stk: sessionToken,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      email: user.email,
      sessionId: session.id,
      expiresAt: session.expiresAt.toISOString(),
    };
  }

  async validateToken(payload: JwtPayload): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: payload.sub, email: payload.email },
    });
    return Boolean(user && user.estActif);
  }

  async getUserById(id: number) {
    return this.userRepo.findOne({
      where: { id },
      select: ['id', 'email', 'role'],
    });
  }

  async getUserForAuth(id: number, email: string) {
    return this.userRepo.findOne({
      where: { id, email },
      select: ['id', 'email', 'role', 'prenom', 'nom', 'avatar', 'estActif'],
    });
  }
}
