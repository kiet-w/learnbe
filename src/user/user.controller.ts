import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  SerializeOptions,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { UserResponseDto } from '../auth/dto/user-response.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Controller('users')
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @SerializeOptions({ type: UserResponseDto })
  async getMe(@Req() request: Request & { user: JwtPayloadDto }) {
    const user = await this.userService.findById(request.user.userId);
    if (!user) {
      throw new Error('User not found');
    }
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  }

  @Patch('me')
  @SerializeOptions({ type: UserResponseDto })
  async updateMe(
    @Req() request: Request & { user: JwtPayloadDto },
    @Body() dto: UpdateMeDto,
  ) {
    const updateData: UpdateUserDto = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.userService.update(request.user.userId, updateData);
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  }
}
