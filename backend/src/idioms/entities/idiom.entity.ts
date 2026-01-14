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

  @Index({ fulltext: true }) // Btree index for exact match
  @Index('IDX_HANZI_GIN', { synchronize: false }) // Documentation for GIN Trigram index created via migration
  @Column({ unique: true, length: 100 })
  hanzi: string;

  @Index('IDX_PINYIN_GIN', { synchronize: false }) // Documentation for GIN Trigram index created via migration
  @Column({ length: 200, nullable: true })
  pinyin: string;

  @Column({ length: 50, nullable: true })
  type: string;

  @Column({ nullable: true, length: 20 })
  level: string;

  @Column({ nullable: true, length: 100 })
  source: string;

  // Chuyển sang text vì nghĩa có thể dài
  @Index('IDX_MEANING_GIN', { synchronize: false }) // Documentation for GIN Trigram index created via migration
  @Column({ type: 'text', nullable: true })
  vietnameseMeaning: string; //nghĩa tiếng Việt

  // Chuyển sang text
  @Column({ type: 'text', nullable: true })
  literalMeaning: string; //nghĩa đen

  @Column({ type: 'text', nullable: true })
  figurativeMeaning: string; //nghĩa bóng/thực tế

  @Column({ type: 'text', nullable: true })
  chineseDefinition: string; //nghĩa tiếng Trung

  @Column({ type: 'text', nullable: true })
  origin: string; //nguồn gốc

  @Column({ type: 'text', nullable: true })
  grammar: string; //ngữ pháp

  @Column({ nullable: true, length: 1000 })
  imageUrl: string; //hình ảnh

  @Column({ nullable: true, length: 1000 })
  videoUrl: string; //video

  @Column({ nullable: true, type: 'text' })
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

  @Column({ length: 10, nullable: true })
  character: string;

  @Column({ length: 100, nullable: true })
  pinyin: string;

  @Column({ length: 500, nullable: true })
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

  @Column({ type: 'text', nullable: true })
  chinese: string;

  @Column({ type: 'text', nullable: true })
  pinyin: string;

  @Column({ type: 'text', nullable: true })
  vietnamese: string;

  @ManyToOne(() => IdiomEntity, (idiom) => idiom.examples, {
    onDelete: 'CASCADE',
  })
  idiom: IdiomEntity;
}
