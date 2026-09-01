import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { UserSession } from './entities/session.entity';
import { SessionStatus } from './enums/session-status.enum';

export interface SessionAggregateCounts {
  userId: number;
  total: number;
  active: number;
  valid: number;
  lastActivityAt: Date | null;
}

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectRepository(UserSession)
    private readonly repo: Repository<UserSession>,
  ) {}

  save(session: UserSession): Promise<UserSession> {
    return this.repo.save(session);
  }

  findById(id: string): Promise<UserSession | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByIdAndUser(id: string, userId: number): Promise<UserSession | null> {
    return this.repo.findOne({ where: { id, userId } });
  }

  findByTokenHash(sessionTokenHash: string): Promise<UserSession | null> {
    return this.repo.findOne({ where: { sessionTokenHash } });
  }

  findForUser(userId: number): Promise<UserSession[]> {
    return this.repo.find({
      where: { userId },
      order: { lastActivityAt: 'DESC' },
    });
  }

  async aggregatePresenceForUsers(
    userIds: number[],
    now: Date,
    activeWindowMs: number,
    idleExpirationMs: number,
  ): Promise<Map<number, SessionAggregateCounts>> {
    const result = new Map<number, SessionAggregateCounts>();
    if (userIds.length === 0) return result;

    const activeSince = new Date(now.getTime() - activeWindowMs);
    const validSince = new Date(now.getTime() - idleExpirationMs);

    const rows = await this.repo
      .createQueryBuilder('s')
      .select('s.userId', 'userId')
      .addSelect('COUNT(*)::int', 'total')
      .addSelect(
        `COUNT(*) FILTER (WHERE s."revokedAt" IS NULL AND s."expiresAt" > :now AND s."lastActivityAt" >= :activeSince)::int`,
        'active',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE s."revokedAt" IS NULL AND s."expiresAt" > :now AND s."lastActivityAt" >= :validSince)::int`,
        'valid',
      )
      .addSelect('MAX(s."lastActivityAt")', 'lastActivityAt')
      .where('s.userId IN (:...userIds)', { userIds })
      .setParameters({ now, activeSince, validSince })
      .groupBy('s.userId')
      .getRawMany<{
        userId: number;
        total: string | number;
        active: string | number;
        valid: string | number;
        lastActivityAt: Date | null;
      }>();

    for (const row of rows) {
      result.set(Number(row.userId), {
        userId: Number(row.userId),
        total: Number(row.total),
        active: Number(row.active),
        valid: Number(row.valid),
        lastActivityAt: row.lastActivityAt,
      });
    }
    return result;
  }

  async aggregatePresenceForUser(
    userId: number,
    now: Date,
    activeWindowMs: number,
    idleExpirationMs: number,
  ): Promise<SessionAggregateCounts | null> {
    const map = await this.aggregatePresenceForUsers(
      [userId],
      now,
      activeWindowMs,
      idleExpirationMs,
    );
    return map.get(userId) ?? null;
  }

  async revokeAllForUser(userId: number, revokedBy: number | null): Promise<UserSession[]> {
    const sessions = await this.repo.find({
      where: { userId, revokedAt: IsNull() },
    });
    if (sessions.length === 0) return [];

    const now = new Date();
    for (const session of sessions) {
      session.revokedAt = now;
      session.revokedBy = revokedBy;
      session.status = SessionStatus.REVOKED;
    }
    return this.repo.save(sessions);
  }

  async markExpired(now: Date, idleExpirationMs: number): Promise<UserSession[]> {
    const validSince = new Date(now.getTime() - idleExpirationMs);
    const candidates = await this.repo
      .createQueryBuilder('s')
      .where('s."revokedAt" IS NULL')
      .andWhere('s.status != :expired', { expired: SessionStatus.EXPIRED })
      .andWhere('(s."expiresAt" <= :now OR s."lastActivityAt" < :validSince)', { now, validSince })
      .getMany();

    if (candidates.length === 0) return [];

    for (const session of candidates) {
      session.status = SessionStatus.EXPIRED;
      session.expiresAt = now;
    }
    return this.repo.save(candidates);
  }

  /** Purge des sessions révoquées/expirées plus anciennes que la rétention. */
  async purgeOld(horizon: Date): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .where('"revokedAt" IS NOT NULL AND "revokedAt" < :horizon', { horizon })
      .orWhere('"expiresAt" < :horizon', { horizon })
      .execute();
    return result.affected ?? 0;
  }

  async touchActivity(sessionId: string, now: Date, nextExpiresAt: Date): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .update(UserSession)
      .set({
        lastActivityAt: now,
        lastSeenAt: now,
        expiresAt: nextExpiresAt,
        status: SessionStatus.ACTIVE,
      })
      .where('id = :sessionId', { sessionId })
      .andWhere('"revokedAt" IS NULL')
      .andWhere('"expiresAt" > :now', { now })
      .execute();
    return result.affected ?? 0;
  }
}
