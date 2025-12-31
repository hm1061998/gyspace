import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entities';
import { IdiomEntity } from '../../idioms/entities/idiom.entity';

@Entity('saved_idioms')
@Unique(['user', 'idiom'])
export class SavedIdiomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.savedIdioms, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @ManyToOne(() => IdiomEntity, { onDelete: 'CASCADE' })
  idiom: IdiomEntity;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('srs_progress')
@Unique(['user', 'idiom'])
export class SRSProgressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.srsProgress, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @ManyToOne(() => IdiomEntity, { onDelete: 'CASCADE' })
  idiom: IdiomEntity;

  @Column({ default: 0 })
  interval: number;

  @Column({ default: 0 })
  repetition: number;

  @Column({ type: 'float', default: 2.5 })
  efactor: number;

  @Index()
  @Column({ type: 'bigint' })
  nextReviewDate: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('search_history')
export class HistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => IdiomEntity, { onDelete: 'CASCADE' })
  idiom: IdiomEntity;

  @CreateDateColumn()
  createdAt: Date;
}
