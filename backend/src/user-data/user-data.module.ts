import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDataController } from './user-data.controller';
import { UserDataService } from './user-data.service';
import {
  SavedIdiomEntity,
  SRSProgressEntity,
  HistoryEntity,
} from 'src/user-data/entities/user-data.entity';
import { IdiomEntity } from 'src/idioms/entities/idiom.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SavedIdiomEntity,
      SRSProgressEntity,
      HistoryEntity,
      IdiomEntity,
      UserEntity,
    ]),
  ],
  controllers: [UserDataController],
  providers: [UserDataService],
})
export class UserDataModule {}
