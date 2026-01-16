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
import { UserEntity } from '../user/entities/user.entity';
import { createPaginatedResponse } from '../common/utils/pagination.util';

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
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  private async awardXP(userId: string, amount: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;

    user.xp += amount;
    // Simple level up logic: level = floor(sqrt(xp / 100)) + 1
    const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    await this.userRepository.save(user);
  }

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
      await this.awardXP(userId, 10); // 10 XP for saving an idiom
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

    const formattedData = saved.map((s) => s.idiom);
    return createPaginatedResponse(formattedData, total, page, limit);
  }

  async updateSRS(
    userId: string,
    idiomId: string,
    data: {
      quality?: number;
      interval?: number;
      repetition?: number;
      efactor?: number;
      nextReviewDate?: string;
    },
  ) {
    let progress = await this.srsRepository.findOne({
      where: { user: { id: userId }, idiom: { id: idiomId } },
    });

    if (!progress) {
      progress = this.srsRepository.create({
        user: { id: userId },
        idiom: { id: idiomId },
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: Date.now().toString(),
      });
    }

    if (data.quality !== undefined) {
      // SM-2 Algorithm Implementation
      const q = data.quality;
      let { interval, repetition, efactor } = progress;

      if (q >= 3) {
        if (repetition === 0) {
          // Special case: Easy (5) for new card jumps further
          interval = q === 5 ? 4 : 1;
        } else if (repetition === 1) {
          interval = 6;
        } else {
          interval = Math.ceil(interval * efactor);
        }
        repetition += 1;
      } else {
        repetition = 0;
        interval = 1;
      }

      efactor = efactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      if (efactor < 1.3) efactor = 1.3;

      // Quality < 3 (Again) uses 1-minute interval, otherwise use the calculated interval in days
      const intervalMs = q < 3 ? 60 * 1000 : interval * 24 * 60 * 60 * 1000;
      const nextReviewDate = Date.now() + intervalMs;

      Object.assign(progress, {
        interval,
        repetition,
        efactor,
        nextReviewDate: nextReviewDate.toString(),
      });
    } else {
      // Manual update (fallback)
      Object.assign(progress, {
        interval: data.interval ?? progress.interval,
        repetition: data.repetition ?? progress.repetition,
        efactor: data.efactor ?? progress.efactor,
        nextReviewDate: data.nextReviewDate ?? progress.nextReviewDate,
      });
    }

    const result = await this.srsRepository.save(progress);

    if (data.quality !== undefined && data.quality >= 3) {
      await this.awardXP(userId, 20);
    }

    return result;
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

    return createPaginatedResponse(progress, total, page, limit);
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

    const formattedHistory = history.map((h) => ({
      ...h.idiom,
      searchedAt: h.createdAt,
    }));
    return createPaginatedResponse(formattedHistory, total, page, limit);
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
