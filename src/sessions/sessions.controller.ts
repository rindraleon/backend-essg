import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import { ApiStandardErrors, ApiStandardResponse } from '../common/swagger/api-response.decorator';
import { SessionsService } from './sessions.service';
import { SessionsGuard } from './sessions.guard';
import { SessionResponseDto } from './dto/session-response.dto';

interface AuthUser {
  userId: number;
  sessionId?: string;
}

@ApiTags('Sessions (compte courant)')
@ApiBearerAuth('access-token')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get('session')
  @UseGuards(SessionsGuard)
  @ApiOperation({
    summary: 'Session courante',
    description:
      'Renvoie la session qui porte la requête (appareil, navigateur, activité, expiration).',
  })
  @ApiStandardResponse(SessionResponseDto, { description: 'Session courante' })
  @ApiStandardErrors({ auth: true })
  @ApiMessage('Session courante récupérée')
  currentSession(@CurrentUser() user: AuthUser) {
    return this.sessionsService.getCurrentInfo(user.userId, user.sessionId!);
  }

  @Get('sessions')
  @ApiOperation({
    summary: 'Mes sessions',
    description:
      'Liste toutes les sessions du compte connecté (multi-appareils, multi-navigateurs), avec leur statut calculé.',
  })
  @ApiStandardResponse(SessionResponseDto, {
    description: 'Liste des sessions du compte',
    isArray: true,
  })
  @ApiStandardErrors({ auth: true })
  @ApiMessage('Sessions récupérées')
  mySessions(@CurrentUser() user: AuthUser) {
    return this.sessionsService.listForUser(user.userId, user.sessionId);
  }

  @Post('sessions/:sessionId/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Déconnecter un de mes appareils',
    description:
      'Révoque UNE de mes autres sessions (un appareil distant). Impossible de cibler la session d’un autre utilisateur : le contrôle d’appartenance est effectué côté serveur (Spec §19).',
  })
  @ApiStandardResponse(undefined, { description: 'Session distante révoquée' })
  @ApiStandardErrors({ auth: true })
  @ApiMessage('Appareil déconnecté')
  async revokeMySession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser() user: AuthUser,
  ) {
    // `logout` vérifie l'appartenance (findByIdAndUser) : un utilisateur
    // standard ne peut jamais révoquer la session d'un autre utilisateur.
    await this.sessionsService.logout(user.userId, sessionId);
    return { revoked: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Se déconnecter (cette session)',
    description:
      'Révoque UNIQUEMENT la session courante. Les autres sessions du compte (mobile, autre navigateur) restent connectées.',
  })
  @ApiStandardResponse(undefined, { description: 'Session révoquée' })
  @ApiStandardErrors({ auth: true })
  @ApiMessage('Déconnexion réussie')
  async logout(@CurrentUser() user: AuthUser) {
    await this.sessionsService.logout(user.userId, user.sessionId!);
    return { loggedOut: true };
  }
}
