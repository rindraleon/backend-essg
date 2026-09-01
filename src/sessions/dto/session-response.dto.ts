import { SessionStatus, UserPresenceStatus } from '../enums/session-status.enum';

/** Représentation publique d'une session (Spec §3). */
export class SessionResponseDto {
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

/** Présence calculée d'un utilisateur (Spec §12). */
export class UserPresenceResponseDto {
  status: UserPresenceStatus;
  activeSessions: number;
  validSessions: number;
  totalSessions: number;
  lastActivityAt: Date | null;
}

/** Ligne de la liste de présence du back-office (Spec §12). */
export class PresenceUserResponseDto {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  presence: UserPresenceResponseDto;
}
