"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const formation_entity_1 = require("../formations/entities/formation.entity");
const news_item_entity_1 = require("../news/entities/news-item.entity");
const project_entity_1 = require("../projects/entities/project.entity");
const partner_entity_1 = require("../parteners/entities/partner.entity");
const ressource_humaine_entity_1 = require("../ressources-humaines/entities/ressource-humaine.entity");
const admission_entity_1 = require("../admissions/entities/admission.entity");
let DashboardService = class DashboardService {
    userRepository;
    formationRepository;
    newsRepository;
    projectRepository;
    partnerRepository;
    admissionRepository;
    resourceRepository;
    constructor(userRepository, formationRepository, newsRepository, projectRepository, partnerRepository, admissionRepository, resourceRepository) {
        this.userRepository = userRepository;
        this.formationRepository = formationRepository;
        this.newsRepository = newsRepository;
        this.projectRepository = projectRepository;
        this.partnerRepository = partnerRepository;
        this.admissionRepository = admissionRepository;
        this.resourceRepository = resourceRepository;
    }
    async getStats() {
        const [totalUsers, totalFormations, totalNews, totalProjects, totalPartners, totalAdmissions, totalResources,] = await Promise.all([
            this.userRepository.count(),
            this.formationRepository.count(),
            this.newsRepository.count(),
            this.projectRepository.count(),
            this.partnerRepository.count(),
            this.admissionRepository.count(),
            this.resourceRepository.count(),
        ]);
        return {
            totalUsers,
            totalFormations,
            totalNews,
            totalProjects,
            totalPartners,
            totalAdmissions,
            totalResources,
        };
    }
    async getRecentActivities() {
        const recentUsers = await this.userRepository
            .createQueryBuilder('user')
            .select(['user.id', 'user.nom', 'user.prenom', 'user.creeLe'])
            .orderBy('user.creeLe', 'DESC')
            .limit(5)
            .getMany();
        const recentNews = await this.newsRepository
            .createQueryBuilder('news')
            .select(['news.id', 'news.titre', 'news.creeLe'])
            .orderBy('news.creeLe', 'DESC')
            .limit(5)
            .getMany();
        const activities = [];
        recentUsers.forEach((user) => {
            activities.push({
                id: user.id,
                user: `${user.nom} ${user.prenom}`,
                action: "s'est inscrit sur la plateforme",
                time: this.formatTime(user.creeLe),
                type: 'user',
            });
        });
        recentNews.forEach((news) => {
            activities.push({
                id: news.id,
                user: 'Admin',
                action: `a publié l'article "${news.titre}"`,
                time: this.formatTime(news.creeLe),
                type: 'news',
            });
        });
        return activities.toSorted((a, b) => b.id - a.id).slice(0, 10);
    }
    async getOverview() {
        const [stats, recentActivities] = await Promise.all([
            this.getStats(),
            this.getRecentActivities(),
        ]);
        return {
            stats,
            recentActivities,
        };
    }
    formatTime(date) {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1)
            return "À l'instant";
        if (minutes < 60)
            return `Il y a ${minutes} min`;
        if (hours < 24)
            return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        if (days < 7)
            return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
        return new Date(date).toLocaleDateString('fr-FR');
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.Utilisateur)),
    __param(1, (0, typeorm_1.InjectRepository)(formation_entity_1.Formation)),
    __param(2, (0, typeorm_1.InjectRepository)(news_item_entity_1.Actualite)),
    __param(3, (0, typeorm_1.InjectRepository)(project_entity_1.Projet)),
    __param(4, (0, typeorm_1.InjectRepository)(partner_entity_1.Partenaire)),
    __param(5, (0, typeorm_1.InjectRepository)(admission_entity_1.Admission)),
    __param(6, (0, typeorm_1.InjectRepository)(ressource_humaine_entity_1.RessourceHumaine)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map