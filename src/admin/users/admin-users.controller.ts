import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { AuthGuard } from '../../auth/auth.guard';
import { JwtPayloadDto } from '../../auth/dto/jwt-payload.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { success } from '../../common/utils/api-response.util';
import { AdminUsersService } from './admin-users.service';

@Controller('admin/users')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async getUsers() {
    const users = await this.adminUsersService.findUsers();
    return success(users);
  }

  @Patch(':id/lock')
  async toggleUserLock(
    @Req() request: Request & { user: JwtPayloadDto },
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    const user = await this.adminUsersService.toggleUserLock(
      request.user.userId,
      id,
      isActive,
    );
    return success(user);
  }
}
