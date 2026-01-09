import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ExamPapersService } from './exam-papers.service';
import { ExamPaperQueryDto } from './dto/exam-paper-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('exam-papers')
export class UserExamPapersController {
  constructor(private readonly examPapersService: ExamPapersService) {}

  @Get()
  findAll(@Query() query: ExamPaperQueryDto) {
    return this.examPapersService.findAll(query);
  }

  @Get('recommend')
  recommend() {
    return this.examPapersService.recommend();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examPapersService.findOne(id);
  }
}
