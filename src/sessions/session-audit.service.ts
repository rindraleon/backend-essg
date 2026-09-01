import { Injectable, Logger } from '@nestjs/common';
import { ActivityLogService } from '../activity-logs/activity-log.service';
import {
  SESSION_AUDIT_ACTIONS,
  SESSION_AUDIT_MODULE,
  type SessionAuditAction,
} from './session.constants';

export interface SessionAuditEntry {
  action: SessionAuditAction;
  userId: number;
  userName: string | null;
  sessionId: string | null;
  actorId?: number | null;
  reason?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class SessionAuditService {
  private readonly logger = new Logger(SessionAuditService.name);

  constructor(private readonly activityLogService: ActivityLogService) {}

  async record(entry: SessionAuditEntry): Promise<void> {
    try {
      const metadata: Record<string, unknown> = {
        ...(entry.metadata ?? {}),
        sessionId: entry.sessionId,
        actorId: entry.actorId ?? null,
        reason: entry.reason ?? null,
      };
      await this.activityLogService.create({
        userId: entry.userId,
        userName: entry.userName,
        action: entry.action,
        description: this.describe(entry),
        method: 'SESSION',
        endpoint: '/auth|/admin/users (sessions)',
        module: SESSION_AUDIT_MODULE,
        statusCode: 200,
        success: true,
        ipAddress: entry.ipAddress ?? null,
        metadata,
      });
    } catch (error) {
      this.logger.warn(`Audit de session impossible: ${(error as Error).message}`);
    }
  }

  private describe(entry: SessionAuditEntry): string {
    const user = entry.userName ?? `#${entry.userId}`;
    const session = entry.sessionId ? ` (session ${entry.sessionId})` : '';
    switch (entry.action) {
      case SESSION_AUDIT_ACTIONS.CREATED:
        return `Session créée pour ${user}${session}`;
      case SESSION_AUDIT_ACTIONS.EXPIRED:
        return `Session expirée pour ${user}${session}`;
      case SESSION_AUDIT_ACTIONS.REVOKED: {
        const actor = entry.actorId ? `l'administrateur #${entry.actorId}` : 'le système';
        const reason = entry.reason ? ` (motif: ${entry.reason})` : '';
        return `Session révoquée pour ${user}${session} par ${actor}${reason}`;
      }
      case SESSION_AUDIT_ACTIONS.LOGOUT:
        return `Déconnexion de ${user}${session}`;
      case SESSION_AUDIT_ACTIONS.ALL_REVOKED: {
        const actor = entry.actorId ? `#${entry.actorId}` : '?';
        return `Toutes les sessions de ${user} ont été révoquées par l'administrateur ${actor}`;
      }
      default:
        return `Événement de session ${entry.action} pour ${user}`;
    }
  }
}
