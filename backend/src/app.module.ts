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
import { TraceMiddleware } from './common/middleware/trace.middleware';

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
        ],
        synchronize: true, // Lưu ý: Chỉ dùng true cho môi trường Dev để tự tạo bảng
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    IdiomsModule,
    AuthModule,
    UserDataModule,
    UserModule,
    IdiomCommentsModule,
    ...(isProd
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public', 'dist'),
            exclude: ['/api'],
          }),
        ]
      : []),
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware).forRoutes('*');
  }
}
