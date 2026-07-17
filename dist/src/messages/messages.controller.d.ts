import { MessagesService } from './messages.service';
import { CreateMessageDto, UpdateMessageDto } from './dto/create-message.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
export declare class MessagesController {
    private readonly service;
    constructor(service: MessagesService);
    findAll(paginationDto: PaginationQueryDto): Promise<import("../common/dto/pagination.dto").PaginationResponse<import("./entities/message.entity").Message>>;
    search(query: string, paginationDto: PaginationQueryDto): Promise<import("../common/dto/pagination.dto").PaginationResponse<import("./entities/message.entity").Message>>;
    findOne(id: number): Promise<import("./entities/message.entity").Message>;
    create(dto: CreateMessageDto): Promise<import("./entities/message.entity").Message>;
    update(id: number, dto: UpdateMessageDto): Promise<import("./entities/message.entity").Message>;
    remove(id: number): Promise<void>;
}
