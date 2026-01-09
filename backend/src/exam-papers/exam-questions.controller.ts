import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ExamQuestionsService } from './exam-questions.service';
import { CreateExamQuestionDto } from './dto/create-exam-question.dto';
import { UpdateExamQuestionDto } from './dto/update-exam-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin/exam-questions')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ExamQuestionsController {
  constructor(private readonly examQuestionsService: ExamQuestionsService) {}

  @Post()
  create(@Body() createDto: CreateExamQuestionDto) {
    return this.examQuestionsService.create(createDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examQuestionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateExamQuestionDto) {
    return this.examQuestionsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examQuestionsService.remove(id);
  }
}
