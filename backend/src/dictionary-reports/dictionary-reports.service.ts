import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DictionaryReportEntity,
  ReportStatus,
} from './entities/dictionary-report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { createPaginatedResponse } from '../common/utils/pagination.util';

@Injectable()
export class DictionaryReportsService {
  constructor(
    @InjectRepository(DictionaryReportEntity)
    private readonly reportRepository: Repository<DictionaryReportEntity>,
  ) {}

  async create(userId: string, createReportDto: CreateReportDto) {
    const report = this.reportRepository.create({
      ...createReportDto,
      userId,
      status: ReportStatus.PENDING,
    });
    return await this.reportRepository.save(report);
  }

  async findAll(query: ReportQueryDto) {
    const { page = 1, limit = 10, status, type, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.user', 'user')
      .leftJoinAndSelect('report.idiom', 'idiom')
      .orderBy('report.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      queryBuilder.andWhere('report.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('report.type = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere(
        '(report.description LIKE :search OR idiom.hanzi LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(data, total, page, limit);
  }

  async findMyReports(userId: string, query: ReportQueryDto) {
    const { page = 1, limit = 10, filter } = query;
    const skip = (page - 1) * limit;

    let idiomId = undefined;
    if (filter && typeof filter === 'string' && filter.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(filter);
        idiomId = parsed.idiomId;
      } catch (e) {
        // Fallback
      }
    }

    const [items, total] = await this.reportRepository.findAndCount({
      where: { userId, idiomId },
      relations: ['idiom'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return createPaginatedResponse(items, total, page, limit);
  }

  async getStats() {
    const pending = await this.reportRepository.count({
      where: { status: ReportStatus.PENDING },
    });

    const topReported = await this.reportRepository
      .createQueryBuilder('report')
      .innerJoin('report.idiom', 'idiom')
      .select([
        'idiom.id AS id',
        'idiom.hanzi AS hanzi',
        'idiom.pinyin AS pinyin',
        'COUNT(report.id) AS totalreports',
      ])
      .groupBy('idiom.id, idiom.hanzi, idiom.pinyin')
      .orderBy('totalreports', 'DESC')
      .take(5)
      .getRawMany();

    return { pending, topReported };
  }

  async findOne(id: string) {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['user', 'idiom'],
    });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto) {
    const report = await this.findOne(id);
    Object.assign(report, updateReportDto);
    return await this.reportRepository.save(report);
  }

  async remove(id: string) {
    const report = await this.findOne(id);
    return await this.reportRepository.remove(report);
  }

  async bulkRemove(userId: string, ids: string[]) {
    if (!ids || ids.length === 0) return { success: true, deleted: 0 };
    await this.reportRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId AND id IN (:...ids)', {
        userId,
        ids,
      })
      .execute();
    return { success: true, deleted: ids.length };
  }
}
