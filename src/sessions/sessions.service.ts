import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { SESSION_DEFAULTS, SESSION_EVENTS } from './session.constants';
import { SessionAuditService } from './session-audit.service';
import { SessionEventBus } from './session-event-bus.service';
import { SessionsRepository } from './sessions.repository';
import { UserSession } from './entities/session.entity';
import { SessionStatus, UserPresenceStatus } from './enums/session-status.enum';
import { parseUserAgent } from './session-device.util';
import {
  computeNextExpiresAt,
  computeSessionStatus,
  computeUserPresence,
  isIdleExpired,
  presenceFromCounts,
  type SessionTimingConfig,
  type UserPresenceResult,
} from './session-presence.util';

/** Contexte de création d'une session (provenance de la requête). */
export interface SessionCreationContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** Représentation publique d'une session (jamais le hash du jeton). */
export interface SessionInfo {
  id: string;
  userId: number;
  status: SessionStatus;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  lastSeenAt: Date | null;
  revokedAt: Date | null;
  revokedBy: number | null;
  ipAddress: string | null;
  deviceName: string | null;
  browserName: string | null;
  osName: string | null;
  isCurrent?: boolean;
}

export interface CreatedSession {
  session: UserSession;
  sessionToken: string;
}

@Injectable()
export class SessionsService implements OnModuleInit {
  private readonly logger = new Logger(SessionsService.name);

  private readonly timing: SessionTimingConfig;
  private readonly maxTtlMs: number;
  private readonly writeThrottleMs: number;
  private readonly sweepIntervalMs: number;
  private readonly retentionMs: number;

  /** Throttle d'écriture en mémoire par session (Spec §8). */
  private readonly lastWrite = new Map<string, number>();

  constructor(
    private readonly repo: SessionsRepository,
    private readonly audit: SessionAuditService,
    private readonly events: SessionEventBus,
    configService: ConfigService,
  ) {
    const activeWindowMinutes = this.readInt(
      configService,
      'SESSION_ACTIVE_WINDOW_MINUTES',
      SESSION_DEFAULTS.ACTIVE_WINDOW_MINUTES,
    );
    const idleExpirationMinutes = this.readInt(
      configService,
      'SESSION_IDLE_EXPIRATION_MINUTES',
      SESSION_DEFAULTS.IDLE_EXPIRATION_MINUTES,
    );
    const maxTtlDays = this.readInt(
      configService,
      'SESSION_MAX_TTL_DAYS',
      SESSION_DEFAULTS.MAX_TTL_DAYS,
    );

    this.timing = {
      activeWindowMs: activeWindowMinutes * 60_000,
      idleExpirationMs: idleExpirationMinutes * 60_000,
    };
    this.maxTtlMs = maxTtlDays * 24 * 60 * 60 * 1000;
    this.writeThrottleMs =
      this.readInt(
        configService,
        'SESSION_ACTIVITY_WRITE_THROTTLE_SECONDS',
        SESSION_DEFAULTS.ACTIVITY_WRITE_THROTTLE_SECONDS,
      ) * 1000;
    this.sweepIntervalMs = this.readInt(
      configService,
      'SESSION_SWEEP_INTERVAL_MS',
      SESSION_DEFAULTS.SWEEP_INTERVAL_MS,
    );
    this.retentionMs =
      this.readInt(configService, 'SESSION_RETENTION_DAYS', SESSION_DEFAULTS.RETENTION_DAYS) *
      24 *
      60 *
      60 *
      1000;
  }

  // ------------------------------------------------------------------ cycle

  onModuleInit(): void {
    // Balayage périodique : matérialise l'expiration des sessions inactives
    // (Spec §7/§9) et purge les anciennes sessions.
    const timer = setInterval(() => {
      void this.sweep().catch((error) => {
        this.logger.warn(`Sweeper de sessions en échec: ${(error as Error).message}`);
      });
    }, this.sweepIntervalMs);
    timer.unref();
    this.logger.log(
      `Système de sessions initialisé (fenêtre active: ${this.timing.activeWindowMs / 60000} min, ` +
        `expiration inactivité: ${this.timing.idleExpirationMs / 60000} min, balayage: ${this.sweepIntervalMs / 1000} s)`,
    );
  }

