/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, DataSource } from 'typeorm';
import {
  CharacterAnalysisEntity,
  ExampleSentenceEntity,
  IdiomEntity,
} from './entities/idiom.entity';
import { GoogleGenAI, Type } from '@google/genai';
import { CreateIdiomDto } from './dto/create-idiom.dto';
import { SearchMode } from './idioms.controller';

@Injectable()
export class IdiomsService {
  private ai: GoogleGenAI;

  constructor(
    @InjectRepository(IdiomEntity)
    private readonly idiomRepository: Repository<IdiomEntity>,
    @InjectRepository(CharacterAnalysisEntity)
    private analysisRepository: Repository<CharacterAnalysisEntity>,
    @InjectRepository(ExampleSentenceEntity)
    private examplesRepository: Repository<ExampleSentenceEntity>,
    private dataSource: DataSource,
  ) {
    if (process.env.API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
      console.warn('API_KEY is not set in environment variables');
      // throw new Error('API_KEY is not set in environment variables');
    }
  }

  async getAdminStats() {
    try {
      const totalIdioms = await this.idiomRepository.count();

      // Thống kê theo cấp độ
      const levels = ['Sơ cấp', 'Trung cấp', 'Cao cấp'];
      const levelStats = await Promise.all(
        levels.map(async (level) => ({
          name: level,
          count: await this.idiomRepository.count({ where: { level } }),
        })),
      );

      // Thống kê theo loại
      const types = ['Quán dụng ngữ', 'Thành ngữ (Chengyu)', 'Tiếng lóng'];
      const typeStats = await Promise.all(
        types.map(async (type) => ({
          name: type,
          count: await this.idiomRepository.count({ where: { type } }),
        })),
      );

      // Lấy 5 từ vựng mới thêm gần nhất
      const recentIdioms = await this.idiomRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
        select: ['id', 'hanzi', 'pinyin', 'createdAt'],
      });

      return {
        totalIdioms,
        levelStats,
        typeStats,
        recentIdioms,
      };
    } catch (error) {
      throw new HttpException('Lỗi khi lấy dữ liệu thống kê.', 400);
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 12,
    filter: string = '',
    sort: string = 'createdAt',
    order: 'ASC' | 'DESC' = 'DESC',
  ) {
    const skip = (page - 1) * limit;
    const whereCondition = filter
      ? [
          { hanzi: ILike(`%${filter}%`) },
          { pinyin: ILike(`%${filter}%`) },
          { vietnameseMeaning: ILike(`%${filter}%`) },
        ]
      : {};

    try {
      const [data, total] = await this.idiomRepository.findAndCount({
        where: whereCondition,
        order: { [sort]: order },
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
      console.error('Database find error:', error);
      throw new HttpException('Lỗi khi truy xuất dữ liệu từ database.', 400);
    }
  }

  async findById(id: string) {
    const idiom = await this.idiomRepository.findOne({
      where: { id },
      relations: ['analysis', 'examples'],
    });
    if (!idiom) throw new HttpException('Không tìm thấy từ vựng.', 400);
    return idiom;
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
        return { ...dbIdiom, dataSource: 'database' };
      }
    }

    throw new HttpException('Không tìm thấy từ này trong thư viện.', 400);
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
      console.error('Update idiom error:', error);
      throw new HttpException('Lỗi khi cập nhật từ vựng.', 400);
    }
  }

  async remove(id: string) {
    const idiom = await this.findById(id);
    await this.idiomRepository.remove(idiom);
    return { success: true };
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
        console.error('Failed to parse JSON from AI', cleanJson);
        throw new Error('AI trả về dữ liệu không hợp lệ.');
      }
    } catch (err) {
      console.error('Chưa cấu hình mô hình AI');
      throw new HttpException('Chưa cấu hình mô hình AI', 400);
    }
  }
}
