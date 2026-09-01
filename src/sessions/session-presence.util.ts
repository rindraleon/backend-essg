import { SessionStatus, UserPresenceStatus } from './enums/session-status.enum';

/** Vue minimale d'une session nécessaire au calcul du statut. */
export interface SessionTimestamps {
  revokedAt: Date | null;
  expiresAt: Date;
  lastActivityAt: Date;
  createdAt?: Date;
}

export interface SessionTimingConfig {
  /** Fenêtre « activité récente » (ms). Par défaut 15 minutes. */
  activeWindowMs: number;
  /** Inactivité maximale avant expiration (ms). Par défaut 30 minutes. */
  idleExpirationMs: number;
}

export interface SessionStatusResult {
  status: SessionStatus;
  /** Vrai si la session peut encore authentifier des requêtes. */
  valid: boolean;
}

export function computeSessionStatus(
  session: SessionTimestamps,
  now: Date,
  config: SessionTimingConfig,
): SessionStatusResult {
  const nowMs = now.getTime();

  if (session.revokedAt) {
    return { status: SessionStatus.REVOKED, valid: false };
  }

  const expiresMs = session.expiresAt.getTime();
  if (Number.isFinite(expiresMs) && expiresMs <= nowMs) {
    return { status: SessionStatus.EXPIRED, valid: false };
  }

  const idleMs = nowMs - session.lastActivityAt.getTime();
  if (idleMs >= config.idleExpirationMs) {
    // Délai d'inactivité maximal atteint : déconnexion automatique (Spec §7/§9).
    return { status: SessionStatus.EXPIRED, valid: false };
  }

  if (idleMs < config.activeWindowMs) {
    return { status: SessionStatus.ACTIVE, valid: true };
  }

  return { status: SessionStatus.INACTIVE, valid: true };
}

/** Résultat agrégé de présence d'un utilisateur (Spec §5/§12). */
export interface UserPresenceResult {
  status: UserPresenceStatus;
  activeSessions: number;
  /** Sessions encore valides (ni expirées, ni révoquées). */
  validSessions: number;
  /** Toutes les sessions connues (y compris expirées/révoquées). */
  totalSessions: number;
  lastActivityAt: Date | null;
}

export function computeUserPresence(
  sessions: SessionTimestamps[],
  now: Date,
  config: SessionTimingConfig,
): UserPresenceResult {
  const result: UserPresenceResult = {
    status: UserPresenceStatus.OFFLINE,
    activeSessions: 0,
    validSessions: 0,
    totalSessions: sessions.length,
    lastActivityAt: null,
  };

  for (const session of sessions) {
    const last = session.lastActivityAt.getTime();
    if (!result.lastActivityAt || last > result.lastActivityAt.getTime()) {
      result.lastActivityAt = session.lastActivityAt;
    }

    const { status, valid } = computeSessionStatus(session, now, config);
    if (status === SessionStatus.ACTIVE) result.activeSessions += 1;
    if (valid) result.validSessions += 1;
  }

  if (result.activeSessions > 0) {
    result.status = UserPresenceStatus.ONLINE;
  } else if (result.validSessions > 0) {
    result.status = UserPresenceStatus.INACTIVE;
  }

  return result;
}

export function presenceFromCounts(input: {
  total: number;
  active: number;
  valid: number;
  lastActivityAt: Date | null;
}): UserPresenceResult {
  let status = UserPresenceStatus.OFFLINE;
  if (input.active > 0) status = UserPresenceStatus.ONLINE;
  else if (input.valid > 0) status = UserPresenceStatus.INACTIVE;

  return {
    status,
    activeSessions: input.active,
    validSessions: input.valid,
    totalSessions: input.total,
    lastActivityAt: input.lastActivityAt,
  };
}

/** Nouvelle expiration glissante : `min(now + idle, createdAt + maxTtl)`. */
export function computeNextExpiresAt(
  now: Date,
  createdAt: Date,
  idleExpirationMs: number,
  maxTtlMs: number,
): Date {
  const sliding = now.getTime() + idleExpirationMs;
  const hardCap = createdAt.getTime() + maxTtlMs;
  return new Date(Math.min(sliding, hardCap));
}

/** Vrai si la session doit être marquée expirée par le sweeper. */
export function isIdleExpired(
  session: SessionTimestamps,
  now: Date,
  idleExpirationMs: number,
): boolean {
  if (session.revokedAt) return false;
  if (session.expiresAt.getTime() <= now.getTime()) return true;
  return now.getTime() - session.lastActivityAt.getTime() >= idleExpirationMs;
}
