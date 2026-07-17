import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Utilisateur } from '../users/entities/user.entity';
import { Formation } from '../formations/entities/formation.entity';
import { Actualite } from '../news/entities/news-item.entity';
import { Projet } from '../projects/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Utilisateur, Formation, Actualite, Projet]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}