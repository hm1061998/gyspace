import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseEntity } from './entities/exercise.entity';
import { UserExerciseHistory } from './entities/user-exercise-history.entity';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(ExerciseEntity)
    private exerciseRepository: Repository<ExerciseEntity>,
    @InjectRepository(UserExerciseHistory)
    private historyRepository: Repository<UserExerciseHistory>,
  ) {}

  async findAll() {
    return await this.exerciseRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const exercise = await this.exerciseRepository.findOne({ where: { id } });
    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }
    return exercise;
  }

  async create(data: Partial<ExerciseEntity>) {
    const exercise = this.exerciseRepository.create(data);
    return await this.exerciseRepository.save(exercise);
  }

  async bulkCreate(data: Partial<ExerciseEntity>[]) {
    const exercises = this.exerciseRepository.create(data);
    return await this.exerciseRepository.save(exercises);
  }

  async update(id: string, data: Partial<ExerciseEntity>) {
    const exercise = await this.findOne(id);
    Object.assign(exercise, data);
    return await this.exerciseRepository.save(exercise);
  }

  async remove(id: string) {
    const exercise = await this.findOne(id);
    return await this.exerciseRepository.remove(exercise);
  }

  // User Progress Methods
  async saveProgress(userId: string, exerciseId: string, score: number) {
    let history = await this.historyRepository.findOne({
      where: { userId, exerciseId },
    });

    if (history) {
      history.score = score;
      history.completedAt = new Date();
    } else {
      history = this.historyRepository.create({
        userId,
        exerciseId,
        score,
      });
    }
    return await this.historyRepository.save(history);
  }

  async getUserProgress(userId: string) {
    return await this.historyRepository.find({
      where: { userId },
      relations: ['exercise'],
    });
  }

  async resetUserProgress(userId: string) {
    return await this.historyRepository.delete({ userId });
  }
}
