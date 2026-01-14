import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateSRSDto {
  @IsNotEmpty()
  @Transform(({ value }) => String(value))
  idiomId: string;

  @IsOptional()
  @IsNumber()
  quality?: number;

  @IsOptional()
  @IsNumber()
  interval?: number;

  @IsOptional()
  @IsNumber()
  repetition?: number;

  @IsOptional()
  @IsNumber()
  efactor?: number;

  @IsOptional()
  @IsNumber()
  easeFactor?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? String(value) : value))
  nextReviewDate?: string;
}
