import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateSRSDto {
  @IsNotEmpty()
  @IsString()
  idiomId: string;

  @IsNotEmpty()
  @IsNumber()
  interval: number;

  @IsNotEmpty()
  @IsNumber()
  repetition: number;

  @IsNotEmpty()
  @IsNumber()
  efactor: number;

  @IsNotEmpty()
  nextReviewDate: string | number;
}
