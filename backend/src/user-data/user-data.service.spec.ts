import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDataService } from './user-data.service';
import {
  SavedIdiomEntity,
  SRSProgressEntity,
  HistoryEntity,
} from './entities/user-data.entity';
import { IdiomEntity } from '../idioms/entities/idiom.entity';
import { UserDataQueryDto } from './dto/user-data-query.dto';

describe('UserDataService', () => {
  let service: UserDataService;
  let savedRepository: Repository<SavedIdiomEntity>;
  let srsRepository: Repository<SRSProgressEntity>;
  let historyRepository: Repository<HistoryEntity>;
  let idiomRepository: Repository<IdiomEntity>;

  const mockSavedRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockSRSRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockHistoryRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockIdiomRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDataService,
        {
          provide: getRepositoryToken(SavedIdiomEntity),
          useValue: mockSavedRepository,
        },
        {
          provide: getRepositoryToken(SRSProgressEntity),
          useValue: mockSRSRepository,
        },
        {
          provide: getRepositoryToken(HistoryEntity),
          useValue: mockHistoryRepository,
        },
        {
          provide: getRepositoryToken(IdiomEntity),
          useValue: mockIdiomRepository,
        },
      ],
    }).compile();

    service = module.get<UserDataService>(UserDataService);
    savedRepository = module.get<Repository<SavedIdiomEntity>>(
      getRepositoryToken(SavedIdiomEntity),
    );
    srsRepository = module.get<Repository<SRSProgressEntity>>(
      getRepositoryToken(SRSProgressEntity),
    );
    historyRepository = module.get<Repository<HistoryEntity>>(
      getRepositoryToken(HistoryEntity),
    );
    idiomRepository = module.get<Repository<IdiomEntity>>(
      getRepositoryToken(IdiomEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('toggleSaveIdiom', () => {
    it('should save an idiom when not already saved', async () => {
      const userId = 'user-1';
      const idiomId = 'idiom-1';

      mockSavedRepository.findOne.mockResolvedValue(null);
      const newSaved = { user: { id: userId }, idiom: { id: idiomId } };
      mockSavedRepository.create.mockReturnValue(newSaved);
      mockSavedRepository.save.mockResolvedValue(newSaved);

      const result = await service.toggleSaveIdiom(userId, idiomId);

      expect(result).toEqual({ saved: true });
      expect(savedRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId }, idiom: { id: idiomId } },
      });
      expect(savedRepository.create).toHaveBeenCalledWith({
        user: { id: userId },
        idiom: { id: idiomId },
      });
      expect(savedRepository.save).toHaveBeenCalled();
    });

    it('should unsave an idiom when already saved', async () => {
      const userId = 'user-1';
      const idiomId = 'idiom-1';
      const existingSaved = {
        id: '1',
        user: { id: userId },
        idiom: { id: idiomId },
      };

      mockSavedRepository.findOne.mockResolvedValue(existingSaved);
      mockSavedRepository.remove.mockResolvedValue(existingSaved);

      const result = await service.toggleSaveIdiom(userId, idiomId);

      expect(result).toEqual({ saved: false });
      expect(savedRepository.remove).toHaveBeenCalledWith(existingSaved);
    });
  });

  describe('isSaved', () => {
    it('should return true when idiom is saved', async () => {
      const userId = 'user-1';
      const idiomId = 'idiom-1';

      mockSavedRepository.count.mockResolvedValue(1);

      const result = await service.isSaved(userId, idiomId);

      expect(result).toEqual({ isSaved: true });
      expect(savedRepository.count).toHaveBeenCalledWith({
        where: { user: { id: userId }, idiom: { id: idiomId } },
      });
    });

    it('should return false when idiom is not saved', async () => {
      const userId = 'user-1';
      const idiomId = 'idiom-1';

      mockSavedRepository.count.mockResolvedValue(0);

      const result = await service.isSaved(userId, idiomId);

      expect(result).toEqual({ isSaved: false });
    });
  });

  describe('getSavedIdioms', () => {
    it('should return paginated saved idioms', async () => {
      const userId = 'user-1';
      const query: UserDataQueryDto = {
        page: 1,
        limit: 12,
      };

      const mockSaved = [
        {
          id: '1',
          idiom: { id: 'idiom-1', hanzi: '一心一意', pinyin: 'yī xīn yī yì' },
        },
        {
          id: '2',
          idiom: { id: 'idiom-2', hanzi: '三心二意', pinyin: 'sān xīn èr yì' },
        },
      ];

      mockSavedRepository.findAndCount.mockResolvedValue([mockSaved, 2]);

      const result = await service.getSavedIdioms(userId, query);

      expect(result).toEqual({
        data: [mockSaved[0].idiom, mockSaved[1].idiom],
        meta: {
          total: 2,
          page: 1,
          limit: 12,
          lastPage: 1,
        },
      });
      expect(savedRepository.findAndCount).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['idiom'],
        order: { createdAt: 'DESC' },
        take: 12,
        skip: 0,
      });
    });

    it('should handle custom sorting', async () => {
      const userId = 'user-1';
      const query: UserDataQueryDto = {
        page: 1,
        limit: 12,
        sort: 'createdAt,ASC',
      };

      mockSavedRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.getSavedIdioms(userId, query);

      expect(savedRepository.findAndCount).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['idiom'],
        order: { createdAt: 'ASC' },
        take: 12,
        skip: 0,
      });
    });
  });

  describe('updateSRS', () => {
    it('should create new SRS progress when not exists', async () => {
      const userId = 'user-1';
      const idiomId = 'idiom-1';
      const data = {
        interval: 1,
        repetition: 1,
        efactor: 2.5,
        nextReviewDate: '2026-01-10',
      };

      mockSRSRepository.findOne.mockResolvedValue(null);
      const newProgress = { user: { id: userId }, idiom: { id: idiomId } };
      mockSRSRepository.create.mockReturnValue(newProgress);
      mockSRSRepository.save.mockResolvedValue({ ...newProgress, ...data });

      const result = await service.updateSRS(userId, idiomId, data);

      expect(result).toMatchObject(data);
      expect(srsRepository.create).toHaveBeenCalledWith({
        user: { id: userId },
        idiom: { id: idiomId },
      });
      expect(srsRepository.save).toHaveBeenCalled();
    });

    it('should update existing SRS progress', async () => {
      const userId = 'user-1';
      const idiomId = 'idiom-1';
      const existingProgress = {
        id: '1',
        user: { id: userId },
        idiom: { id: idiomId },
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: '2026-01-08',
      };

      const updateData = {
        interval: 2,
        repetition: 2,
        efactor: 2.6,
        nextReviewDate: '2026-01-12',
      };

      mockSRSRepository.findOne.mockResolvedValue(existingProgress);
      mockSRSRepository.save.mockResolvedValue({
        ...existingProgress,
        ...updateData,
      });

      const result = await service.updateSRS(userId, idiomId, updateData);

      expect(result).toMatchObject(updateData);
      expect(srsRepository.save).toHaveBeenCalled();
    });
  });

  describe('getSRSData', () => {
    it('should return paginated SRS data', async () => {
      const userId = 'user-1';
      const query: UserDataQueryDto = {
        page: 1,
        limit: 50,
      };

      const mockProgress = [
        {
          id: '1',
          interval: 1,
          repetition: 1,
          efactor: 2.5,
          nextReviewDate: '2026-01-10',
          idiom: { id: 'idiom-1', hanzi: '一心一意' },
        },
      ];

      mockSRSRepository.findAndCount.mockResolvedValue([mockProgress, 1]);

      const result = await service.getSRSData(userId, query);

      expect(result).toEqual({
        data: mockProgress,
        meta: {
          total: 1,
          page: 1,
          limit: 50,
          lastPage: 1,
        },
      });
      expect(srsRepository.findAndCount).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['idiom'],
        order: { createdAt: 'DESC' },
        take: 50,
        skip: 0,
      });
    });
  });

  describe('addToHistory', () => {
    it('should create new history entry when not exists', async () => {
      const userId = 'user-1';
      const idiomId = 'idiom-1';

      const mockIdiom = { id: idiomId, hanzi: '一心一意' };
      mockIdiomRepository.findOne.mockResolvedValue(mockIdiom);
      mockHistoryRepository.findOne.mockResolvedValue(null);

      const newHistory = {
        user: { id: userId },
        idiom: { id: idiomId },
      };
      mockHistoryRepository.create.mockReturnValue(newHistory);
      mockHistoryRepository.save.mockResolvedValue({
        id: '1',
        ...newHistory,
      });

      const result = await service.addToHistory(userId, idiomId);

      expect(result).toMatchObject({ id: '1' });
      expect(historyRepository.create).toHaveBeenCalledWith({
        user: { id: userId },
        idiom: { id: idiomId },
      });
      expect(historyRepository.save).toHaveBeenCalled();
    });

    it('should update existing history entry', async () => {
      const userId = 'user-1';
      const idiomId = 'idiom-1';

      const mockIdiom = { id: idiomId, hanzi: '一心一意' };
      const existingHistory = {
        id: '1',
        user: { id: userId },
        idiom: { id: idiomId },
        createdAt: new Date('2026-01-01'),
      };

      mockIdiomRepository.findOne.mockResolvedValue(mockIdiom);
      mockHistoryRepository.findOne.mockResolvedValue(existingHistory);
      mockHistoryRepository.save.mockResolvedValue({
        ...existingHistory,
        createdAt: expect.any(Date),
      });

      const result = await service.addToHistory(userId, idiomId);

      expect(result?.createdAt).toBeDefined();
      expect(historyRepository.save).toHaveBeenCalled();
    });

    it('should return undefined when idiom not found', async () => {
      const userId = 'user-1';
      const idiomId = 'non-existent';

      mockIdiomRepository.findOne.mockResolvedValue(null);

      const result = await service.addToHistory(userId, idiomId);

      expect(result).toBeUndefined();
      expect(historyRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('should return paginated history', async () => {
      const userId = 'user-1';
      const query: UserDataQueryDto = {
        page: 1,
        limit: 20,
      };

      const mockHistory = [
        {
          id: '1',
          idiom: { id: 'idiom-1', hanzi: '一心一意', pinyin: 'yī xīn yī yì' },
        },
        {
          id: '2',
          idiom: { id: 'idiom-2', hanzi: '三心二意', pinyin: 'sān xīn èr yì' },
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockHistory, 2]),
      };

      mockHistoryRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getHistory(userId, query);

      expect(result).toEqual({
        data: [mockHistory[0].idiom, mockHistory[1].idiom],
        meta: {
          total: 2,
          page: 1,
          limit: 20,
          lastPage: 1,
        },
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'history.user.id = :userId',
        { userId },
      );
    });

    it('should filter history by search term', async () => {
      const userId = 'user-1';
      const query: UserDataQueryDto = {
        page: 1,
        limit: 20,
        search: '一心',
      };

      const mockHistory = [
        {
          id: '1',
          idiom: { id: 'idiom-1', hanzi: '一心一意', pinyin: 'yī xīn yī yì' },
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockHistory, 1]),
      };

      mockHistoryRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getHistory(userId, query);

      expect(result.data).toHaveLength(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(idiom.hanzi ILike :search OR idiom.pinyin ILike :search OR idiom.vietnameseMeaning ILike :search)',
        { search: '%一心%' },
      );
    });
  });

  describe('clearHistory', () => {
    it('should delete all user history', async () => {
      const userId = 'user-1';
      mockHistoryRepository.delete.mockResolvedValue({ affected: 5 });

      const result = await service.clearHistory(userId);

      expect(result).toEqual({ success: true });
      expect(historyRepository.delete).toHaveBeenCalledWith({
        user: { id: userId },
      });
    });
  });

  describe('bulkRemoveSaved', () => {
    it('should delete multiple saved idioms', async () => {
      const userId = 'user-1';
      const idiomIds = ['idiom-1', 'idiom-2', 'idiom-3'];

      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 3 }),
      };

      mockSavedRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.bulkRemoveSaved(userId, idiomIds);

      expect(result).toEqual({ success: true, deleted: 3 });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'userId = :userId AND idiomId IN (:...idiomIds)',
        { userId, idiomIds },
      );
    });

    it('should handle empty array', async () => {
      const userId = 'user-1';
      const idiomIds: string[] = [];

      const result = await service.bulkRemoveSaved(userId, idiomIds);

      expect(result).toEqual({ success: true, deleted: 0 });
      expect(savedRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('bulkRemoveHistory', () => {
    it('should delete multiple history items', async () => {
      const userId = 'user-1';
      const idiomIds = ['idiom-1', 'idiom-2'];

      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 2 }),
      };

      mockHistoryRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.bulkRemoveHistory(userId, idiomIds);

      expect(result).toEqual({ success: true, deleted: 2 });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'userId = :userId AND idiomId IN (:...idiomIds)',
        { userId, idiomIds },
      );
    });

    it('should handle empty array', async () => {
      const userId = 'user-1';
      const idiomIds: string[] = [];

      const result = await service.bulkRemoveHistory(userId, idiomIds);

      expect(result).toEqual({ success: true, deleted: 0 });
      expect(historyRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });
});