  /** Balayage : expire les sessions inactives, purge les très anciennes. */
  async sweep(): Promise<{ expired: number; purged: number }> {
    const now = new Date();
    const expired = await this.repo.markExpired(now, this.timing.idleExpirationMs);
    for (const session of expired) {
      const presence = await this.getUserPresence(session.userId, now);
      this.events.emit({
        userId: session.userId,
        sessionId: session.id,
        action: SESSION_EVENTS.EXPIRED,
        sessionStatus: SessionStatus.EXPIRED,
        presence,
        at: now,
      });
      await this.audit.record({
        action: 'SESSION_EXPIRED',
        userId: session.userId,
        userName: null,
        sessionId: session.id,
        metadata: { lastActivityAt: session.lastActivityAt },
      });
    }
    const purged = await this.repo.purgeOld(new Date(now.getTime() - this.retentionMs));
    if (expired.length > 0 || purged > 0) {
      this.logger.log(`Sweeper sessions : ${expired.length} expirée(s), ${purged} purgée(s)`);
    }
    return { expired: expired.length, purged };
  }

  // -------------------------------------------------------------- création

  /**
   * Création d'une session unique par connexion (Spec §3).
   * Le jeton brut (aléatoire, 48 octets) n'est jamais stocké : seul son
   * SHA-256 l'est (Spec §19).
   */
  async create(
    userId: number,
    context: SessionCreationContext = {},
    userName: string | null = null,
  ): Promise<CreatedSession> {
    const sessionToken = randomBytes(48).toString('base64url');
    const now = new Date();
    const device = parseUserAgent(context.userAgent);

    const session = await this.repo.save(
      this.buildSession({
        userId,
        sessionTokenHash: hashSessionToken(sessionToken),
        status: SessionStatus.ACTIVE,
        createdAt: now,
        lastActivityAt: now,
        lastSeenAt: now,
        expiresAt: new Date(now.getTime() + this.timing.idleExpirationMs),
        revokedAt: null,
        revokedBy: null,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        deviceName: device.deviceName,
        browserName: device.browserName,
        osName: device.osName,
      }),
    );

    this.events.emit({
      userId,
      sessionId: session.id,
      action: SESSION_EVENTS.CREATED,
      sessionStatus: SessionStatus.ACTIVE,
      presence: await this.getUserPresence(userId, now),
      at: now,
    });
    await this.audit.record({
      action: 'SESSION_CREATED',
      userId,
      userName,
      sessionId: session.id,
      ipAddress: context.ipAddress ?? null,
      metadata: { device: device.deviceName, browser: device.browserName, os: device.osName },
    });

    return { session, sessionToken };
  }

  // ------------------------------------------------------------- validation

  /**
   * Validation d'une session à partir de son identifiant et du hash du jeton
   * embarqué dans le JWT. Rejette (401) si : session introuvable, hash
   * différent, révoquée, expirée ou inactive au-delà du délai maximal.
   * En cas d'inactivité excessive, matérialise l'expiration en base.
   */
  async validateForRequest(
    sessionId: string,
    userId: number,
    tokenHash: string,
  ): Promise<UserSession> {
    const session = await this.repo.findByIdAndUser(sessionId, userId);
    if (!session) {
      throw new UnauthorizedException('Session introuvable, veuillez vous reconnecter');
    }
    if (session.sessionTokenHash !== tokenHash) {
      throw new UnauthorizedException('Jeton de session invalide');
    }
    if (session.revokedAt) {
      throw new UnauthorizedException(
        'Cette session a été révoquée par un administrateur. Reconnectez-vous.',
      );
    }

    const now = new Date();
    const { status } = computeSessionStatus(session, now, this.timing);
    if (status === SessionStatus.EXPIRED) {
      // Déconnexion automatique (Spec §9) : on matérialise l'expiration.
      session.status = SessionStatus.EXPIRED;
      session.expiresAt = now;
      await this.repo.save(session);
      const presence = await this.getUserPresence(session.userId, now);
      this.events.emit({
        userId: session.userId,
        sessionId: session.id,
        action: SESSION_EVENTS.EXPIRED,
        sessionStatus: SessionStatus.EXPIRED,
        presence,
        at: now,
      });
      throw new UnauthorizedException(
        'Session expirée après inactivité. Veuillez vous reconnecter.',
      );
    }

    return session;
  }

  // -------------------------------------------------------------- activité

  /**
   * Charge la session (pour l'intercepteur d'activité) sans lever
   * d'exception : retourne `null` si absente/révoquée/expirée.
   */
  async findForTouch(sessionId: string, userId: number): Promise<UserSession | null> {
    const session = await this.repo.findByIdAndUser(sessionId, userId);
    if (!session) return null;
    const { valid } = computeSessionStatus(session, new Date(), this.timing);
    return valid ? session : null;
  }

