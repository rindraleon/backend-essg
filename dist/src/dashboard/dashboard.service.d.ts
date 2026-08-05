import { Repository } from 'typeorm';
import { Utilisateur } from '../users/entities/user.entity';
import { Formation } from '../formations/entities/formation.entity';
import { Actualite } from '../news/entities/news-item.entity';
import { Projet } from '../projects/entities/project.entity';
import { Partenaire } from '../parteners/entities/partner.entity';
import { RessourceHumaine } from '../ressources-humaines/entities/ressource-humaine.entity';
import { Admission } from '../admissions/entities/admission.entity';
export interface DashboardStats {
    totalUsers: number;
    totalFormations: number;
    totalNews: number;
    totalProjects: number;
    totalPartners: number;
    totalAdmissions: number;
    totalResources: number;
}
export interface Activity {
    id: number;
    user: string;
    action: string;
    time: string;
    type: 'user' | 'formation' | 'news' | 'project';
}
export interface Overview {
    stats: DashboardStats;
    recentActivities: Activity[];
}
export declare class DashboardService {
    private readonly userRepository;
    private readonly formationRepository;
    private readonly newsRepository;
    private readonly projectRepository;
    private readonly partnerRepository;
    private readonly admissionRepository;
    private readonly resourceRepository;
    constructor(userRepository: Repository<Utilisateur>, formationRepository: Repository<Formation>, newsRepository: Repository<Actualite>, projectRepository: Repository<Projet>, partnerRepository: Repository<Partenaire>, admissionRepository: Repository<Admission>, resourceRepository: Repository<RessourceHumaine>);
    getStats(): Promise<DashboardStats>;
    getRecentActivities(): Promise<Activity[]>;
    getOverview(): Promise<Overview>;
    private formatTime;
}
