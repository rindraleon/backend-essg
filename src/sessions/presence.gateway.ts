import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SESSION_EVENTS, WS_EVENTS, WS_ROOM_ADMIN, WS_ROOM_USER_PREFIX } from './session.constants';
import { SessionEventBus, type SessionEventPayload } from './session-event-bus.service';
import { SessionsService, hashSessionToken } from './sessions.service';
import { Utilisateur } from '../users/entities/user.entity';

interface HandshakeAuth {
  token?: string;
}

/** Données attachées à chaque socket connecté. */
interface GatewaySocketData {
  userId?: number;
  role?: string;
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class PresenceGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(PresenceGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
    private readonly eventBus: SessionEventBus,
    @InjectRepository(Utilisateur)
    private readonly usersRepo: Repository<Utilisateur>,
  ) {}

  afterInit(): void {
    this.eventBus.onAny((payload) => void this.broadcast(payload));
    this.logger.log('Gateway de présence WebSocket initialisé');
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const { token } = (client.handshake.auth ?? {}) as HandshakeAuth;
      if (!token) throw new Error('Jeton manquant');

      const payload = this.jwtService.verify<{
        sub: number;
        sid?: string;
        stk?: string;
        email: string;
      }>(token);

      if (!payload?.sub || !payload.sid || !payload.stk) {
        throw new Error('Jeton sans session');
      }

      // Validation serveur de la session (révoquée/expirée → refus).
      await this.sessionsService.validateForRequest(
        payload.sid,
        payload.sub,
        hashSessionToken(payload.stk),
      );

      const user = await this.usersRepo.findOne({
        where: { id: payload.sub },
        select: ['id', 'role', 'email'],
      });
      if (!user) throw new Error('Utilisateur inconnu');

      const data = client.data as GatewaySocketData;
      data.userId = payload.sub;
      data.role = user.role;
      await client.join(`${WS_ROOM_USER_PREFIX}${payload.sub}`);
      if (user.role === 'admin') {
        await client.join(WS_ROOM_ADMIN);
      }
      this.logger.debug(`WebSocket connecté: utilisateur #${payload.sub}`);
    } catch (error) {
      this.logger.debug(`Handshake WebSocket refusé: ${(error as Error).message}`);
      client.emit(WS_EVENTS.AUTH_ERROR, {
        message: 'Authentification WebSocket refusée',
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    client.data = {};
  }

  /**
   * Diffuse la mise à jour des paramètres aux administrateurs connectés.
   * Payload minimal : jamais de données sensibles (Spec §15).
   */
  broadcastSettingsUpdated(payload: {
    settings: { admissionsOuvertes: boolean };
    updatedAt: string;
  }): void {
    if (!this.server) return;
    this.server.to(WS_ROOM_ADMIN).emit(WS_EVENTS.SETTINGS_UPDATED, payload);
  }

  /** Ping de supervision (utile pour la reconnexion côté client). */
  @SubscribeMessage('presence:ping')
  ping(@ConnectedSocket() client: Socket, @MessageBody() payload: unknown) {
    client.emit('presence:pong', { at: new Date().toISOString(), echo: payload });
  }

  private async broadcast(payload: SessionEventPayload): Promise<void> {
    if (!this.server) return;
    try {
      const presence =
        payload.presence ?? (await this.sessionsService.getUserPresence(payload.userId));

      // Notification ciblée à l'utilisateur concerné.
      if (
        payload.action === SESSION_EVENTS.REVOKED ||
        payload.action === SESSION_EVENTS.ALL_REVOKED ||
        payload.action === SESSION_EVENTS.EXPIRED
      ) {
        this.server.to(`${WS_ROOM_USER_PREFIX}${payload.userId}`).emit(WS_EVENTS.SESSION_REVOKED, {
          userId: payload.userId,
          sessionId: payload.sessionId ?? null,
          action: payload.action,
          reason: payload.reason ?? null,
          at: payload.at.toISOString(),
        });
      }

      // Back-office (administrateurs) : présence + changement de session.
      this.server.to(WS_ROOM_ADMIN).emit(WS_EVENTS.PRESENCE_CHANGED, {
        userId: payload.userId,
        presence,
      });
      this.server.to(WS_ROOM_ADMIN).emit(WS_EVENTS.SESSION_CHANGED, {
        userId: payload.userId,
        sessionId: payload.sessionId ?? null,
        action: payload.action,
        sessionStatus: payload.sessionStatus ?? null,
        presence,
        at: payload.at.toISOString(),
      });
    } catch (error) {
      this.logger.warn(`Broadcast présence impossible: ${(error as Error).message}`);
    }
  }
}
