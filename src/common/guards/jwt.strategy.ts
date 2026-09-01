import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from '../../auth/auth.service';
import { SessionsService, hashSessionToken } from '../../sessions/sessions.service';

export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
  prenom: string;
  nom: string;
  avatar?: string;
  /** Session serveur qui porte la requête (Spec §3/§8). */
  sessionId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionsService: SessionsService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'essg-default-secret-key-change-in-production',
      ),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const isValid = await this.authService.validateToken(payload);
    if (!isValid) throw new UnauthorizedException('Utilisateur introuvable ou inactif');

    if (!payload.sid || !payload.stk) {
      // Anciens jetons sans session : re-connexion requise (Spec §19).
      throw new UnauthorizedException(
        'Session invalide (jeton sans session). Veuillez vous reconnecter.',
      );
    }

    // Validation serveur de la session : introuvable/révoquée/expirée → 401.
    await this.sessionsService.validateForRequest(
      payload.sid,
      payload.sub,
      hashSessionToken(payload.stk),
    );

    const user = await this.authService.getUserForAuth(payload.sub, payload.email);
    if (!user) throw new UnauthorizedException('Utilisateur introuvable ou inactif');

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      prenom: user.prenom,
      nom: user.nom,
      avatar: user.avatar || undefined,
      sessionId: payload.sid,
    };
  }
}
