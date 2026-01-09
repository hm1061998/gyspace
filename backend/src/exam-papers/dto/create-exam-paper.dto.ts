import { IsString, IsOptional } from 'class-validator';

export class CreateExamPaperDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
