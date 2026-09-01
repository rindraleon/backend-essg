import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import {
  ApiPaginatedResponse,
  ApiStandardErrors,
  ApiStandardResponse,
} from '../common/swagger/api-response.decorator';
import { PresenceQueryDto } from './dto/presence-query.dto';
import { Utilisateur } from '../users/entities/user.entity';
import { SessionsService } from './sessions.service';
import { RevokeSessionDto } from './dto/revoke-session.dto';
import { PresenceUserResponseDto, SessionResponseDto } from './dto/session-response.dto';

interface AuthUser {
  userId: number;
  role: string;
}

@ApiTags('Sessions (administration)')
@ApiBearerAuth('access-token')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminSessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    @InjectRepository(Utilisateur)
    private readonly usersRepo: Repository<Utilisateur>,
  ) {}

  @Roles('admin')
  @Get('presence')
  @ApiOperation({
    summary: 'Présence de tous les utilisateurs',
    description:
      'Liste paginée des comptes avec leur présence CALCULÉE au moment de la requête (Spec §12/§16) : statut online/inactive/offline, sessions actives, sessions valides, total et dernière activité. Jamais de champ `status` figé.',
  })
  @ApiPaginatedResponse(
    PresenceUserResponseDto,
    'Présence calculée des utilisateurs du Back-Office',
  )
  @ApiStandardErrors({ notFound: true })
  @ApiMessage('Présence des utilisateurs calculée')
  async presence(@Query() pagination: PresenceQueryDto) {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    const [users, total] = await this.usersRepo.findAndCount({
      order: { id: 'ASC' },
      skip,
      take: limit,
    });

    const presenceMap = await this.sessionsService.getPresenceMap(users.map((user) => user.id));

    return {
      items: users.map((user) => ({
        id: user.id,
        email: user.email,
        prenom: user.prenom,
        nom: user.nom,
        presence: presenceMap.get(user.id)!,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  @Roles('admin')
  @Get(':userId/sessions')
  @ApiOperation({
    summary: 'Sessions d’un utilisateur',
    description:
      'Liste détaillée des sessions du compte ciblé avec leur statut calculé (active / inactive / expired / revoked).',
  })
  @ApiParam({ name: 'userId', example: 25 })
  @ApiStandardResponse(SessionResponseDto, { description: 'Sessions', isArray: true })
  @ApiStandardErrors({ notFound: true })
  @ApiMessage('Sessions récupérées')
  async userSessions(@Param('userId', ParseIntPipe) userId: number) {
    await this.assertUserExists(userId);
    return this.sessionsService.listForUser(userId);
  }

  @Roles('admin')
  @Post(':userId/sessions/:sessionId/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Révoquer une session précise',
    description:
      'Révoque UNE session de l’utilisateur (Spec §10). Les autres sessions restent fonctionnelles et la présence de l’utilisateur est recalculée. Un motif optionnel peut être fourni.',
  })
  @ApiParam({ name: 'userId', example: 25 })
  @ApiParam({ name: 'sessionId', example: 'b4c9...-uuid' })
  @ApiStandardResponse(SessionResponseDto, { description: 'Session révoquée' })
  @ApiStandardErrors({ notFound: true })
  @ApiMessage('Session révoquée')
  async revoke(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: RevokeSessionDto,
    @CurrentUser() actor: AuthUser,
  ) {
    await this.assertUserExists(userId);
    const session = await this.sessionsService.revoke(userId, sessionId, actor.userId, dto?.reason);
    return session;
  }

  @Roles('admin')
  @Post(':userId/sessions/revoke-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Déconnecter toutes les sessions',
    description:
      'Révoque TOUTES les sessions de l’utilisateur (Spec §11). Présence résultante : hors ligne.',
  })
  @ApiParam({ name: 'userId', example: 25 })
  @ApiStandardResponse(undefined, { description: 'Toutes les sessions révoquées' })
  @ApiStandardErrors({ notFound: true })
  @ApiMessage('Toutes les sessions ont été déconnectées')
  async revokeAll(@Param('userId', ParseIntPipe) userId: number, @CurrentUser() actor: AuthUser) {
    await this.assertUserExists(userId);
    const result = await this.sessionsService.revokeAll(userId, actor.userId);
    const presence = await this.sessionsService.getUserPresence(userId);
    return { ...result, presence };
  }

  private async assertUserExists(userId: number): Promise<void> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      select: ['id'],
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
  }
}
