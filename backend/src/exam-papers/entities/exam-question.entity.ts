import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExamPaperEntity } from './exam-paper.entity';

export enum ExamQuestionType {
  MATCHING = 'MATCHING',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_BLANKS = 'FILL_BLANKS',
}

@Entity('exam_questions')
export class ExamQuestionEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  examPaperId: string;

  @ManyToOne(() => ExamPaperEntity, (paper) => paper.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'examPaperId' })
  examPaper: ExamPaperEntity;

  @Column({
    type: 'enum',
    enum: ExamQuestionType,
  })
  type: ExamQuestionType;

  @Column({ type: 'jsonb' })
  content: any;

  @Column({ default: 0 })
  points: number;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
