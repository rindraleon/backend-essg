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
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./database/database.module");
const config_1 = require("@nestjs/config");
const users_module_1 = require("./users/users.module");
const formations_module_1 = require("./formations/formations.module");
const projects_module_1 = require("./projects/projects.module");
const messages_module_1 = require("./messages/messages.module");
const auth_module_1 = require("./auth/auth.module");
const partners_module_1 = require("./parteners/partners.module");
const news_module_1 = require("./news/news.module");
const upload_module_1 = require("./upload/upload.module");
const ressources_humaines_module_1 = require("./ressources-humaines/ressources-humaines.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const mail_module_1 = require("./mail/mail.module");
const admissions_module_1 = require("./admissions/admissions.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            database_module_1.DatabaseModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            formations_module_1.FormationsModule,
            projects_module_1.ProjectsModule,
            partners_module_1.PartnersModule,
            messages_module_1.MessagesModule,
            news_module_1.NewsModule,
            ressources_humaines_module_1.RessourcesHumainesModule,
            upload_module_1.UploadModule,
            dashboard_module_1.DashboardModule,
            mail_module_1.MailModule,
            admissions_module_1.AdmissionsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map