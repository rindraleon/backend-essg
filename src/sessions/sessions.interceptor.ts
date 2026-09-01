import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SessionsService } from './sessions.service';
import type { RequestWithSession } from './sessions.guard';

@Injectable()
export class SessionsActivityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SessionsActivityInterceptor.name);

  constructor(private readonly sessionsService: SessionsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isHttp = context.getType() === 'http';
    if (isHttp) {
      const request = context.switchToHttp().getRequest<RequestWithSession>();
      const sessionId = request.user?.sessionId;
      const userId = request.user?.userId;
      if (sessionId && userId) {
        // Charge la session sans bloquer la réponse (l'échec est silencieux :
        // la validation en garde/stratégie reste la barrière de sécurité).
        void this.sessionsService
          .findForTouch(sessionId, userId)
          .then((session) => {
            if (session) return this.sessionsService.touch(session);
          })
          .catch((error) => {
            this.logger.warn(`Activité de session impossible: ${(error as Error).message}`);
          });
      }
    }
    return next.handle();
  }
}
