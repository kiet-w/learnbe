import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export class JwtPayloadDto {
  @IsInt()
  @IsNotEmpty()
  userId!: number;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
}
