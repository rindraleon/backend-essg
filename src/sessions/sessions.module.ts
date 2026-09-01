import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogsModule } from '../activity-logs/activity-log.module';
import { Utilisateur } from '../users/entities/user.entity';
import { AdminSessionsController } from './admin-sessions.controller';
import { UserSession } from './entities/session.entity';
import { PresenceGateway } from './presence.gateway';
import { SessionAuditService } from './session-audit.service';
import { SessionEventBus } from './session-event-bus.service';
import { SessionsController } from './sessions.controller';
import { SessionsGuard } from './sessions.guard';
import { SessionsRepository } from './sessions.repository';
import { SessionsService } from './sessions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSession, Utilisateur]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'essg-default-secret-key-change-in-production'),
      }),
    }),
    ActivityLogsModule,
  ],
  controllers: [SessionsController, AdminSessionsController],
  providers: [
    SessionsService,
    SessionsRepository,
    SessionsGuard,
    SessionEventBus,
    SessionAuditService,
    PresenceGateway,
  ],
  exports: [SessionsService, SessionsGuard, SessionEventBus, PresenceGateway],
})
export class SessionsModule {}
