import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExerciseEntity, ExerciseType } from './entities/exercise.entity';
import { UserExerciseHistory } from './entities/user-exercise-history.entity';
import { ExerciseQueryDto } from './dto/exercise-query.dto';

describe('ExercisesService', () => {
  let service: ExercisesService;
  let exerciseRepository: Repository<ExerciseEntity>;
  let historyRepository: Repository<UserExerciseHistory>;

  const mockExerciseRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockHistoryRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        {
          provide: getRepositoryToken(ExerciseEntity),
          useValue: mockExerciseRepository,
        },
        {
          provide: getRepositoryToken(UserExerciseHistory),
          useValue: mockHistoryRepository,
        },
      ],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
    exerciseRepository = module.get<Repository<ExerciseEntity>>(
      getRepositoryToken(ExerciseEntity),
    );
    historyRepository = module.get<Repository<UserExerciseHistory>>(
      getRepositoryToken(UserExerciseHistory),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated exercises', async () => {
      const query: ExerciseQueryDto = {
        page: 1,
        limit: 12,
      };

      const mockExercises = [
        {
          id: '1',
          type: ExerciseType.MULTIPLE_CHOICE,
          difficulty: 'easy',
          question: 'Test question',
          createdAt: new Date(),
        },
      ];

      mockExerciseRepository.findAndCount.mockResolvedValue([mockExercises, 1]);

      const result = await service.findAll(query);

      expect(result).toEqual({
        data: mockExercises,
        meta: {
          total: 1,
          page: 1,
          limit: 12,
          lastPage: 1,
        },
      });
      expect(exerciseRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { createdAt: 'DESC' },
        take: 12,
        skip: 0,
      });
    });

    it('should filter by type', async () => {
      const query: ExerciseQueryDto = {
        page: 1,
        limit: 12,
        type: ExerciseType.FILL_BLANKS,
      };

      mockExerciseRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(query);

      expect(exerciseRepository.findAndCount).toHaveBeenCalledWith({
        where: { type: ExerciseType.FILL_BLANKS },
        order: { createdAt: 'DESC' },
        take: 12,
        skip: 0,
      });
    });

    it('should filter by difficulty', async () => {
      const query: ExerciseQueryDto = {
        page: 1,
        limit: 12,
        difficulty: 'hard',
      };

      mockExerciseRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(query);

      expect(exerciseRepository.findAndCount).toHaveBeenCalledWith({
        where: { difficulty: 'hard' },
        order: { createdAt: 'DESC' },
        take: 12,
        skip: 0,
      });
    });

    it('should filter by both type and difficulty', async () => {
      const query: ExerciseQueryDto = {
        page: 1,
        limit: 12,
        type: ExerciseType.MULTIPLE_CHOICE,
        difficulty: 'medium',
      };

      mockExerciseRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(query);

      expect(exerciseRepository.findAndCount).toHaveBeenCalledWith({
        where: { type: ExerciseType.MULTIPLE_CHOICE, difficulty: 'medium' },
        order: { createdAt: 'DESC' },
        take: 12,
        skip: 0,
      });
    });

    it('should calculate pagination correctly', async () => {
      const query: ExerciseQueryDto = {
        page: 3,
        limit: 10,
      };

      mockExerciseRepository.findAndCount.mockResolvedValue([[], 25]);

      const result = await service.findAll(query);

      expect(result.meta).toEqual({
        total: 25,
        page: 3,
        limit: 10,
        lastPage: 3,
      });
      expect(exerciseRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { createdAt: 'DESC' },
        take: 10,
        skip: 20,
      });
    });
  });

  describe('findOne', () => {
    it('should return an exercise by id', async () => {
      const mockExercise = {
        id: '1',
        type: ExerciseType.MULTIPLE_CHOICE,
        difficulty: 'easy',
        question: 'Test question',
      };

      mockExerciseRepository.findOne.mockResolvedValue(mockExercise);

      const result = await service.findOne('1');

      expect(result).toEqual(mockExercise);
      expect(exerciseRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when exercise not found', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Exercise with ID non-existent not found',
      );
    });
  });

  describe('create', () => {
    it('should create a new exercise', async () => {
      const exerciseData = {
        type: ExerciseType.MULTIPLE_CHOICE,
        difficulty: 'easy',
        question: 'New question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
      };

      const mockCreatedExercise = { id: '1', ...exerciseData };

      mockExerciseRepository.create.mockReturnValue(mockCreatedExercise);
      mockExerciseRepository.save.mockResolvedValue(mockCreatedExercise);

      const result = await service.create(exerciseData);

      expect(result).toEqual(mockCreatedExercise);
      expect(exerciseRepository.create).toHaveBeenCalledWith(exerciseData);
      expect(exerciseRepository.save).toHaveBeenCalledWith(mockCreatedExercise);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple exercises', async () => {
      const exercisesData = [
        {
          type: ExerciseType.MULTIPLE_CHOICE,
          difficulty: 'easy',
          question: 'Question 1',
        },
        {
          type: ExerciseType.FILL_BLANKS,
          difficulty: 'medium',
          question: 'Question 2',
        },
      ];

      const mockCreatedExercises = exercisesData.map((data, index) => ({
        id: `${index + 1}`,
        ...data,
      }));

      mockExerciseRepository.create.mockReturnValue(mockCreatedExercises);
      mockExerciseRepository.save.mockResolvedValue(mockCreatedExercises);

      const result = await service.bulkCreate(exercisesData);

      expect(result).toEqual(mockCreatedExercises);
      expect(exerciseRepository.create).toHaveBeenCalledWith(exercisesData);
      expect(exerciseRepository.save).toHaveBeenCalledWith(
        mockCreatedExercises,
      );
    });
  });

  describe('update', () => {
    it('should update an existing exercise', async () => {
      const existingExercise = {
        id: '1',
        type: ExerciseType.MULTIPLE_CHOICE,
        difficulty: 'easy',
        question: 'Old question',
      };

      const updateData = {
        question: 'Updated question',
        difficulty: 'medium',
      };

      const updatedExercise = { ...existingExercise, ...updateData };

      mockExerciseRepository.findOne.mockResolvedValue(existingExercise);
      mockExerciseRepository.save.mockResolvedValue(updatedExercise);

      const result = await service.update('1', updateData);

      expect(result).toEqual(updatedExercise);
      expect(exerciseRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(exerciseRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent exercise', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { difficulty: 'hard' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an exercise and its history', async () => {
      const mockExercise = {
        id: '1',
        type: ExerciseType.MULTIPLE_CHOICE,
        difficulty: 'easy',
        question: 'Test question',
      };

      mockExerciseRepository.findOne.mockResolvedValue(mockExercise);
      mockHistoryRepository.delete.mockResolvedValue({ affected: 2 });
      mockExerciseRepository.remove.mockResolvedValue(mockExercise);

      const result = await service.remove('1');

      expect(result).toEqual(mockExercise);
      expect(historyRepository.delete).toHaveBeenCalledWith({
        exerciseId: '1',
      });
      expect(exerciseRepository.remove).toHaveBeenCalledWith(mockExercise);
    });

    it('should throw NotFoundException when deleting non-existent exercise', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('saveProgress', () => {
    it('should create new progress record', async () => {
      const userId = 'user-1';
      const exerciseId = 'exercise-1';
      const score = 85;

      mockHistoryRepository.findOne.mockResolvedValue(null);

      const newHistory = {
        userId,
        exerciseId,
        score,
        completedAt: expect.any(Date),
      };

      mockHistoryRepository.create.mockReturnValue(newHistory);
      mockHistoryRepository.save.mockResolvedValue({
        id: '1',
        ...newHistory,
      });

      const result = await service.saveProgress(userId, exerciseId, score);

      expect(result).toEqual({ id: '1', ...newHistory });
      expect(historyRepository.findOne).toHaveBeenCalledWith({
        where: { userId, exerciseId },
      });
      expect(historyRepository.create).toHaveBeenCalledWith({
        userId,
        exerciseId,
        score,
      });
      expect(historyRepository.save).toHaveBeenCalled();
    });

    it('should update existing progress record', async () => {
      const userId = 'user-1';
      const exerciseId = 'exercise-1';
      const newScore = 95;

      const existingHistory = {
        id: '1',
        userId,
        exerciseId,
        score: 80,
        completedAt: new Date('2024-01-01'),
      };

      mockHistoryRepository.findOne.mockResolvedValue(existingHistory);
      mockHistoryRepository.save.mockResolvedValue({
        ...existingHistory,
        score: newScore,
        completedAt: expect.any(Date),
      });

      const result = await service.saveProgress(userId, exerciseId, newScore);

      expect(result.score).toBe(newScore);
      expect(historyRepository.findOne).toHaveBeenCalledWith({
        where: { userId, exerciseId },
      });
      expect(historyRepository.save).toHaveBeenCalled();
    });
  });

  describe('getUserProgress', () => {
    it('should return user progress with exercise relations', async () => {
      const userId = 'user-1';
      const mockProgress = [
        {
          id: '1',
          userId,
          exerciseId: 'exercise-1',
          score: 85,
          exercise: {
            id: 'exercise-1',
            type: ExerciseType.MULTIPLE_CHOICE,
            question: 'Test',
          },
        },
        {
          id: '2',
          userId,
          exerciseId: 'exercise-2',
          score: 90,
          exercise: {
            id: 'exercise-2',
            type: ExerciseType.FILL_BLANKS,
            question: 'Test 2',
          },
        },
      ];

      mockHistoryRepository.find.mockResolvedValue(mockProgress);

      const result = await service.getUserProgress(userId);

      expect(result).toEqual(mockProgress);
      expect(historyRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['exercise'],
      });
    });

    it('should return empty array when no progress exists', async () => {
      mockHistoryRepository.find.mockResolvedValue([]);

      const result = await service.getUserProgress('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('resetUserProgress', () => {
    it('should delete all user progress', async () => {
      const userId = 'user-1';
      const mockDeleteResult = { affected: 5 };

      mockHistoryRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.resetUserProgress(userId);

      expect(result).toEqual(mockDeleteResult);
      expect(historyRepository.delete).toHaveBeenCalledWith({ userId });
    });

    it('should return zero affected when no progress exists', async () => {
      const userId = 'user-1';
      const mockDeleteResult = { affected: 0 };

      mockHistoryRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.resetUserProgress(userId);

      expect(result).toEqual(mockDeleteResult);
    });
  });
});
