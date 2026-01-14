import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdiomsController } from './idioms.controller';
import { IdiomsService } from './idioms.service';
import {
  IdiomEntity,
  CharacterAnalysisEntity,
  ExampleSentenceEntity,
} from './entities/idiom.entity';
import { SearchLogEntity } from './entities/search-log.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IdiomEntity,
      CharacterAnalysisEntity,
      ExampleSentenceEntity,
      SearchLogEntity,
      UserEntity,
    ]),
  ],
  controllers: [IdiomsController],
  providers: [IdiomsService],
})
export class IdiomsModule {}