  /**
   * Touche d'activité pour UNE session précise (Spec §8) : la requête
   * authentifiée ne met à jour que la session qui l'a portée, jamais les
   * autres sessions du même utilisateur.
   *
   * L'écriture est throttlée (une écriture max par intervalle et par
   * session) mais `lastActivityAt` est positionné à l'instant présent :
   * la présence reste exacte sans écrire à chaque requête.
   */
  async touch(session: UserSession, now: Date = new Date()): Promise<void> {
    if (session.revokedAt) return;

    const last = this.lastWrite.get(session.id) ?? 0;
    if (now.getTime() - last < this.writeThrottleMs) return;
    this.lastWrite.set(session.id, now.getTime());
    if (this.lastWrite.size > 10_000) {
      // Sécurité mémoire : purge approximative des entrées anciennes.
      for (const [key, value] of this.lastWrite) {
        if (now.getTime() - value > this.writeThrottleMs * 10) this.lastWrite.delete(key);
      }
    }

    try {
      const nextExpiresAt = computeNextExpiresAt(
        now,
        session.createdAt,
        this.timing.idleExpirationMs,
        this.maxTtlMs,
      );
      const affected = await this.repo.touchActivity(session.id, now, nextExpiresAt);
      if (affected === 0) {
        // Session révoquée ou expirée entre-temps : on ne force rien.
        return;
      }

      const wasIdle =
        now.getTime() - session.lastActivityAt.getTime() >= this.timing.activeWindowMs;
      session.lastActivityAt = now;
      session.lastSeenAt = now;
      session.expiresAt = nextExpiresAt;
      session.status = SessionStatus.ACTIVE;

      if (wasIdle) {
        // Transition INACTIVE -> ACTIVE : événement temps réel + audit.
        this.events.emit({
          userId: session.userId,
          sessionId: session.id,
          action: SESSION_EVENTS.TOUCHED,
          sessionStatus: SessionStatus.ACTIVE,
          at: now,
        });
      }
    } catch (error) {
      this.logger.warn(`Touche d'activité impossible: ${(error as Error).message}`);
    }
  }

  // ------------------------------------------------------------ déconnexion

  /**
   * Déconnexion de la session courante uniquement (Spec §9) : les autres
   * sessions du même utilisateur restent fonctionnelles.
   */
  async logout(userId: number, sessionId: string): Promise<void> {
    const session = await this.repo.findByIdAndUser(sessionId, userId);
    if (!session || session.revokedAt) return; // idempotent

    const now = new Date();
    session.revokedAt = now;
    session.revokedBy = null;
    session.status = SessionStatus.REVOKED;
    await this.repo.save(session);

    this.events.emit({
      userId,
      sessionId: session.id,
      action: SESSION_EVENTS.LOGOUT,
      sessionStatus: SessionStatus.REVOKED,
      presence: await this.getUserPresence(userId, now),
      at: now,
    });
    await this.audit.record({
      action: 'SESSION_LOGOUT',
      userId,
      userName: null,
      sessionId: session.id,
      ipAddress: session.ipAddress,
    });
  }

  // ------------------------------------------------------------- révocation

  /**
   * Révocation d'une session précise par un administrateur (Spec §10).
   * Contrôle RBAC : l'appelant est déjà filtré par `RolesGuard('admin')` ;
   * la session ciblée doit appartenir à l'utilisateur indiqué.
   */
  async revoke(
    targetUserId: number,
    sessionId: string,
    actorId: number,
    reason?: string,
  ): Promise<SessionInfo> {
    const session = await this.repo.findByIdAndUser(sessionId, targetUserId);
    if (!session) {
      throw new NotFoundException('Session introuvable pour cet utilisateur');
    }
    if (session.revokedAt) {
      return this.toSessionInfo(session); // déjà révoquée : idempotent
    }

    const now = new Date();
    session.revokedAt = now;
    session.revokedBy = actorId;
    session.status = SessionStatus.REVOKED;
    await this.repo.save(session);

    const presence = await this.getUserPresence(targetUserId, now);
    this.events.emit({
      userId: targetUserId,
      sessionId: session.id,
      actorId,
      action: SESSION_EVENTS.REVOKED,
      sessionStatus: SessionStatus.REVOKED,
      presence,
      reason: reason ?? null,
      at: now,
    });
    await this.audit.record({
      action: 'SESSION_REVOKED',
      userId: targetUserId,
      userName: null,
      sessionId: session.id,
      actorId,
      reason: reason ?? null,
      ipAddress: session.ipAddress,
    });

    return this.toSessionInfo(session);
  }

