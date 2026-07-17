import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto, UpdateMessageDto } from './dto/create-message.dto';
import {
  PaginationDto,
  PaginationResponse,
} from '../common/dto/pagination.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Message>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      order: sortBy ? { [sortBy]: sortOrder } : { creeLe: 'DESC' },
      skip,
      take: limit,
    });

    return new PaginationResponse(data, total, page, limit);
  }

  async search(
    query: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Message>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const whereCondition: FindOptionsWhere<Message> = {};

    if (query) {
      whereCondition.nom = query as FindOptionsWhere<Message>['nom'];
      whereCondition.email = query as FindOptionsWhere<Message>['email'];
      whereCondition.message = query as FindOptionsWhere<Message>['message'];
    }

    const [data, total] = await this.repo.findAndCount({
      where: whereCondition,
      order: sortBy ? { [sortBy]: sortOrder } : { creeLe: 'DESC' },
      skip,
      take: limit,
    });

    return new PaginationResponse(data, total, page, limit);
  }

  async findOne(id: number): Promise<Message> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Message non trouvé');
    return item;
  }

  async create(dto: CreateMessageDto): Promise<Message> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: number, dto: UpdateMessageDto): Promise<Message> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
