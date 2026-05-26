import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import { AdminCategoriesService } from './admin-categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('admin/categories')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCategoriesController {
  constructor(
    private readonly adminCategoriesService: AdminCategoriesService,
  ) {}

  @Post()
  async createCategory(
    @Req() request: Request & { user: JwtPayloadDto },
    @Body() dto: CreateCategoryDto,
  ) {
    const category = await this.adminCategoriesService.createCategory(
      request.user.userId,
      dto,
    );
    return success(category);
  }

  @Patch(':id')
  async updateCategory(
    @Req() request: Request & { user: JwtPayloadDto },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    const category = await this.adminCategoriesService.updateCategory(
      request.user.userId,
      id,
      dto,
    );
    return success(category);
  }
}
