import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedData } from '../common/interfaces/api-response.interface';
import { buildPaginatedData } from '../common/utils/pagination.util';
import { MailService } from '../mail/mail.service';
import { CreateMessageDto, UpdateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { capitalize, toUpperCase } from '../common/utils/text.util';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
    private readonly mailService: MailService,
  ) {}

  private async findPaginated(
    where: FindOptionsWhere<Message> | FindOptionsWhere<Message>[],
    paginationDto: PaginationDto,
  ): Promise<PaginatedData<Message>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: sortBy ? { [sortBy]: sortOrder } : { creeLe: 'DESC' },
      skip,
      take: limit,
    });

    return buildPaginatedData(data, total, page, limit);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedData<Message>> {
    return this.findPaginated({}, paginationDto);
  }

  async search(query: string, paginationDto: PaginationDto): Promise<PaginatedData<Message>> {
    const where: FindOptionsWhere<Message>[] = query
      ? [
          { nom: ILike(`%${query}%`) },
          { email: ILike(`%${query}%`) },
          { message: ILike(`%${query}%`) },
        ]
      : [{}];
    return this.findPaginated(where, paginationDto);
  }

  async findOne(id: number): Promise<Message> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Message non trouvé');
    return item;
  }

  async create(dto: CreateMessageDto): Promise<Message> {
    const item = this.repo.create({
      ...dto,
      nom: toUpperCase(dto.nom),
      prenom: capitalize(dto.prenom),
      sujet: capitalize(dto.sujet),
      message: capitalize(dto.message),
    });
    const saved = await this.repo.save(item);

    try {
      await this.mailService.sendMessageReceiptEmail(saved.email, {
        nom: saved.nom,
        prenom: saved.prenom,
        sujet: saved.sujet,
      });
      this.logger.log(`Accusé de réception envoyé à ${saved.email}`);
    } catch (error) {
      this.logger.error(`Échec de l'envoi de l'accusé de réception à ${saved.email}`, error);
    }

    return saved;
  }

  async update(id: number, dto: UpdateMessageDto): Promise<Message> {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
