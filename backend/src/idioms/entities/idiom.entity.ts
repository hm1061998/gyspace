import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('idioms')
export class IdiomEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Index() // Index cho tìm kiếm chính xác
  @Column({ unique: true })
  hanzi: string;

  @Index() // Index cho tìm kiếm pinyin
  @Column()
  pinyin: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  level: string;

  @Column({ nullable: true })
  source: string;

  // Chuyển sang text vì nghĩa có thể dài
  @Column({ type: 'text' })
  vietnameseMeaning: string; //nghĩa tiếng Việt

  // Chuyển sang text
  @Column({ type: 'text', nullable: true })
  literalMeaning: string; //nghĩa đen

  @Column('text')
  figurativeMeaning: string; //nghĩa bóng/thực tế

  @Column({ type: 'text', nullable: true })
  chineseDefinition: string; //nghĩa tiếng Trung

  @Column({ type: 'text', nullable: true })
  origin: string; //nguồn gốc

  @Column({ type: 'text', nullable: true })
  grammar: string; //ngữ pháp

  @Column({ nullable: true })
  imageUrl: string; //hình ảnh

  @Column({ nullable: true })
  videoUrl: string; //video

  @Column({ nullable: true })
  usageContext: string; //bối cảnh sử dụng

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => CharacterAnalysisEntity, (analysis) => analysis.idiom, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  analysis: CharacterAnalysisEntity[]; // phân tích các ký tự

  @OneToMany(() => ExampleSentenceEntity, (example) => example.idiom, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  examples: ExampleSentenceEntity[]; // ví dụ
}

@Entity('character_analysis')
export class CharacterAnalysisEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character: string;

  @Column()
  pinyin: string;

  @Column()
  meaning: string;

  @ManyToOne(() => IdiomEntity, (idiom) => idiom.analysis, {
    onDelete: 'CASCADE',
  })
  idiom: IdiomEntity;
}

@Entity('example_sentences')
export class ExampleSentenceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  chinese: string;

  @Column()
  pinyin: string;

  @Column('text')
  vietnamese: string;

  @ManyToOne(() => IdiomEntity, (idiom) => idiom.examples, {
    onDelete: 'CASCADE',
  })
  idiom: IdiomEntity;
}
