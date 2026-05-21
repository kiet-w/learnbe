import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  address!: string;
}
