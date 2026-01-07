import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ExerciseType {
  MATCHING = 'MATCHING',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_BLANKS = 'FILL_BLANKS',
}

@Entity('exercises')
export class ExerciseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ExerciseType,
  })
  type: ExerciseType;

  @Column({ type: 'jsonb' })
  content: any;
  /*
    MATCHING: { 
      pairs: { left: string; right: string }[] 
    }
    MULTIPLE_CHOICE: {
      question: string;
      options: { id: string; text: string }[];
      correctOptionId: string;
      explanation?: string;
    }
    FILL_BLANKS: {
      text: string; // e.g. "Tôi [0] đi học bằng [1]"
      wordBank: string[]; // All available words (correct + distractors)
      correctAnswers: { position: number; word: string }[]; // Mapping of position to correct word
    }
  */

  @Column({ default: 'easy' })
  difficulty: string; // easy, medium, hard

  @Column({ default: 10 })
  points: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
