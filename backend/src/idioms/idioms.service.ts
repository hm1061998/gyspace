/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, HttpException, Logger, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, DataSource } from 'typeorm';
import {
  CharacterAnalysisEntity,
  ExampleSentenceEntity,
  IdiomEntity,
} from './entities/idiom.entity';
import { SearchLogEntity } from './entities/search-log.entity';
import { GoogleGenAI, Type } from '@google/genai';
import { CreateIdiomDto } from './dto/create-idiom.dto';
import { IdiomQueryDto, SearchLogQueryDto } from './dto/idiom-query.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { SearchMode } from './idioms.controller';

@Injectable()
export class IdiomsService {
  private readonly logger = new Logger(IdiomsService.name);
  private ai: GoogleGenAI;
  private dailyCache: { date: string; data: any[] } | null = null;

  constructor(
    @InjectRepository(IdiomEntity)
    private readonly idiomRepository: Repository<IdiomEntity>,
    @InjectRepository(CharacterAnalysisEntity)
    private analysisRepository: Repository<CharacterAnalysisEntity>,
    @InjectRepository(ExampleSentenceEntity)
    private examplesRepository: Repository<ExampleSentenceEntity>,
    @InjectRepository(SearchLogEntity)
    private searchLogRepository: Repository<SearchLogEntity>,
    private dataSource: DataSource,
  ) {
    if (process.env.API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  }

  async getAdminStats() {
    try {
      const totalIdioms = await this.idiomRepository.count();

      // 1. Thống kê theo cấp độ (1 query Duy nhất)
      const levelResults = await this.idiomRepository
        .createQueryBuilder('idiom')
        .select('idiom.level', 'name')
        .addSelect('COUNT(*)', 'count')
        .groupBy('idiom.level')
        .getRawMany();

      const levelStats = levelResults.map((r) => ({
        name: r.name || 'Chưa phân loại',
        count: parseInt(r.count),
      }));

      // 2. Thống kê theo loại (1 query Duy nhất)
      const typeResults = await this.idiomRepository
        .createQueryBuilder('idiom')
        .select('idiom.type', 'name')
        .addSelect('COUNT(*)', 'count')
        .groupBy('idiom.type')
        .getRawMany();

      const typeStats = typeResults.map((r) => ({
        name: r.name || 'Chưa phân loại',
        count: parseInt(r.count),
      }));

      // 3. Lấy 5 từ vựng mới thêm gần nhất
      const recentIdioms = await this.idiomRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
        select: ['id', 'hanzi', 'pinyin', 'createdAt'],
      });

      // 4. Tìm từ khóa HOT (tìm kiếm thất bại nhiều nhất)
      const hotKeywords = await this.searchLogRepository
        .createQueryBuilder('log')
        .select('log.query', 'query')
        .addSelect('COUNT(log.id)', 'count')
        .where('log.found = :found', { found: false })
        .groupBy('log.query')
        .orderBy('count', 'DESC')
        .take(10)
        .getRawMany();

      return {
        totalIdioms,
        levelStats,
        typeStats,
        recentIdioms,
        hotKeywords,
      };
    } catch (error) {
      this.logger.error('Error getting admin stats:', error);
      throw new HttpException(
        'Lỗi khi lấy dữ liệu thống kê.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getSearchLogs(query: SearchLogQueryDto) {
    const {
      page = 1,
      limit = 20,
      filter = '',
      sort = 'lastsearched,DESC',
    } = query;
    const skip = (page - 1) * limit;

    let search = filter;
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (filter && typeof filter === 'string' && filter.trim().startsWith('{')) {
      try {
        const parsedFilter = JSON.parse(filter);
        search = parsedFilter.search || '';
        startDate = parsedFilter.startDate;
        endDate = parsedFilter.endDate;
      } catch (e) {
        // Fallback
      }
    }

    const queryBuilder = this.searchLogRepository
      .createQueryBuilder('log')
      .select('log.query', 'query')
      .addSelect('COUNT(log.id)', 'count')
      .addSelect('MAX(log.createdAt)', 'lastsearched')
      .where('log.found = :found', { found: false });

    if (search) {
      queryBuilder.andWhere('log.query ILike :search', {
        search: `%${search}%`,
      });
    }

    if (startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      // Add 1 day to include the end date fully
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      queryBuilder.andWhere('log.createdAt < :endDate', {
        endDate: end.toISOString().split('T')[0],
      });
    }

    // Since we are grouping, we need a way to count distinct groups for pagination
    // TypeORM's getRawMany doesn't give total count easily with grouping + pagination
    // So we first get all distinct queries count
    const countQuery = this.searchLogRepository
      .createQueryBuilder('log')
      .select('COUNT(DISTINCT log.query)', 'total')
      .where('log.found = :found', { found: false });

    if (search) {
      countQuery.andWhere('log.query ILike :search', { search: `%${search}%` });
    }

    if (startDate) {
      countQuery.andWhere('log.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      countQuery.andWhere('log.createdAt < :endDate', {
        endDate: end.toISOString().split('T')[0],
      });
    }

    const countResult = await countQuery.getRawOne();
    const total = parseInt(countResult?.total || '0');

    const [sortField, sortOrder] = sort.split(',');
    const order = (sortOrder?.toUpperCase() as 'ASC' | 'DESC') || 'DESC';

    const data = await queryBuilder
      .groupBy('log.query')
      .orderBy(sortField, order)
      .offset(skip)
      .limit(limit)
      .getRawMany();

    return {
      data: data.map((item) => ({
        query: item.query,
        count: parseInt(item.count),
        lastSearched: item.lastsearched,
      })),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit) || 1,
      },
    };
  }

  async deleteSearchLog(query: string) {
    await this.searchLogRepository.delete({ query });
    return { success: true };
  }

  async bulkDeleteSearchLogs(queries: string[]) {
    if (!queries || queries.length === 0) {
      throw new HttpException('Danh sách trống', HttpStatus.BAD_REQUEST);
    }
    await this.searchLogRepository
      .createQueryBuilder()
      .delete()
      .where('query IN (:...queries)', { queries })
      .execute();
    return { success: true, deleted: queries.length };
  }

  async findAll(queryParams: IdiomQueryDto) {
    const {
      page = 1,
      limit = 12,
      search = '',
      filter = '',
      sort = 'createdAt,DESC',
    } = queryParams;
    const skip = (page - 1) * limit;

    let searchKeyword = search;
    let filterLevel: string | undefined = undefined;
    let filterType: string | undefined = undefined;

    // Handle combined sort parameter (e.g., "createdAt,DESC")
    const [sortField, sortOrder] = sort.split(',');
    const order = (sortOrder?.toUpperCase() as 'ASC' | 'DESC') || 'DESC';

    // ... (rest of filtering logic)
    // Try to parse filter as JSON if it looks like an object (holds level/type)
    if (filter && typeof filter === 'string' && filter.trim().startsWith('{')) {
      try {
        const parsedFilter = JSON.parse(filter);
        searchKeyword = searchKeyword || parsedFilter.keyword || '';
        filterLevel = parsedFilter.level || undefined;
        filterType = parsedFilter.type || undefined;
      } catch (e) {
        if (!searchKeyword) searchKeyword = filter;
      }
    } else if (filter && !searchKeyword) {
      searchKeyword = filter;
    }

    const query: any = {};
    if (filterLevel) query.level = filterLevel;
    if (filterType) query.type = filterType;

    const whereCondition = searchKeyword
      ? [
          { ...query, hanzi: ILike(`%${searchKeyword}%`) },
          { ...query, pinyin: ILike(`%${searchKeyword}%`) },
          { ...query, vietnameseMeaning: ILike(`%${searchKeyword}%`) },
        ]
      : query;

    try {
      const [data, total] = await this.idiomRepository.findAndCount({
        where: whereCondition,
        order: { [sortField]: order },
        select: [
          'id',
          'hanzi',
          'pinyin',
          'vietnameseMeaning',
          'type',
          'level',
          'source',
          'createdAt',
        ],
        take: limit,
        skip: skip,
      });

      return {
        data: data || [],
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit) || 1,
        },
      };
    } catch (error) {
      this.logger.error('Database find error:', error);
      throw new HttpException(
        'Lỗi khi truy xuất dữ liệu từ database.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findById(id: string) {
    const idiom = await this.idiomRepository.findOne({
      where: { id },
      relations: ['analysis', 'examples'],
    });
    if (!idiom)
      throw new HttpException(
        'Không tìm thấy từ vựng.',
        HttpStatus.BAD_REQUEST,
      );
    return idiom;
  }

  async fetchSuggestions(query: PaginationQueryDto) {
    const { page = 1, limit = 8, search = '' } = query;
    const skip = (page - 1) * limit;

    if (!search || search.trim().length < 1) {
      // Return most recent idioms if no query
      const [data, total] = await this.idiomRepository.findAndCount({
        order: { createdAt: 'DESC' },
        select: ['id', 'hanzi', 'pinyin', 'vietnameseMeaning'],
        take: limit,
        skip: skip,
      });

      return {
        data,
        meta: {
          page,
          limit,
          total,
          lastPage: Math.ceil(total / limit) || 1,
          hasMore: skip + limit < total,
        },
      };
    }

    const normalizedQuery = search.toLowerCase().trim();

    const [data, total] = await this.idiomRepository.findAndCount({
      where: [
        { hanzi: ILike(`${normalizedQuery}%`) },
        { pinyin: ILike(`${normalizedQuery}%`) },
        { vietnameseMeaning: ILike(`%${normalizedQuery}%`) },
      ],
      select: ['id', 'hanzi', 'pinyin', 'vietnameseMeaning'],
      take: limit,
      skip: skip,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        lastPage: Math.ceil(total / limit) || 1,
        hasMore: skip + limit < total,
      },
    };
  }

  async getDailySuggestions() {
    const todayStr = new Date().toISOString().split('T')[0];
    if (this.dailyCache && this.dailyCache.date === todayStr) {
      return this.dailyCache.data;
    }

    try {
      // 1. Get popular successful searches
      const trends = await this.searchLogRepository
        .createQueryBuilder('log')
        .select('log.query', 'hanzi')
        .addSelect('COUNT(log.id)', 'count')
        .where('log.found = :found', { found: true })
        .groupBy('log.query')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();

      const trendHanzi = trends.map((t) => t.hanzi);

      let dailyIdioms: IdiomEntity[] = [];

      if (trendHanzi.length > 0) {
        dailyIdioms = await this.idiomRepository.find({
          where: trendHanzi.map((h) => ({ hanzi: h })),
          take: 4,
        });
      }

      // 2. Fill with random if not enough
      if (dailyIdioms.length < 4) {
        const needed = 4 - dailyIdioms.length;
        const currentIds = dailyIdioms.map((i) => i.id);

        let query = this.idiomRepository.createQueryBuilder('idiom');
        if (currentIds.length > 0) {
          query = query.where('idiom.id NOT IN (:...ids)', { ids: currentIds });
        }

        const randoms = await query.orderBy('RANDOM()').take(needed).getMany();
        dailyIdioms = [...dailyIdioms, ...randoms];
      }

      // Filter distinct just in case
      const seen = new Set();
      const distinct = dailyIdioms.filter((i) => {
        const duplicate = seen.has(i.hanzi);
        seen.add(i.hanzi);
        return !duplicate;
      });

      const result = distinct.slice(0, 4).map((i) => ({
        id: i.id,
        hanzi: i.hanzi,
        pinyin: i.pinyin,
        vietnameseMeaning: i.vietnameseMeaning,
      }));

      this.dailyCache = { date: todayStr, data: result };
      return result;
    } catch (error) {
      this.logger.error('Failed to get daily suggestions', error);
      // Fallback (no cache for failed attempts)
      return (await this.idiomRepository.find({ take: 4 })).map((i) => ({
        id: i.id,
        hanzi: i.hanzi,
        pinyin: i.pinyin,
        vietnameseMeaning: i.vietnameseMeaning,
      }));
    }
  }

  async search(query: string, mode: SearchMode) {
    if (mode === 'ai') {
      return this.callGeminiAI(query);
    } else {
      const normalizedQuery = query.toLowerCase().trim();

      const dbIdiom = await this.idiomRepository.findOne({
        where: [
          { hanzi: normalizedQuery },
          { pinyin: ILike(`%${normalizedQuery}%`) },
          { vietnameseMeaning: ILike(`%${normalizedQuery}%`) },
        ],
        relations: ['analysis', 'examples'],
      });

      if (dbIdiom) {
        // Log thành công
        await this.searchLogRepository.save({
          query: normalizedQuery,
          found: true,
          mode: 'database',
        });
        return { ...dbIdiom, dataSource: 'database' };
      }

      // Log thất bại
      await this.searchLogRepository.save({
        query: normalizedQuery,
        found: false,
        mode: 'database',
      });
    }

    throw new HttpException(
      'Không tìm thấy từ này trong thư viện.',
      HttpStatus.BAD_REQUEST,
    );
  }

  async create(createIdiomDto: CreateIdiomDto) {
    const existing = await this.idiomRepository.findOne({
      where: { hanzi: createIdiomDto.hanzi },
      relations: ['analysis', 'examples'],
    });

    if (existing) {
      this.idiomRepository.merge(existing, createIdiomDto);
      return await this.idiomRepository.save(existing);
    }
    const newIdiom = this.idiomRepository.create(createIdiomDto);
    return await this.idiomRepository.save(newIdiom);
  }

  async bulkCreate(idioms: CreateIdiomDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const results: IdiomEntity[] = [];
      for (const dto of idioms) {
        let idiom = await queryRunner.manager.findOne(IdiomEntity, {
          where: { hanzi: dto.hanzi },
        });
        if (idiom) {
          queryRunner.manager.merge(IdiomEntity, idiom, dto);
        } else {
          idiom = queryRunner.manager.create(IdiomEntity, dto);
        }

        await queryRunner.manager.save(idiom);
        results.push(idiom);
      }
      await queryRunner.commitTransaction();
      return results;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, updateIdiomDto: CreateIdiomDto) {
    // 1. Tìm bản ghi hiện tại kèm các quan hệ
    const idiom = await this.findById(id);

    const { analysis, examples, ...basicData } = updateIdiomDto;

    // 2. Cập nhật các trường thông tin cơ bản
    Object.assign(idiom, basicData);

    // 3. Cập nhật mảng quan hệ
    // Nhờ orphanedRowAction: 'delete' trong Entity, việc gán mảng mới sẽ kích hoạt xóa bản ghi cũ
    if (analysis !== undefined) {
      idiom.analysis = analysis.map((a) => this.analysisRepository.create(a));
    }

    if (examples !== undefined) {
      idiom.examples = examples.map((e) => this.examplesRepository.create(e));
    }

    try {
      // 4. Lưu lại toàn bộ entity. TypeORM sẽ tự động handle transaction cho cascade
      return await this.idiomRepository.save(idiom);
    } catch (error) {
      this.logger.error('Update idiom error:', error);
      throw new HttpException(
        'Lỗi khi cập nhật từ vựng.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    const idiom = await this.findById(id);
    await this.idiomRepository.remove(idiom);
    return { success: true };
  }

  async bulkDelete(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new HttpException('Danh sách trống', HttpStatus.BAD_REQUEST);
    }
    await this.idiomRepository.delete(ids);
    return { success: true, deleted: ids.length };
  }

  private async callGeminiAI(query: string) {
    const schema = {
      type: Type.OBJECT,
      properties: {
        hanzi: { type: Type.STRING },
        pinyin: { type: Type.STRING },
        type: { type: Type.STRING },
        level: { type: Type.STRING },
        source: { type: Type.STRING },
        vietnameseMeaning: { type: Type.STRING },
        literalMeaning: { type: Type.STRING },
        figurativeMeaning: { type: Type.STRING },
        chineseDefinition: { type: Type.STRING },
        origin: { type: Type.STRING },
        grammar: { type: Type.STRING },
        analysis: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              character: { type: Type.STRING },
              pinyin: { type: Type.STRING },
              meaning: { type: Type.STRING },
            },
          },
        },
        examples: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              chinese: { type: Type.STRING },
              pinyin: { type: Type.STRING },
              vietnamese: { type: Type.STRING },
            },
          },
        },
      },
    };

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Phân tích chuyên sâu quán dụng ngữ/thành ngữ tiếng Trung: "${query}". Trả về kết quả JSON theo schema hỗ trợ người Việt học tập.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const text = response.text || '{}';
      // Loại bỏ markdown code block nếu AI lỡ thêm vào (dù đã set json mode)
      const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();

      try {
        const data = JSON.parse(cleanJson);
        return { ...data, dataSource: 'ai' };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        this.logger.error('Failed to parse JSON from AI', cleanJson);
        throw new Error('AI trả về dữ liệu không hợp lệ.');
      }
    } catch (err) {
      this.logger.error('AI Model error or not configured', err);
      throw new HttpException(
        'Chưa cấu hình mô hình AI',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
