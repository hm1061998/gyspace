import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class UserDataQueryDto extends PaginationQueryDto {}

export class UpdateSRSDto {
  idiomId: string;
  quality: number; // 0-5
}
