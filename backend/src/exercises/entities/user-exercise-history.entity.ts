import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { ExerciseEntity } from './exercise.entity';

@Entity('user_exercise_history')
export class UserExerciseHistory {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  exerciseId: string;

  @ManyToOne(() => ExerciseEntity)
  @JoinColumn({ name: 'exerciseId' })
  exercise: ExerciseEntity;

  @Column()
  score: number;

  @CreateDateColumn()
  completedAt: Date;
}
