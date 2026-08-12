import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { QueryActivityLogDto } from './dto/query-activity-log.dto';
import { PaginatedData } from 'src/common/interfaces/api-response.interface';
import { buildPaginatedData } from 'src/common/utils/pagination.util';
import { ActivityLog } from './entities/activity-log.entity';


export interface CreateActivityLogData {
  userId: number | null;
  action: string;
  description: string;
  method: string;
  endpoint: string;
  module: string;
  statusCode: number;
  success: boolean;
  ipAddress: string | null;
  metadata: Record<string, unknown> | null;
}

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly repo: Repository<ActivityLog>,
  ) {}

  async create(data: CreateActivityLogData): Promise<ActivityLog> {
    const log = this.repo.create(data);
    return this.repo.save(log);
  }

  async findAll(query: QueryActivityLogDto): Promise<PaginatedData<ActivityLog>> {
    const {
      page = 1,
      limit = 20,
      userId,
      action,
      module,
      method,
      statusCode,
      success,
      startDate,
      endDate,
      search,
      sortBy,
      sortOrder = 'DESC',
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('log');

    if (userId !== undefined) {
      qb.andWhere('log.userId = :userId', { userId });
    }
    if (action) {
      qb.andWhere('log.action = :action', { action });
    }
    if (module) {
      qb.andWhere('log.module = :module', { module });
    }
    if (method) {
      qb.andWhere('log.method = :method', { method });
    }
    if (statusCode !== undefined) {
      qb.andWhere('log.statusCode = :statusCode', { statusCode });
    }
    if (success !== undefined) {
      qb.andWhere('log.success = :success', { success });
    }
    if (startDate) {
      qb.andWhere('log.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('log.createdAt <= :endDate', { endDate });
    }
    if (search) {
      const term = `%${search}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('log.description ILIKE :term', { term })
            .orWhere('log.endpoint ILIKE :term', { term })
            .orWhere('log.module ILIKE :term', { term });
        }),
      );
    }

    const allowedSort = ['id', 'createdAt', 'userId', 'module', 'method', 'statusCode', 'success'];
    const orderBy = allowedSort.includes(sortBy ?? '') ? sortBy : 'createdAt';
    qb.orderBy(`log.${orderBy}`, sortOrder);

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return buildPaginatedData(items, total, page, limit);
  }

  async findOne(id: number): Promise<ActivityLog> {
    const log = await this.repo.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException(`Log d'activité avec l'ID ${id} non trouvé`);
    }
    return log;
  }
}
