import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';
import { SessionStatus } from '../enums/session-status.enum';

@Entity('user_sessions')
export class UserSession {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id: string;

  @Index()
  @Column({ type: 'int' })
  userId: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  sessionTokenHash: string;

  @Column({ type: 'varchar', length: 20, default: SessionStatus.ACTIVE })
  status: SessionStatus;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  /** Dernière activité authentifiée (chaque session a SON propre compteur). */
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastActivityAt: Date;

  /** Expiration absolue. Prolongée (glissement) à chaque activité, plafonnée par `createdAt + MAX_TTL`. */
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  /** Dernière validation observée (maintenu en phase avec `lastActivityAt`). */
  @Column({ type: 'timestamptz', nullable: true })
  lastSeenAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  /** Identifiant de l'administrateur ayant révoqué (null si auto/logout). */
  @Column({ type: 'int', nullable: true })
  revokedBy: number | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  deviceName: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  browserName: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  osName: string | null;
}
