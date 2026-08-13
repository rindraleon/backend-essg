import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    check(): Promise<{
        status: string;
        uptime: number;
        timestamp: string;
        storage: string;
    }>;
}
