import { type AuthUser } from '../common/decorators/current-user.decorator';
import { CreateMessageDto, UpdateMessageDto } from './dto/create-message.dto';
import { QueryMessageDto } from './dto/query-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';
import { MessagesService } from './messages.service';
export declare class MessagesController {
    private readonly service;
    constructor(service: MessagesService);
    findAll(query: QueryMessageDto): Promise<import("../common/interfaces/api-response.interface").PaginatedData<import("./entities/message.entity").Message>>;
    search(query: QueryMessageDto): Promise<import("../common/interfaces/api-response.interface").PaginatedData<import("./entities/message.entity").Message>>;
    findOne(id: number): Promise<import("./entities/message.entity").Message>;
    create(dto: CreateMessageDto): Promise<import("./entities/message.entity").Message>;
    reply(id: number, dto: ReplyMessageDto, user: AuthUser): Promise<import("./entities/message.entity").Message>;
    update(id: number, dto: UpdateMessageDto, user: AuthUser): Promise<import("./entities/message.entity").Message>;
    remove(id: number): Promise<void>;
}
