import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamQuestionEntity } from './entities/exam-question.entity';
import { CreateExamQuestionDto } from './dto/create-exam-question.dto';
import { UpdateExamQuestionDto } from './dto/update-exam-question.dto';

@Injectable()
export class ExamQuestionsService {
  constructor(
    @InjectRepository(ExamQuestionEntity)
    private readonly questionRepo: Repository<ExamQuestionEntity>,
  ) {}

  async create(createDto: CreateExamQuestionDto) {
    const question = this.questionRepo.create(createDto);
    return await this.questionRepo.save(question);
  }

  async findOne(id: string) {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  async update(id: string, updateDto: UpdateExamQuestionDto) {
    const question = await this.findOne(id);
    const updated = this.questionRepo.merge(question, updateDto);
    return await this.questionRepo.save(updated);
  }

  async remove(id: string) {
    const result = await this.questionRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return { deleted: true };
  }
}
