import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { ExerciseEntity } from './entities/exercise.entity';

import { UserExerciseHistory } from './entities/user-exercise-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseEntity, UserExerciseHistory])],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
