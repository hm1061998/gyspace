import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ExamPaperEntity } from './entities/exam-paper.entity';
import { CreateExamPaperDto } from './dto/create-exam-paper.dto';
import { UpdateExamPaperDto } from './dto/update-exam-paper.dto';
import { ExamPaperQueryDto } from './dto/exam-paper-query.dto';

@Injectable()
export class ExamPapersService {
  constructor(
    @InjectRepository(ExamPaperEntity)
    private readonly examPaperRepo: Repository<ExamPaperEntity>,
  ) {}

  async create(createExamPaperDto: CreateExamPaperDto) {
    const paper = this.examPaperRepo.create(createExamPaperDto);
    return await this.examPaperRepo.save(paper);
  }

  async findAll(query: ExamPaperQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.title = Like(`%${search}%`);
    }

    const [data, total] = await this.examPaperRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const paper = await this.examPaperRepo.findOne({
      where: { id },
      relations: ['questions'],
    });
    if (!paper) {
      throw new NotFoundException(`Exam Paper with ID ${id} not found`);
    }
    // Sort questions by order or date
    if (paper.questions) {
      paper.questions.sort((a, b) => a.order - b.order);
    }

    return paper;
  }

  async recommend() {
    // Determine a random paper that has questions
    const papersWithQuestions = await this.examPaperRepo
      .createQueryBuilder('examPaper')
      .innerJoin('examPaper.questions', 'questions')
      .select(['examPaper.id'])
      .getMany();

    if (papersWithQuestions.length === 0) {
      throw new NotFoundException('Chưa có đề thi nào trong hệ thống.');
    }

    const randomIndex = Math.floor(Math.random() * papersWithQuestions.length);
    const selectedId = papersWithQuestions[randomIndex].id;

    return this.findOne(selectedId);
  }

  async update(id: string, updateExamPaperDto: UpdateExamPaperDto) {
    const paper = await this.findOne(id);
    const updated = this.examPaperRepo.merge(paper, updateExamPaperDto);
    return await this.examPaperRepo.save(updated);
  }

  async remove(id: string) {
    const result = await this.examPaperRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Exam Paper with ID ${id} not found`);
    }
    return { deleted: true };
  }
}
