import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { FormationsModule } from './formations/formations.module';
import { ProjectsModule } from './projects/projects.module';
import { MessagesModule } from './messages/messages.module';
import { AuthModule } from './auth/auth.module';
import { PartnersModule } from './parteners/partners.module';
import { NewsModule } from './news/news.module';
import { UploadModule } from './upload/upload.module';
import { RessourcesHumainesModule } from './ressources-humaines/ressources-humaines.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
