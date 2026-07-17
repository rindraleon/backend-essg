import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Projet } from './entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Projet])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
