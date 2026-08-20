import { Repository } from 'typeorm';
import { PaginatedData } from '../common/interfaces/api-response.interface';
import { StorageService } from '../common/storage/storage.service';
import { EmailDomainService } from '../common/validators/email-domain.service';
import { MailService } from '../mail/mail.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { QueryAdmissionDto } from './dto/query-admission.dto';
import { UpdateAdmissionStatusDto } from './dto/update-admission-status.dto';
import { Admission } from './entities/admission.entity';
export type AdmissionDocumentKind = 'cv' | 'lettre';
export interface AdmissionDocumentFile {
    buffer: Buffer;
    filename: string;
    mimetype: string;
    inlineViewable: boolean;
}
export declare class AdmissionsService {
    private readonly admissionsRepository;
    private readonly mailService;
    private readonly storageService;
    private readonly emailDomainService;
    private readonly logger;
    constructor(admissionsRepository: Repository<Admission>, mailService: MailService, storageService: StorageService, emailDomainService: EmailDomainService);
    private assertEmailDomainExists;
    private buildReference;
    create(createAdmissionDto: CreateAdmissionDto): Promise<Admission>;
    findAll(query?: QueryAdmissionDto): Promise<PaginatedData<Admission>>;
    findOne(id: number): Promise<Admission>;
    updateStatus(id: number, updateStatusDto: UpdateAdmissionStatusDto): Promise<Admission>;
    getDocument(id: number, kind: string): Promise<AdmissionDocumentFile>;
    private notifyStatusChange;
    remove(id: number): Promise<void>;
}
