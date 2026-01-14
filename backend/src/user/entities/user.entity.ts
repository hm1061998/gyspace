import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import {
  SavedIdiomEntity,
  SRSProgressEntity,
} from '../../user-data/entities/user-data.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true, length: 20 })
  username: string;

  @Column({ length: 255 }) // Pass can be long after hashing
  password: string;

  @Column({ nullable: true, length: 50 })
  displayName: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ type: 'varchar', nullable: true, select: false })
  refreshToken: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 0 })
  xp: number;

  @Column({ default: 1 })
  level: number;

  @OneToMany(() => SavedIdiomEntity, (saved) => saved.user)
  savedIdioms: SavedIdiomEntity[];

  @OneToMany(() => SRSProgressEntity, (srs) => srs.user)
  srsProgress: SRSProgressEntity[];
}
