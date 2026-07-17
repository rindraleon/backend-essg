import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(): Promise<import("./dashboard.service").DashboardStats>;
    getRecentActivities(): Promise<import("./dashboard.service").Activity[]>;
    getOverview(): Promise<import("./dashboard.service").Overview>;
    getPublicStats(): Promise<import("./dashboard.service").DashboardStats>;
    getPublicRecentActivities(): Promise<import("./dashboard.service").Activity[]>;
}
