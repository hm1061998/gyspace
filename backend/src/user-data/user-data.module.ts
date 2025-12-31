import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDataController } from './user-data.controller';
import { UserDataService } from './user-data.service';
import {
  SavedIdiomEntity,
  SRSProgressEntity,
  HistoryEntity,
} from 'src/user-data/entities/user-data.entities';
import { IdiomEntity } from 'src/idioms/entities/idiom.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SavedIdiomEntity,
      SRSProgressEntity,
      HistoryEntity,
      IdiomEntity,
    ]),
  ],
  controllers: [UserDataController],
  providers: [UserDataService],
})
export class UserDataModule {}
