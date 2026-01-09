import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamPapersService } from './exam-papers.service';
import { ExamQuestionsService } from './exam-questions.service';
import { ExamPapersController } from './exam-papers.controller';
import { ExamQuestionsController } from './exam-questions.controller';
import { UserExamPapersController } from './user-exam-papers.controller';
import { ExamPaperEntity } from './entities/exam-paper.entity';
import { ExamQuestionEntity } from './entities/exam-question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExamPaperEntity, ExamQuestionEntity])],
  controllers: [
    ExamPapersController,
    ExamQuestionsController,
    UserExamPapersController,
  ],
  providers: [ExamPapersService, ExamQuestionsService],
  exports: [ExamPapersService],
})
export class ExamPapersModule {}
