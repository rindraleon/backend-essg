"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const admissions_module_1 = require("./admissions/admissions.module");
const auth_module_1 = require("./auth/auth.module");
const performance_interceptor_1 = require("./common/interceptors/performance.interceptor");
const storage_module_1 = require("./common/storage/storage.module");
const email_domain_module_1 = require("./common/validators/email-domain.module");
const env_validation_1 = require("./config/env.validation");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const database_module_1 = require("./database/database.module");
const formations_module_1 = require("./formations/formations.module");
const health_module_1 = require("./health/health.module");
const mail_module_1 = require("./mail/mail.module");
const media_module_1 = require("./media/media.module");
const messages_module_1 = require("./messages/messages.module");
const activity_log_module_1 = require("./activity-logs/activity-log.module");
const news_module_1 = require("./news/news.module");
const partners_module_1 = require("./parteners/partners.module");
const projects_module_1 = require("./projects/projects.module");
const ressources_humaines_module_1 = require("./ressources-humaines/ressources-humaines.module");
const upload_module_1 = require("./upload/upload.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                validate: env_validation_1.validate,
            }),
            database_module_1.DatabaseModule,
            storage_module_1.StorageModule,
            email_domain_module_1.EmailDomainModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            formations_module_1.FormationsModule,
            projects_module_1.ProjectsModule,
            partners_module_1.PartnersModule,
            messages_module_1.MessagesModule,
            news_module_1.NewsModule,
            ressources_humaines_module_1.RessourcesHumainesModule,
            upload_module_1.UploadModule,
            media_module_1.MediaModule,
            health_module_1.HealthModule,
            dashboard_module_1.DashboardModule,
            mail_module_1.MailModule,
            admissions_module_1.AdmissionsModule,
            activity_log_module_1.ActivityLogsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_INTERCEPTOR, useClass: performance_interceptor_1.PerformanceInterceptor },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map