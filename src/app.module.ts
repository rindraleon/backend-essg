import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdmissionsModule } from './admissions/admissions.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './common/storage/storage.module';
import { validate } from './config/env.validation';
import { DashboardModule } from './dashboard/dashboard.module';
import { DatabaseModule } from './database/database.module';
import { FormationsModule } from './formations/formations.module';
import { MailModule } from './mail/mail.module';
import { MessagesModule } from './messages/messages.module';
import { ActivityLogsModule } from './activity-logs/activity-log.module';
import { NewsModule } from './news/news.module';
import { PartnersModule } from './parteners/partners.module';
import { ProjectsModule } from './projects/projects.module';
import { RessourcesHumainesModule } from './ressources-humaines/ressources-humaines.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    DatabaseModule,
    StorageModule,
    UsersModule,
    AuthModule,
    FormationsModule,
    ProjectsModule,
    PartnersModule,
    MessagesModule,
    NewsModule,
    RessourcesHumainesModule,
    UploadModule,
    DashboardModule,
    MailModule,
    AdmissionsModule,
    ActivityLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
