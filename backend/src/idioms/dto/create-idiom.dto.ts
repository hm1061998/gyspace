import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsUrl,
  ValidateNested,
  IsArray,
  ValidateIf,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCharacterAnalysisDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10, { message: 'Ký tự không được quá 10 ký tự' })
  character?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Pinyin không được quá 100 ký tự' })
  pinyin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Ý nghĩa không được quá 500 ký tự' })
  meaning?: string;
}

export class CreateExampleSentenceDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Câu tiếng Trung không được quá 1000 ký tự' })
  chinese?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Pinyin không được quá 1000 ký tự' })
  pinyin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Nghĩa tiếng Việt không được quá 1000 ký tự' })
  vietnamese?: string;
}

export class CreateIdiomDto {
  @IsNotEmpty({ message: 'Hán tự không được để trống' })
  @IsString()
  @MaxLength(100, { message: 'Hán tự không được quá 100 ký tự' })
  hanzi: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Pinyin không được quá 200 ký tự' })
  pinyin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Loại từ không được quá 50 ký tự' })
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Cấp độ không được quá 20 ký tự' })
  level?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Nguồn không được quá 100 ký tự' })
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Nghĩa tiếng Việt không được quá 2000 ký tự' })
  vietnameseMeaning?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Nghĩa đen không được quá 2000 ký tự' })
  literalMeaning?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Nghĩa bóng không được quá 2000 ký tự' })
  figurativeMeaning?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000, { message: 'Giải thích tiếng Trung không quá 4000 ký tự' })
  chineseDefinition?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Bối cảnh sử dụng không quá 2000 ký tự' })
  usageContext?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Nguồn gốc không quá 2000 ký tự' })
  origin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Ngữ pháp không quá 2000 ký tự' })
  grammar?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.imageUrl && o.imageUrl !== '')
  @IsUrl({}, { message: 'Đường dẫn hình ảnh không hợp lệ' })
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.videoUrl && o.videoUrl !== '')
  @IsUrl({}, { message: 'Đường dẫn video không hợp lệ' })
  videoUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCharacterAnalysisDto)
  analysis?: CreateCharacterAnalysisDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExampleSentenceDto)
  examples?: CreateExampleSentenceDto[];
}

export class BulkCreateIdiomDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIdiomDto)
  idioms: CreateIdiomDto[];
}
