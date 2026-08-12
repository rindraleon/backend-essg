import { StorageService } from '../common/storage/storage.service';
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionStatusDto } from './dto/update-admission-status.dto';
interface AdmissionFiles {
    cv?: Express.Multer.File[];
    lettreMotivation?: Express.Multer.File[];
}
export declare class AdmissionsController {
    private readonly admissionsService;
    private readonly storageService;
    constructor(admissionsService: AdmissionsService, storageService: StorageService);
    create(createAdmissionDto: CreateAdmissionDto, files?: AdmissionFiles): Promise<import("./entities/admission.entity").Admission>;
    findAll(): Promise<import("./entities/admission.entity").Admission[]>;
    findOne(id: number): Promise<import("./entities/admission.entity").Admission>;
    updateStatus(id: number, updateAdmissionStatusDto: UpdateAdmissionStatusDto): Promise<import("./entities/admission.entity").Admission>;
    remove(id: number): Promise<void>;
}
export {};
