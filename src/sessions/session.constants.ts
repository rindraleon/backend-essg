export const SESSION_DEFAULTS = {
  ACTIVE_WINDOW_MINUTES: 15,

  IDLE_EXPIRATION_MINUTES: 30,

  MAX_TTL_DAYS: 7,

  ACTIVITY_WRITE_THROTTLE_SECONDS: 60,

  SWEEP_INTERVAL_MS: 60_000,

  RETENTION_DAYS: 90,
} as const;

/** Nom du module pour les journaux d'audit (table `activity_logs`). */
export const SESSION_AUDIT_MODULE = 'sessions';

/** Actions d'audit des sessions (Spec §20). */
export const SESSION_AUDIT_ACTIONS = {
  CREATED: 'SESSION_CREATED',
  ACTIVITY: 'SESSION_ACTIVITY',
  EXPIRED: 'SESSION_EXPIRED',
  REVOKED: 'SESSION_REVOKED',
  LOGOUT: 'SESSION_LOGOUT',
  ALL_REVOKED: 'ALL_SESSIONS_REVOKED',
} as const;

export type SessionAuditAction = (typeof SESSION_AUDIT_ACTIONS)[keyof typeof SESSION_AUDIT_ACTIONS];

/** Événements du bus interne (consommés par le gateway WebSocket). */
export const SESSION_EVENTS = {
  CREATED: 'session.created',
  TOUCHED: 'session.touched',
  EXPIRED: 'session.expired',
  REVOKED: 'session.revoked',
  LOGOUT: 'session.logout',
  ALL_REVOKED: 'sessions.revokedAll',
} as const;

export type SessionEventName = (typeof SESSION_EVENTS)[keyof typeof SESSION_EVENTS];

/** Événements WebSocket émis vers le back-office. */
export const WS_EVENTS = {
  PRESENCE_CHANGED: 'presence:changed',
  SESSION_CHANGED: 'session:changed',
  SESSION_REVOKED: 'session:revoked',
  SETTINGS_UPDATED: 'settings.updated',
  AUTH_ERROR: 'auth:error',
} as const;

/** Salon WebSocket des administrateurs (présence temps réel). */
export const WS_ROOM_ADMIN = 'admin:presence';

/** Préfixe des salons WebSocket par utilisateur. */
export const WS_ROOM_USER_PREFIX = 'user:';
