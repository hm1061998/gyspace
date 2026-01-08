import { Test, TestingModule } from '@nestjs/testing';
import { IdiomsController } from './idioms.controller';
import { IdiomsService } from './idioms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { IdiomQueryDto, SearchLogQueryDto } from './dto/idiom-query.dto';
import { CreateIdiomDto } from './dto/create-idiom.dto';
import { BadRequestException } from '@nestjs/common';

describe('IdiomsController', () => {
  let controller: IdiomsController;
  let service: IdiomsService;

  const mockIdiomsService = {
    getAdminStats: jest.fn(),
    getSearchLogs: jest.fn(),
    deleteSearchLog: jest.fn(),
    bulkDeleteSearchLogs: jest.fn(),
    findAll: jest.fn(),
    fetchSuggestions: jest.fn(),
    getDailySuggestions: jest.fn(),
    search: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    bulkDelete: jest.fn(),
    bulkCreate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdiomsController],
      providers: [
        {
          provide: IdiomsService,
          useValue: mockIdiomsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<IdiomsController>(IdiomsController);
    service = module.get<IdiomsService>(IdiomsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAdminStats', () => {
    it('should return admin statistics', async () => {
      const mockStats = {
        totalIdioms: 1000,
        totalSearches: 5000,
        recentSearches: 150,
      };

      mockIdiomsService.getAdminStats.mockResolvedValue(mockStats);

      const result = await controller.getAdminStats();

      expect(result).toEqual(mockStats);
      expect(service.getAdminStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSearchLogs', () => {
    it('should return paginated search logs', async () => {
      const query: SearchLogQueryDto = {
        page: 1,
        limit: 20,
      };

      const mockLogs = {
        data: [
          { query: '成语', count: 50, lastSearched: new Date() },
          { query: '谚语', count: 30, lastSearched: new Date() },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 20,
          lastPage: 1,
        },
      };

      mockIdiomsService.getSearchLogs.mockResolvedValue(mockLogs);

      const result = await controller.getSearchLogs(query);

      expect(result).toEqual(mockLogs);
      expect(service.getSearchLogs).toHaveBeenCalledWith(query);
    });
  });

  describe('deleteSearchLog', () => {
    it('should delete a search log by query', async () => {
      const query = '成语';
      const mockResult = { affected: 1 };

      mockIdiomsService.deleteSearchLog.mockResolvedValue(mockResult);

      const result = await controller.deleteSearchLog(query);

      expect(result).toEqual(mockResult);
      expect(service.deleteSearchLog).toHaveBeenCalledWith(query);
    });
  });

  describe('bulkDeleteSearchLogs', () => {
    it('should delete multiple search logs', async () => {
      const queries = ['成语', '谚语', '俗语'];
      const mockResult = { affected: 3 };

      mockIdiomsService.bulkDeleteSearchLogs.mockResolvedValue(mockResult);

      const result = await controller.bulkDeleteSearchLogs({ queries });

      expect(result).toEqual(mockResult);
      expect(service.bulkDeleteSearchLogs).toHaveBeenCalledWith(queries);
    });
  });

  describe('findAll', () => {
    it('should return paginated idioms', async () => {
      const query: IdiomQueryDto = {
        page: 1,
        limit: 20,
      };

      const mockResponse = {
        data: [
          {
            id: '1',
            hanzi: '一心一意',
            pinyin: 'yī xīn yī yì',
            meaning: 'wholeheartedly',
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          lastPage: 1,
        },
      };

      mockIdiomsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter idioms by search term', async () => {
      const query: IdiomQueryDto = {
        page: 1,
        limit: 20,
        search: '一心',
      };

      const mockResponse = {
        data: [
          {
            id: '1',
            hanzi: '一心一意',
            pinyin: 'yī xīn yī yì',
            meaning: 'wholeheartedly',
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          lastPage: 1,
        },
      };

      mockIdiomsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getSuggestions', () => {
    it('should return suggested idioms', async () => {
      const query = { page: 1, limit: 10 };
      const mockSuggestions = {
        data: [
          { id: '1', hanzi: '一心一意', pinyin: 'yī xīn yī yì' },
          { id: '2', hanzi: '三心二意', pinyin: 'sān xīn èr yì' },
        ],
        meta: { total: 2, page: 1, limit: 10, lastPage: 1 },
      };

      mockIdiomsService.fetchSuggestions.mockResolvedValue(mockSuggestions);

      const result = await controller.getSuggestions(query);

      expect(result).toEqual(mockSuggestions);
      expect(service.fetchSuggestions).toHaveBeenCalledWith(query);
    });
  });

  describe('getDailySuggestions', () => {
    it('should return daily suggested idioms', async () => {
      const mockDailySuggestions = [
        { id: '1', hanzi: '一心一意', pinyin: 'yī xīn yī yì' },
        { id: '2', hanzi: '三心二意', pinyin: 'sān xīn èr yì' },
      ];

      mockIdiomsService.getDailySuggestions.mockResolvedValue(
        mockDailySuggestions,
      );

      const result = await controller.getDailySuggestions();

      expect(result).toEqual(mockDailySuggestions);
      expect(service.getDailySuggestions).toHaveBeenCalledTimes(1);
    });
  });

  describe('search', () => {
    it('should search idioms in database mode', async () => {
      const query = '一心';
      const mode = 'database' as const;

      const mockResults = [
        { id: '1', hanzi: '一心一意', pinyin: 'yī xīn yī yì' },
      ];

      mockIdiomsService.search.mockResolvedValue(mockResults);

      const result = await controller.search(query, mode);

      expect(result).toEqual(mockResults);
      expect(service.search).toHaveBeenCalledWith(query, mode);
    });

    it('should search idioms in AI mode', async () => {
      const query = '一心';
      const mode = 'ai' as const;

      const mockResults = {
        idiom: '一心一意',
        explanation: 'AI generated explanation',
      };

      mockIdiomsService.search.mockResolvedValue(mockResults);

      const result = await controller.search(query, mode);

      expect(result).toEqual(mockResults);
      expect(service.search).toHaveBeenCalledWith(query, mode);
    });
  });

  describe('findById', () => {
    it('should return an idiom by id', async () => {
      const id = '1';
      const mockIdiom = {
        id: '1',
        hanzi: '一心一意',
        pinyin: 'yī xīn yī yì',
        meaning: 'wholeheartedly',
      };

      mockIdiomsService.findById.mockResolvedValue(mockIdiom);

      const result = await controller.findById(id);

      expect(result).toEqual(mockIdiom);
      expect(service.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('create', () => {
    it('should create a new idiom', async () => {
      const createDto: CreateIdiomDto = {
        hanzi: '一心一意',
        pinyin: 'yī xīn yī yì',
        meaning: 'wholeheartedly',
        example: 'Example sentence',
      };

      const mockCreatedIdiom = { id: '1', ...createDto };

      mockIdiomsService.create.mockResolvedValue(mockCreatedIdiom);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockCreatedIdiom);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update an existing idiom', async () => {
      const id = '1';
      const updateDto: CreateIdiomDto = {
        hanzi: '一心一意',
        pinyin: 'yī xīn yī yì',
        meaning: 'Updated meaning',
        example: 'Updated example',
      };

      const mockUpdatedIdiom = { id, ...updateDto };

      mockIdiomsService.update.mockResolvedValue(mockUpdatedIdiom);

      const result = await controller.update(id, updateDto);

      expect(result).toEqual(mockUpdatedIdiom);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete an idiom', async () => {
      const id = '1';
      const mockDeleteResult = { affected: 1 };

      mockIdiomsService.remove.mockResolvedValue(mockDeleteResult);

      const result = await controller.remove(id);

      expect(result).toEqual(mockDeleteResult);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple idioms', async () => {
      const ids = ['1', '2', '3'];
      const mockDeleteResult = { affected: 3 };

      mockIdiomsService.bulkDelete.mockResolvedValue(mockDeleteResult);

      const result = await controller.bulkDelete({ ids });

      expect(result).toEqual(mockDeleteResult);
      expect(service.bulkDelete).toHaveBeenCalledWith(ids);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple idioms from array', async () => {
      const idioms = [
        { hanzi: '一心一意', pinyin: 'yī xīn yī yì', meaning: 'meaning1' },
        { hanzi: '三心二意', pinyin: 'sān xīn èr yì', meaning: 'meaning2' },
      ];

      const mockCreatedIdioms = idioms.map((idiom, index) => ({
        id: `${index + 1}`,
        ...idiom,
      }));

      mockIdiomsService.bulkCreate.mockResolvedValue(mockCreatedIdioms);

      const result = await controller.bulkCreate(idioms);

      expect(result).toEqual(mockCreatedIdioms);
      expect(service.bulkCreate).toHaveBeenCalledWith(idioms);
    });

    it('should create multiple idioms from object with idioms property', async () => {
      const body = {
        idioms: [
          { hanzi: '一心一意', pinyin: 'yī xīn yī yì', meaning: 'meaning1' },
          { hanzi: '三心二意', pinyin: 'sān xīn èr yì', meaning: 'meaning2' },
        ],
      };

      const mockCreatedIdioms = body.idioms.map((idiom, index) => ({
        id: `${index + 1}`,
        ...idiom,
      }));

      mockIdiomsService.bulkCreate.mockResolvedValue(mockCreatedIdioms);

      const result = await controller.bulkCreate(body);

      expect(result).toEqual(mockCreatedIdioms);
      expect(service.bulkCreate).toHaveBeenCalledWith(body.idioms);
    });

    it('should throw BadRequestException when body is invalid', async () => {
      const invalidBody = { notIdioms: [] };

      await expect(controller.bulkCreate(invalidBody)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.bulkCreate(invalidBody)).rejects.toThrow(
        'Dữ liệu không hợp lệ. Phải là một mảng.',
      );
    });

    it('should throw BadRequestException when body is not an array or object', async () => {
      const invalidBody = 'invalid';

      await expect(controller.bulkCreate(invalidBody)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
