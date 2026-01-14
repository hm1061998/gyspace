import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { UserEntity } from './user/entities/user.entity';
import {
  IdiomEntity,
  CharacterAnalysisEntity,
  ExampleSentenceEntity,
} from './idioms/entities/idiom.entity';
import {
  SavedIdiomEntity,
  SRSProgressEntity,
  HistoryEntity,
} from './user-data/entities/user-data.entity';
import { IdiomCommentEntity } from './idiom-comments/entities/idiom-comment.entity';
import { DictionaryReportEntity } from './dictionary-reports/entities/dictionary-report.entity';
import { ExamPaperEntity } from './exam-papers/entities/exam-paper.entity';
import { ExamQuestionEntity } from './exam-papers/entities/exam-question.entity';
import { IpBlockEntity } from './common/security/ip-block.entity';
import { SearchLogEntity } from './idioms/entities/search-log.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    UserEntity,
    IdiomEntity,
    CharacterAnalysisEntity,
    ExampleSentenceEntity,
    SavedIdiomEntity,
    SRSProgressEntity,
    HistoryEntity,
    IdiomCommentEntity,
    IpBlockEntity,
    DictionaryReportEntity,
    ExamPaperEntity,
    ExamQuestionEntity,
    SearchLogEntity,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Always false for migrations
  ssl: {
    rejectUnauthorized: false,
  },
});
