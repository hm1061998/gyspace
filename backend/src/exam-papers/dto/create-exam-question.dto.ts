import { IsEnum, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { ExamQuestionType } from '../entities/exam-question.entity';

export class CreateExamQuestionDto {
  @IsEnum(ExamQuestionType)
  type: ExamQuestionType;

  @IsNotEmpty()
  content: any;

  @IsNumber()
  points: number;

  @IsNumber()
  @IsOptional()
  order: number;

  @IsNotEmpty()
  examPaperId: string;
}
