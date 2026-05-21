import { UserRole } from '@prisma/client';
import { Type, Exclude } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UserResponseDto {
  @IsInt()
  id!: number;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  name!: string | null;

  @IsEnum(UserRole)
  role!: UserRole;

  @Exclude()
  password?: string;

  @Exclude()
  refreshToken?: string | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

export class AuthResponseDto {
  @IsBoolean()
  success!: boolean;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  accessToken?: string;

  @ValidateNested()
  @Type(() => UserResponseDto)
  @IsOptional()
  user?: UserResponseDto;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
