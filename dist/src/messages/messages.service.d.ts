import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedData } from '../common/interfaces/api-response.interface';
import { MailService } from '../mail/mail.service';
import { CreateMessageDto, UpdateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
export declare class MessagesService {
    private readonly repo;
    private readonly mailService;
    private readonly logger;
    constructor(repo: Repository<Message>, mailService: MailService);
    private findPaginated;
    findAll(paginationDto: PaginationDto): Promise<PaginatedData<Message>>;
    search(query: string, paginationDto: PaginationDto): Promise<PaginatedData<Message>>;
    findOne(id: number): Promise<Message>;
    create(dto: CreateMessageDto): Promise<Message>;
    update(id: number, dto: UpdateMessageDto): Promise<Message>;
    remove(id: number): Promise<void>;
}
