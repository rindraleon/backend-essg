import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionStatusDto } from './dto/update-admission-status.dto';
import { Admission } from './entities/admission.entity';
export declare class AdmissionsService {
    private readonly admissionsRepository;
    private readonly mailService;
    private readonly logger;
    constructor(admissionsRepository: Repository<Admission>, mailService: MailService);
    private buildReference;
    create(createAdmissionDto: CreateAdmissionDto): Promise<Admission>;
    findAll(): Promise<Admission[]>;
    findOne(id: number): Promise<Admission>;
    updateStatus(id: number, updateStatusDto: UpdateAdmissionStatusDto): Promise<Admission>;
    private notifyStatusChange;
    remove(id: number): Promise<void>;
}
