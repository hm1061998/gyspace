import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExerciseQueryDto } from './dto/exercise-query.dto';
import { ExerciseType } from './entities/exercise.entity';

describe('ExercisesController', () => {
  let controller: ExercisesController;
  let service: ExercisesService;

  const mockExercisesService = {
    getUserProgress: jest.fn(),
    saveProgress: jest.fn(),
    resetUserProgress: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 'test-user-id',
      username: 'testuser',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExercisesController],
      providers: [
        {
          provide: ExercisesService,
          useValue: mockExercisesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ExercisesController>(ExercisesController);
    service = module.get<ExercisesService>(ExercisesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserProgress', () => {
    it('should return user progress', async () => {
      const mockProgress = [
        {
          id: '1',
          userId: 'test-user-id',
          exerciseId: 'exercise-1',
          score: 85,
          completedAt: new Date(),
        },
      ];

      mockExercisesService.getUserProgress.mockResolvedValue(mockProgress);

      const result = await controller.getUserProgress(mockRequest);

      expect(result).toEqual(mockProgress);
      expect(service.getUserProgress).toHaveBeenCalledWith('test-user-id');
      expect(service.getUserProgress).toHaveBeenCalledTimes(1);
    });

    it('should handle empty progress', async () => {
      mockExercisesService.getUserProgress.mockResolvedValue([]);

      const result = await controller.getUserProgress(mockRequest);

      expect(result).toEqual([]);
      expect(service.getUserProgress).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('saveProgress', () => {
    it('should save exercise progress successfully', async () => {
      const body = {
        exerciseId: 'exercise-1',
        score: 90,
      };

      const mockSavedProgress = {
        id: '1',
        userId: 'test-user-id',
        exerciseId: 'exercise-1',
        score: 90,
        completedAt: new Date(),
      };

      mockExercisesService.saveProgress.mockResolvedValue(mockSavedProgress);

      const result = await controller.saveProgress(mockRequest, body);

      expect(result).toEqual(mockSavedProgress);
      expect(service.saveProgress).toHaveBeenCalledWith(
        'test-user-id',
        'exercise-1',
        90,
      );
      expect(service.saveProgress).toHaveBeenCalledTimes(1);
    });

    it('should update existing progress', async () => {
      const body = {
        exerciseId: 'exercise-1',
        score: 95,
      };

      const mockUpdatedProgress = {
        id: '1',
        userId: 'test-user-id',
        exerciseId: 'exercise-1',
        score: 95,
        completedAt: new Date(),
      };

      mockExercisesService.saveProgress.mockResolvedValue(mockUpdatedProgress);

      const result = await controller.saveProgress(mockRequest, body);

      expect(result).toEqual(mockUpdatedProgress);
      expect(service.saveProgress).toHaveBeenCalledWith(
        'test-user-id',
        'exercise-1',
        95,
      );
    });
  });

  describe('resetProgress', () => {
    it('should reset user progress successfully', async () => {
      const mockDeleteResult = { affected: 5 };
      mockExercisesService.resetUserProgress.mockResolvedValue(
        mockDeleteResult,
      );

      const result = await controller.resetProgress(mockRequest);

      expect(result).toEqual(mockDeleteResult);
      expect(service.resetUserProgress).toHaveBeenCalledWith('test-user-id');
      expect(service.resetUserProgress).toHaveBeenCalledTimes(1);
    });

    it('should handle reset when no progress exists', async () => {
      const mockDeleteResult = { affected: 0 };
      mockExercisesService.resetUserProgress.mockResolvedValue(
        mockDeleteResult,
      );

      const result = await controller.resetProgress(mockRequest);

      expect(result).toEqual(mockDeleteResult);
      expect(service.resetUserProgress).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('findAll', () => {
    it('should return paginated exercises', async () => {
      const query: ExerciseQueryDto = {
        page: 1,
        limit: 12,
      };

      const mockResponse = {
        data: [
          {
            id: '1',
            type: 'multiple-choice',
            difficulty: 'easy',
            question: 'Test question',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 12,
          lastPage: 1,
        },
      };

      mockExercisesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should filter exercises by type', async () => {
      const query: ExerciseQueryDto = {
        page: 1,
        limit: 12,
        type: ExerciseType.FILL_BLANKS,
      };

      const mockResponse = {
        data: [
          {
            id: '2',
            type: 'fill-blank',
            difficulty: 'medium',
            question: 'Fill in the blank',
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 12,
          lastPage: 1,
        },
      };

      mockExercisesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter exercises by difficulty', async () => {
      const query: ExerciseQueryDto = {
        page: 1,
        limit: 12,
        difficulty: 'hard',
      };

      const mockResponse = {
        data: [
          {
            id: '3',
            type: 'multiple-choice',
            difficulty: 'hard',
            question: 'Hard question',
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 12,
          lastPage: 1,
        },
      };

      mockExercisesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle pagination correctly', async () => {
      const query: ExerciseQueryDto = {
        page: 2,
        limit: 10,
      };

      const mockResponse = {
        data: [],
        meta: {
          total: 15,
          page: 2,
          limit: 10,
          lastPage: 2,
        },
      };

      mockExercisesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single exercise by id', async () => {
      const exerciseId = 'exercise-1';
      const mockExercise = {
        id: exerciseId,
        type: 'multiple-choice',
        difficulty: 'easy',
        question: 'Test question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
      };

      mockExercisesService.findOne.mockResolvedValue(mockExercise);

      const result = await controller.findOne(exerciseId);

      expect(result).toEqual(mockExercise);
      expect(service.findOne).toHaveBeenCalledWith(exerciseId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when exercise not found', async () => {
      const exerciseId = 'non-existent-id';
      mockExercisesService.findOne.mockRejectedValue(
        new Error('Exercise not found'),
      );

      await expect(controller.findOne(exerciseId)).rejects.toThrow(
        'Exercise not found',
      );
      expect(service.findOne).toHaveBeenCalledWith(exerciseId);
    });
  });
});
