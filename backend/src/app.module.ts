/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  IdiomEntity,
  CharacterAnalysisEntity,
  ExampleSentenceEntity,
} from './idioms/entities/idiom.entity';
import { SearchLogEntity } from './idioms/entities/search-log.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { IdiomsModule } from './idioms/idioms.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health.controller';
import { UserEntity } from './user/entities/user.entity';
import {
  HistoryEntity,
  SavedIdiomEntity,
  SRSProgressEntity,
} from './user-data/entities/user-data.entity';
import { UserDataModule } from './user-data/user-data.module';
import { IdiomCommentsModule } from './idiom-comments/idiom-comments.module';
import { IdiomCommentEntity } from './idiom-comments/entities/idiom-comment.entity';
import { DictionaryReportsModule } from './dictionary-reports/dictionary-reports.module';
import { DictionaryReportEntity } from './dictionary-reports/entities/dictionary-report.entity';
import { ExamPapersModule } from './exam-papers/exam-papers.module';
import { ExamPaperEntity } from './exam-papers/entities/exam-paper.entity';
import { ExamQuestionEntity } from './exam-papers/entities/exam-question.entity';
import { TraceMiddleware } from './common/middleware/trace.middleware';
import { IpBlockEntity } from './common/security/ip-block.entity';
import { IpBlacklistGuard } from './common/guards/ip-blacklist.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerExceptionFilter } from './common/filters/throttler-exception.filter';
import { SecurityModule } from './common/security/security.module';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT') || '5432'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
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
        synchronize: !isProd, // Production: FALSE (use migrations). Dev: TRUE (auto sync).
        ssl: isProd
          ? {
              rejectUnauthorized: false,
            }
          : false,
      }),
      inject: [ConfigService],
    }),
    IdiomsModule,
    AuthModule,
    UserDataModule,
    UserModule,
    IdiomCommentsModule,
    DictionaryReportsModule,
    ExamPapersModule,
    SecurityModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // max 100 requests per minute
      },
    ]),
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: IpBlacklistGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware).forRoutes('*');
  }
}