  async revokeAll(targetUserId: number, actorId: number): Promise<{ revoked: number }> {
    const revoked = await this.repo.revokeAllForUser(targetUserId, actorId);
    const now = new Date();

    this.events.emit({
      userId: targetUserId,
      actorId,
      action: SESSION_EVENTS.ALL_REVOKED,
      presence: await this.getUserPresence(targetUserId, now),
      at: now,
    });
    await this.audit.record({
      action: 'ALL_SESSIONS_REVOKED',
      userId: targetUserId,
      userName: null,
      sessionId: null,
      actorId,
    });

    return { revoked: revoked.length };
  }

  // ------------------------------------------------------------ récupération

  /** Session courante + informations dérivées. */
  async getCurrentInfo(userId: number, sessionId: string): Promise<SessionInfo> {
    const session = await this.repo.findByIdAndUser(sessionId, userId);
    if (!session) throw new NotFoundException('Session introuvable');
    return this.toSessionInfo(session, { isCurrent: true });
  }

  /** Toutes les sessions d'un utilisateur (Spec §10/§16). */
  async listForUser(userId: number, currentSessionId?: string): Promise<SessionInfo[]> {
    const sessions = await this.repo.findForUser(userId);
    return sessions.map((session) =>
      this.toSessionInfo(session, { isCurrent: session.id === currentSessionId }),
    );
  }

  /** Présence globale d'un utilisateur calculée à la volée (Spec §6). */
  async getUserPresence(userId: number, now: Date = new Date()): Promise<UserPresenceResult> {
    const counts = await this.repo.aggregatePresenceForUser(
      userId,
      now,
      this.timing.activeWindowMs,
      this.timing.idleExpirationMs,
    );
    if (!counts) {
      return {
        status: UserPresenceStatus.OFFLINE,
        activeSessions: 0,
        validSessions: 0,
        totalSessions: 0,
        lastActivityAt: null,
      };
    }
    return presenceFromCounts(counts);
  }

  /** Présence par lot (liste du back-office, Spec §12/§13). */
  async getPresenceMap(
    userIds: number[],
    now: Date = new Date(),
  ): Promise<Map<number, UserPresenceResult>> {
    const counts = await this.repo.aggregatePresenceForUsers(
      userIds,
      now,
      this.timing.activeWindowMs,
      this.timing.idleExpirationMs,
    );
    const map = new Map<number, UserPresenceResult>();
    for (const [userId, row] of counts) {
      map.set(userId, presenceFromCounts(row));
    }
    for (const userId of userIds) {
      if (!map.has(userId)) {
        map.set(userId, {
          status: UserPresenceStatus.OFFLINE,
          activeSessions: 0,
          validSessions: 0,
          totalSessions: 0,
          lastActivityAt: null,
        });
      }
    }
    return map;
  }

  // ---------------------------------------------------------------- helpers

  /** Statut effectif d'une session (recalculé, jamais figé). */
  effectiveStatus(session: UserSession, now: Date = new Date()): SessionStatus {
    return computeSessionStatus(session, now, this.timing).status;
  }

  toSessionInfo(session: UserSession, options: { isCurrent?: boolean } = {}): SessionInfo {
    return {
      id: session.id,
      userId: session.userId,
      status: this.effectiveStatus(session),
      createdAt: session.createdAt,
      lastActivityAt: session.lastActivityAt,
      expiresAt: session.expiresAt,
      lastSeenAt: session.lastSeenAt,
      revokedAt: session.revokedAt,
      revokedBy: session.revokedBy,
      ipAddress: session.ipAddress,
      deviceName: session.deviceName,
      browserName: session.browserName,
      osName: session.osName,
      isCurrent: options.isCurrent,
    };
  }

  getTiming(): SessionTimingConfig {
    return { ...this.timing };
  }

  private buildSession(fields: Partial<UserSession>): UserSession {
    const session = new UserSession();
    Object.assign(session, fields);
    return session;
  }

  private readInt(config: ConfigService, key: string, fallback: number): number {
    const raw = config.get<string>(key);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}

/** SHA-256 hexadécimal du jeton de session (Spec §19). */
export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Re-export utilitaire pour les autres modules. */
export { computeUserPresence, isIdleExpired };
