import { Repository } from 'typeorm';
import { Admission } from './entities/admission.entity';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionStatusDto } from './dto/update-admission-status.dto';
import { MailService } from '../mail/mail.service';
export declare class AdmissionsService {
    private readonly admissionsRepository;
    private readonly mailService;
    constructor(admissionsRepository: Repository<Admission>, mailService: MailService);
    create(createAdmissionDto: CreateAdmissionDto): Promise<Admission>;
    findAll(): Promise<Admission[]>;
    findOne(id: number): Promise<Admission>;
    updateStatus(id: number, updateStatusDto: UpdateAdmissionStatusDto): Promise<Admission>;
    remove(id: number): Promise<void>;
}
