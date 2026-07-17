import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto, UpdateMessageDto } from './dto/create-message.dto';
import { PaginationDto, PaginationResponse } from '../common/dto/pagination.dto';
export declare class MessagesService {
    private readonly repo;
    constructor(repo: Repository<Message>);
    findAll(paginationDto: PaginationDto): Promise<PaginationResponse<Message>>;
    search(query: string, paginationDto: PaginationDto): Promise<PaginationResponse<Message>>;
    findOne(id: number): Promise<Message>;
    create(dto: CreateMessageDto): Promise<Message>;
    update(id: number, dto: UpdateMessageDto): Promise<Message>;
    remove(id: number): Promise<void>;
}
