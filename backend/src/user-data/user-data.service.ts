import { Injectable } from '@nestjs/common';
import { UserDataQueryDto } from './dto/user-data-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SavedIdiomEntity,
  SRSProgressEntity,
  HistoryEntity,
} from './entities/user-data.entity';
import { IdiomEntity } from '../idioms/entities/idiom.entity';

@Injectable()
export class UserDataService {
  constructor(
    @InjectRepository(SavedIdiomEntity)
    private savedRepository: Repository<SavedIdiomEntity>,
    @InjectRepository(SRSProgressEntity)
    private srsRepository: Repository<SRSProgressEntity>,
    @InjectRepository(HistoryEntity)
    private historyRepository: Repository<HistoryEntity>,
    @InjectRepository(IdiomEntity)
    private idiomRepository: Repository<IdiomEntity>,
  ) {}

  async toggleSaveIdiom(userId: string, idiomId: string) {
    const existing = await this.savedRepository.findOne({
      where: { user: { id: userId }, idiom: { id: idiomId } },
    });

    if (existing) {
      await this.savedRepository.remove(existing);
      return { saved: false };
    } else {
      const saved = this.savedRepository.create({
        user: { id: userId },
        idiom: { id: idiomId },
      });
      await this.savedRepository.save(saved);
      return { saved: true };
    }
  }

  async isSaved(userId: string, idiomId: string) {
    const count = await this.savedRepository.count({
      where: { user: { id: userId }, idiom: { id: idiomId } },
    });
    return { isSaved: count > 0 };
  }

  async getSavedIdioms(userId: string, query: UserDataQueryDto) {
    const { page = 1, limit = 12, sort = 'createdAt,DESC' } = query;
    const skip = (page - 1) * limit;

    const [sortField, sortOrder] = sort.split(',');
    const order = (sortOrder?.toUpperCase() as 'ASC' | 'DESC') || 'DESC';

    const [saved, total] = await this.savedRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['idiom'],
      order: { [sortField]: order },
      take: limit,
      skip: skip,
    });

    return {
      data: saved.map((s) => s.idiom),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit) || 1,
      },
    };
  }

  async updateSRS(userId: string, idiomId: string, data: any) {
    let progress = await this.srsRepository.findOne({
      where: { user: { id: userId }, idiom: { id: idiomId } },
    });

    if (!progress) {
      progress = this.srsRepository.create({
        user: { id: userId },
        idiom: { id: idiomId },
      });
    }

    Object.assign(progress, {
      interval: data.interval,
      repetition: data.repetition,
      efactor: data.efactor,
      nextReviewDate: String(data.nextReviewDate),
    });

    return this.srsRepository.save(progress);
  }

  async getSRSData(userId: string, query: UserDataQueryDto) {
    const { page = 1, limit = 50, sort = 'createdAt,DESC' } = query;
    const skip = (page - 1) * limit;

    const [sortField, sortOrder] = sort.split(',');
    const order = (sortOrder?.toUpperCase() as 'ASC' | 'DESC') || 'DESC';

    const [progress, total] = await this.srsRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['idiom'],
      order: { [sortField]: order },
      take: limit,
      skip: skip,
    });

    return {
      data: progress,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit) || 1,
      },
    };
  }

  async addToHistory(userId: string, idiomId: string) {
    const idiom = await this.idiomRepository.findOne({
      where: { id: idiomId },
    });
    if (!idiom) return;

    // Kiểm tra xem từ này đã có trong lịch sử của user này chưa
    const existing = await this.historyRepository.findOne({
      where: { user: { id: userId }, idiom: { id: idiomId } },
    });

    if (existing) {
      // Nếu đã tồn tại, cập nhật thời gian để đẩy lên đầu list (nếu cần)
      // hoặc chỉ đơn giản là không tạo thêm bản ghi mới.
      existing.createdAt = new Date();
      return this.historyRepository.save(existing);
    }

    const history = this.historyRepository.create({
      user: { id: userId },
      idiom: { id: idiomId },
    });
    return this.historyRepository.save(history);
  }

  async getHistory(userId: string, query: UserDataQueryDto) {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt,DESC',
      search = '',
    } = query;
    const skip = (page - 1) * limit;
    const [sortField, sortOrder] = sort.split(',');
    const order = (sortOrder?.toUpperCase() as 'ASC' | 'DESC') || 'DESC';

    const queryBuilder = this.historyRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.idiom', 'idiom')
      .where('history.user.id = :userId', { userId });

    if (search) {
      const normalized = `%${search.toLowerCase().trim()}%`;
      queryBuilder.andWhere(
        '(idiom.hanzi ILike :search OR idiom.pinyin ILike :search OR idiom.vietnameseMeaning ILike :search)',
        { search: normalized },
      );
    }

    const [history, total] = await queryBuilder
      .orderBy(`history.${sortField}`, order)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: history.map((h) => h.idiom),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit) || 1,
      },
    };
  }

  async clearHistory(userId: string) {
    await this.historyRepository.delete({ user: { id: userId } });
    return { success: true };
  }

  async bulkRemoveSaved(userId: string, idiomIds: string[]) {
    if (!idiomIds || idiomIds.length === 0)
      return { success: true, deleted: 0 };
    await this.savedRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId AND idiomId IN (:...idiomIds)', {
        userId,
        idiomIds,
      })
      .execute();
    return { success: true, deleted: idiomIds.length };
  }

  async bulkRemoveHistory(userId: string, idiomIds: string[]) {
    if (!idiomIds || idiomIds.length === 0)
      return { success: true, deleted: 0 };
    await this.historyRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId AND idiomId IN (:...idiomIds)', {
        userId,
        idiomIds,
      })
      .execute();
    return { success: true, deleted: idiomIds.length };
  }
}
