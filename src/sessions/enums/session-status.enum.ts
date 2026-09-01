export enum SessionStatus {
  /** Activité récente (dernière activité < fenêtre ACTIVE). */
  ACTIVE = 'active',
  /** Encore valide mais sans activité récente (🟡). */
  INACTIVE = 'inactive',
  /** `expiresAt` dépassé ou inactivité au-delà du délai maximal. */
  EXPIRED = 'expired',
  /** Révoquée par l'utilisateur ou un administrateur. */
  REVOKED = 'revoked',
}

export enum UserPresenceStatus {
  /** Au moins une session ACTIVE. */
  ONLINE = 'online',
  /** Aucune session active, mais au moins une session encore valide. */
  INACTIVE = 'inactive',
  /** Aucune session valide (aucune session, toutes expirées/révoquées). */
  OFFLINE = 'offline',
}
