import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExamPapersService } from './exam-papers.service';
import { CreateExamPaperDto } from './dto/create-exam-paper.dto';
import { UpdateExamPaperDto } from './dto/update-exam-paper.dto';
import { ExamPaperQueryDto } from './dto/exam-paper-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin/exam-papers')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ExamPapersController {
  constructor(private readonly examPapersService: ExamPapersService) {}

  @Post()
  create(@Body() createExamPaperDto: CreateExamPaperDto) {
    return this.examPapersService.create(createExamPaperDto);
  }

  @Get()
  findAll(@Query() query: ExamPaperQueryDto) {
    return this.examPapersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examPapersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExamPaperDto: UpdateExamPaperDto,
  ) {
    return this.examPapersService.update(id, updateExamPaperDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examPapersService.remove(id);
  }
}
