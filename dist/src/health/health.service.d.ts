import { StorageService } from '../common/storage/storage.service';
export declare class HealthService {
    private readonly storageService;
    constructor(storageService: StorageService);
    check(): Promise<{
        status: string;
        uptime: number;
        timestamp: string;
        storage: string;
    }>;
}
