import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CommentStatus } from '../entities/idiom-comment.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @IsString()
  @MinLength(5, { message: 'Nội dung phải có ít nhất 5 ký tự' })
  content: string;

  @IsNotEmpty({ message: 'ID thành ngữ không được để trống' })
  @Transform(({ value }) => String(value))
  idiomId: string;
}

export class UpdateCommentStatusDto {
  @IsEnum(CommentStatus, { message: 'Trạng thái không hợp lệ' })
  status: CommentStatus;
}

export class CommentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;

  @IsOptional()
  @Transform(({ value }) => (value ? String(value) : value))
  idiomId?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? String(value) : value))
  userId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  onlyReported?: boolean;
}
