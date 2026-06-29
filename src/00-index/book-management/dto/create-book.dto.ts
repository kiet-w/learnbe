import {
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  author?: string | null;

  @IsString()
  @IsOptional()
  isbn?: string | null;

  @IsInt()
  @Min(1)
  pages!: number;

  @IsInt()
  @Min(1990)
  @Max(new Date().getFullYear())
  @IsOptional()
  publishYear?: number;
}
