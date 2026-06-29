import {
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class UpdateBookDto {
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
  @IsOptional()
  @Min(1990)
  @Max(new Date().getFullYear())
  publishYear?: number;

  @IsInt()
  @Min(1)
  pages!: number;
}
