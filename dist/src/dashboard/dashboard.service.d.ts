import { Repository } from 'typeorm';
import { Utilisateur } from '../users/entities/user.entity';
import { Formation } from '../formations/entities/formation.entity';
import { Actualite } from '../news/entities/news-item.entity';
import { Projet } from '../projects/entities/project.entity';
export interface DashboardStats {
    totalUsers: number;
    totalFormations: number;
    totalNews: number;
    totalProjects: number;
    usersChange: string;
    formationsChange: string;
    newsChange: string;
    projectsChange: string;
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
    constructor(userRepository: Repository<Utilisateur>, formationRepository: Repository<Formation>, newsRepository: Repository<Actualite>, projectRepository: Repository<Projet>);
    getStats(): Promise<DashboardStats>;
    getRecentActivities(): Promise<Activity[]>;
    getOverview(): Promise<Overview>;
    private formatTime;
}
