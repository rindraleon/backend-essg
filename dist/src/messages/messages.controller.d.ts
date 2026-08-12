import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateMessageDto, UpdateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';
export declare class MessagesController {
    private readonly service;
    constructor(service: MessagesService);
    findAll(paginationDto: PaginationQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedData<import("./entities/message.entity").Message>>;
    search(query: string, paginationDto: PaginationQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedData<import("./entities/message.entity").Message>>;
    findOne(id: number): Promise<import("./entities/message.entity").Message>;
    create(dto: CreateMessageDto): Promise<import("./entities/message.entity").Message>;
    update(id: number, dto: UpdateMessageDto): Promise<import("./entities/message.entity").Message>;
    remove(id: number): Promise<void>;
}
