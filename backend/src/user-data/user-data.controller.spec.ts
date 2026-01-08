import { Test, TestingModule } from '@nestjs/testing';
import { UserDataController } from './user-data.controller';
import { UserDataService } from './user-data.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDataQueryDto } from './dto/user-data-query.dto';
import { UpdateSRSDto } from './dto/user-data.dto';

describe('UserDataController', () => {
  let controller: UserDataController;
  let service: UserDataService;

  const mockUserDataService = {
    toggleSaveIdiom: jest.fn(),
    isSaved: jest.fn(),
    getSavedIdioms: jest.fn(),
    updateSRS: jest.fn(),
    getSRSData: jest.fn(),
    addToHistory: jest.fn(),
    getHistory: jest.fn(),
    clearHistory: jest.fn(),
    bulkRemoveSaved: jest.fn(),
    bulkRemoveHistory: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 'test-user-id',
      username: 'testuser',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDataController],
      providers: [
        {
          provide: UserDataService,
          useValue: mockUserDataService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserDataController>(UserDataController);
    service = module.get<UserDataService>(UserDataService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('toggleSave', () => {
    it('should save an idiom when not already saved', async () => {
      const idiomId = 'idiom-1';
      mockUserDataService.toggleSaveIdiom.mockResolvedValue({ saved: true });

      const result = await controller.toggleSave(mockRequest, idiomId);

      expect(result).toEqual({ saved: true });
      expect(service.toggleSaveIdiom).toHaveBeenCalledWith(
        'test-user-id',
        idiomId,
      );
    });

    it('should unsave an idiom when already saved', async () => {
      const idiomId = 'idiom-1';
      mockUserDataService.toggleSaveIdiom.mockResolvedValue({ saved: false });

      const result = await controller.toggleSave(mockRequest, idiomId);

      expect(result).toEqual({ saved: false });
      expect(service.toggleSaveIdiom).toHaveBeenCalledWith(
        'test-user-id',
        idiomId,
      );
    });
  });

  describe('checkSaved', () => {
    it('should return true when idiom is saved', async () => {
      const idiomId = 'idiom-1';
      mockUserDataService.isSaved.mockResolvedValue({ isSaved: true });

      const result = await controller.checkSaved(mockRequest, idiomId);

      expect(result).toEqual({ isSaved: true });
      expect(service.isSaved).toHaveBeenCalledWith('test-user-id', idiomId);
    });

    it('should return false when idiom is not saved', async () => {
      const idiomId = 'idiom-1';
      mockUserDataService.isSaved.mockResolvedValue({ isSaved: false });

      const result = await controller.checkSaved(mockRequest, idiomId);

      expect(result).toEqual({ isSaved: false });
      expect(service.isSaved).toHaveBeenCalledWith('test-user-id', idiomId);
    });
  });

  describe('getSaved', () => {
    it('should return paginated saved idioms', async () => {
      const query: UserDataQueryDto = {
        page: 1,
        limit: 12,
      };

      const mockResponse = {
        data: [
          { id: '1', hanzi: '一心一意', pinyin: 'yī xīn yī yì' },
          { id: '2', hanzi: '三心二意', pinyin: 'sān xīn èr yì' },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 12,
          lastPage: 1,
        },
      };

      mockUserDataService.getSavedIdioms.mockResolvedValue(mockResponse);

      const result = await controller.getSaved(mockRequest, query);

      expect(result).toEqual(mockResponse);
      expect(service.getSavedIdioms).toHaveBeenCalledWith(
        'test-user-id',
        query,
      );
    });

    it('should handle custom sorting', async () => {
      const query: UserDataQueryDto = {
        page: 1,
        limit: 12,
        sort: 'createdAt,ASC',
      };

      const mockResponse = {
        data: [],
        meta: { total: 0, page: 1, limit: 12, lastPage: 1 },
      };

      mockUserDataService.getSavedIdioms.mockResolvedValue(mockResponse);

      const result = await controller.getSaved(mockRequest, query);

      expect(result).toEqual(mockResponse);
      expect(service.getSavedIdioms).toHaveBeenCalledWith(
        'test-user-id',
        query,
      );
    });
  });

  describe('updateSRS', () => {
    it('should update SRS progress for an idiom', async () => {
      const updateDto: UpdateSRSDto = {
        idiomId: 'idiom-1',
        interval: 1,
        repetition: 1,
        efactor: 2.5,
        nextReviewDate: '2026-01-10',
      };

      const mockUpdatedSRS = {
        id: '1',
        userId: 'test-user-id',
        idiomId: 'idiom-1',
        ...updateDto,
      };

      mockUserDataService.updateSRS.mockResolvedValue(mockUpdatedSRS);

      const result = await controller.updateSRS(mockRequest, updateDto);

      expect(result).toEqual(mockUpdatedSRS);
      expect(service.updateSRS).toHaveBeenCalledWith(
        'test-user-id',
        'idiom-1',
        updateDto,
      );
    });
  });

  describe('getSRS', () => {
    it('should return paginated SRS data', async () => {
      const query: UserDataQueryDto = {
        page: 1,
        limit: 50,
      };

      const mockResponse = {
        data: [
          {
            id: '1',
            idiomId: 'idiom-1',
            interval: 1,
            repetition: 1,
            efactor: 2.5,
            nextReviewDate: '2026-01-10',
            idiom: { id: 'idiom-1', hanzi: '一心一意' },
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 50,
          lastPage: 1,
        },
      };

      mockUserDataService.getSRSData.mockResolvedValue(mockResponse);

      const result = await controller.getSRS(mockRequest, query);

      expect(result).toEqual(mockResponse);
      expect(service.getSRSData).toHaveBeenCalledWith('test-user-id', query);
    });
  });

  describe('addHistory', () => {
    it('should add an idiom to history', async () => {
      const idiomId = 'idiom-1';
      const mockHistory = {
        id: '1',
        userId: 'test-user-id',
        idiomId: 'idiom-1',
        createdAt: new Date(),
      };

      mockUserDataService.addToHistory.mockResolvedValue(mockHistory);

      const result = await controller.addHistory(mockRequest, idiomId);

      expect(result).toEqual(mockHistory);
      expect(service.addToHistory).toHaveBeenCalledWith(
        'test-user-id',
        idiomId,
      );
    });
  });

  describe('getHistory', () => {
    it('should return paginated history', async () => {
      const query: UserDataQueryDto = {
        page: 1,
        limit: 20,
      };

      const mockResponse = {
        data: [
          { id: '1', hanzi: '一心一意', pinyin: 'yī xīn yī yì' },
          { id: '2', hanzi: '三心二意', pinyin: 'sān xīn èr yì' },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 20,
          lastPage: 1,
        },
      };

      mockUserDataService.getHistory.mockResolvedValue(mockResponse);

      const result = await controller.getHistory(mockRequest, query);

      expect(result).toEqual(mockResponse);
      expect(service.getHistory).toHaveBeenCalledWith('test-user-id', query);
    });

    it('should filter history by search term', async () => {
      const query: UserDataQueryDto = {
        page: 1,
        limit: 20,
        search: '一心',
      };

      const mockResponse = {
        data: [{ id: '1', hanzi: '一心一意', pinyin: 'yī xīn yī yì' }],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          lastPage: 1,
        },
      };

      mockUserDataService.getHistory.mockResolvedValue(mockResponse);

      const result = await controller.getHistory(mockRequest, query);

      expect(result).toEqual(mockResponse);
      expect(service.getHistory).toHaveBeenCalledWith('test-user-id', query);
    });
  });

  describe('clearHistory', () => {
    it('should clear all user history', async () => {
      const mockResult = { success: true };
      mockUserDataService.clearHistory.mockResolvedValue(mockResult);

      const result = await controller.clearHistory(mockRequest);

      expect(result).toEqual(mockResult);
      expect(service.clearHistory).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('bulkDeleteSaved', () => {
    it('should delete multiple saved idioms', async () => {
      const idiomIds = ['idiom-1', 'idiom-2', 'idiom-3'];
      const mockResult = { success: true, deleted: 3 };

      mockUserDataService.bulkRemoveSaved.mockResolvedValue(mockResult);

      const result = await controller.bulkDeleteSaved(mockRequest, idiomIds);

      expect(result).toEqual(mockResult);
      expect(service.bulkRemoveSaved).toHaveBeenCalledWith(
        'test-user-id',
        idiomIds,
      );
    });

    it('should handle empty array', async () => {
      const idiomIds: string[] = [];
      const mockResult = { success: true, deleted: 0 };

      mockUserDataService.bulkRemoveSaved.mockResolvedValue(mockResult);

      const result = await controller.bulkDeleteSaved(mockRequest, idiomIds);

      expect(result).toEqual(mockResult);
      expect(service.bulkRemoveSaved).toHaveBeenCalledWith(
        'test-user-id',
        idiomIds,
      );
    });
  });

  describe('bulkDeleteHistory', () => {
    it('should delete multiple history items', async () => {
      const idiomIds = ['idiom-1', 'idiom-2'];
      const mockResult = { success: true, deleted: 2 };

      mockUserDataService.bulkRemoveHistory.mockResolvedValue(mockResult);

      const result = await controller.bulkDeleteHistory(mockRequest, idiomIds);

      expect(result).toEqual(mockResult);
      expect(service.bulkRemoveHistory).toHaveBeenCalledWith(
        'test-user-id',
        idiomIds,
      );
    });

    it('should handle empty array', async () => {
      const idiomIds: string[] = [];
      const mockResult = { success: true, deleted: 0 };

      mockUserDataService.bulkRemoveHistory.mockResolvedValue(mockResult);

      const result = await controller.bulkDeleteHistory(mockRequest, idiomIds);

      expect(result).toEqual(mockResult);
      expect(service.bulkRemoveHistory).toHaveBeenCalledWith(
        'test-user-id',
        idiomIds,
      );
    });
  });
});
