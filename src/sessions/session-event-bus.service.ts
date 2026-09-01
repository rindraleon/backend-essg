import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'node:events';
import { SESSION_EVENTS, SessionEventName } from './session.constants';
import type { UserPresenceResult } from './session-presence.util';
import { SessionStatus } from './enums/session-status.enum';

/** Charge utile d'un événement de session (Spec §14/§20). */
export interface SessionEventPayload {
  userId: number;
  sessionId?: string | null;
  /** Identifiant de l'acteur (administrateur) pour une révocation. */
  actorId?: number | null;
  /** Identifiant de la session révoquée (pour `session:revoked` au client). */
  action: SessionEventName;
  sessionStatus?: SessionStatus | null;
  /** Présence de l'utilisateur recalculée après l'événement. */
  presence?: UserPresenceResult | null;
  reason?: string | null;
  at: Date;
}

@Injectable()
export class SessionEventBus {
  private readonly emitter = new EventEmitter();

  emit(payload: SessionEventPayload): void {
    this.emitter.emit(payload.action, payload);
  }

  on(action: SessionEventName, listener: (payload: SessionEventPayload) => void): void {
    this.emitter.on(action, listener);
  }

  onAny(listener: (payload: SessionEventPayload) => void): void {
    for (const action of Object.values(SESSION_EVENTS)) {
      this.emitter.on(action, listener);
    }
  }
}
