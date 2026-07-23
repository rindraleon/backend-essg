import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionStatusDto } from './dto/update-admission-status.dto';
export declare class AdmissionsController {
    private readonly admissionsService;
    constructor(admissionsService: AdmissionsService);
    create(createAdmissionDto: CreateAdmissionDto, files: {
        cv?: Express.Multer.File;
        lettreMotivation?: Express.Multer.File;
    }): Promise<import("./entities/admission.entity").Admission>;
    findAll(): Promise<import("./entities/admission.entity").Admission[]>;
    findOne(id: string): Promise<import("./entities/admission.entity").Admission>;
    updateStatus(id: string, updateAdmissionStatusDto: UpdateAdmissionStatusDto): Promise<import("./entities/admission.entity").Admission>;
    remove(id: string): Promise<void>;
}
