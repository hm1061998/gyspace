import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('ip_blocks')
export class IpBlockEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ length: 50 })
  ip: string;

  @Column({ type: 'timestamp' })
  blockedUntil: Date;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ default: 0 })
  violationCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
