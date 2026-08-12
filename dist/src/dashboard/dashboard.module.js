"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const dashboard_controller_1 = require("./dashboard.controller");
const dashboard_service_1 = require("./dashboard.service");
const user_entity_1 = require("../users/entities/user.entity");
const formation_entity_1 = require("../formations/entities/formation.entity");
const news_item_entity_1 = require("../news/entities/news-item.entity");
const project_entity_1 = require("../projects/entities/project.entity");
const partner_entity_1 = require("../parteners/entities/partner.entity");
const admission_entity_1 = require("../admissions/entities/admission.entity");
const ressource_humaine_entity_1 = require("../ressources-humaines/entities/ressource-humaine.entity");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.Utilisateur,
                formation_entity_1.Formation,
                news_item_entity_1.Actualite,
                project_entity_1.Projet,
                partner_entity_1.Partenaire,
                admission_entity_1.Admission,
                ressource_humaine_entity_1.RessourceHumaine,
            ]),
        ],
        controllers: [dashboard_controller_1.DashboardController],
        providers: [dashboard_service_1.DashboardService],
        exports: [dashboard_service_1.DashboardService],
    })
], DashboardModule);
//# sourceMappingURL=dashboard.module.js.map