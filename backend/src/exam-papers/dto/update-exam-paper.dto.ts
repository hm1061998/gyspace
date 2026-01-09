import { PartialType } from '@nestjs/mapped-types';
import { CreateExamPaperDto } from './create-exam-paper.dto';

export class UpdateExamPaperDto extends PartialType(CreateExamPaperDto) {}
