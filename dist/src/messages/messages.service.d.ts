import { Repository } from 'typeorm';
import { PaginatedData } from '../common/interfaces/api-response.interface';
import { MailService } from '../mail/mail.service';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateMessageDto, UpdateMessageDto } from './dto/create-message.dto';
import { QueryMessageDto } from './dto/query-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';
import { Message } from './entities/message.entity';
import { EmailDomainService } from '../common/validators/email-domain.service';
export declare class MessagesService {
    private readonly repo;
    private readonly mailService;
    private readonly emailDomainService;
    private readonly logger;
    constructor(repo: Repository<Message>, mailService: MailService, emailDomainService: EmailDomainService);
    private assertEmailDomainExists;
    private findFiltered;
    findAll(queryDto?: QueryMessageDto): Promise<PaginatedData<Message>>;
    search(query: string, queryDto?: QueryMessageDto): Promise<PaginatedData<Message>>;
    findOne(id: number): Promise<Message>;
    create(dto: CreateMessageDto): Promise<Message>;
    update(id: number, dto: UpdateMessageDto, reader?: AuthUser): Promise<Message>;
    reply(id: number, dto: ReplyMessageDto, author: AuthUser): Promise<Message>;
    remove(id: number): Promise<void>;
}
