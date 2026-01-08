import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExerciseEntity } from './entities/exercise.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin/exercises')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  create(@Body() createExerciseDto: Partial<ExerciseEntity>) {
    return this.exercisesService.create(createExerciseDto);
  }

  @Post('bulk')
  bulkCreate(@Body() createExerciseDtos: Partial<ExerciseEntity>[]) {
    return this.exercisesService.bulkCreate(createExerciseDtos);
  }

  @Get()
  findAll() {
    return this.exercisesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exercisesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExerciseDto: Partial<ExerciseEntity>,
  ) {
    return this.exercisesService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exercisesService.remove(id);
  }
}
