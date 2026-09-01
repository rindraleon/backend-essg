import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionStatus } from './enums/session-status.enum';
import { SessionsService, type SessionInfo } from './sessions.service';
import type { UserSession } from './entities/session.entity';

export interface RequestWithSession extends Request {
  user?: {
    userId: number;
    sessionId?: string;
    role: string;
    [key: string]: unknown;
  };
  session?: UserSession;
  sessionInfo?: SessionInfo;
}

@Injectable()
export class SessionsGuard implements CanActivate {
  constructor(private readonly sessionsService: SessionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithSession>();

    const userId = request.user?.userId;
    const sessionId = request.user?.sessionId;
    if (!userId || !sessionId) {
      throw new UnauthorizedException('Session requise');
    }

    const session = await this.sessionsService.getCurrentInfo(userId, sessionId);
    if (session.status === SessionStatus.REVOKED || session.status === SessionStatus.EXPIRED) {
      throw new UnauthorizedException('Session invalide, veuillez vous reconnecter');
    }

    request.sessionInfo = session;
    return true;
  }
}
