import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExerciseEntity } from './entities/exercise.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get('progress')
  @UseGuards(JwtAuthGuard)
  getUserProgress(@Req() req: any) {
    return this.exercisesService.getUserProgress(req.user.id);
  }

  @Post('progress')
  @UseGuards(JwtAuthGuard)
  saveProgress(
    @Req() req: any,
    @Body() body: { exerciseId: string; score: number },
  ) {
    return this.exercisesService.saveProgress(
      req.user.id,
      body.exerciseId,
      body.score,
    );
  }

  @Delete('progress')
  @UseGuards(JwtAuthGuard)
  resetProgress(@Req() req: any) {
    return this.exercisesService.resetUserProgress(req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.exercisesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.exercisesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() createExerciseDto: Partial<ExerciseEntity>) {
    return this.exercisesService.create(createExerciseDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param('id') id: string,
    @Body() updateExerciseDto: Partial<ExerciseEntity>,
  ) {
    return this.exercisesService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.exercisesService.remove(id);
  }
}
