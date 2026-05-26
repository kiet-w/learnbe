import {
  Body,
  Controller,
  Delete,
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
import { AdminProductsService } from './admin-products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('admin/products')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Post()
  async createProduct(
    @Req() request: Request & { user: JwtPayloadDto },
    @Body() dto: CreateProductDto,
  ) {
    const product = await this.adminProductsService.createProduct(
      request.user.userId,
      dto,
    );
    return success(product);
  }

  @Patch(':id')
  async updateProduct(
    @Req() request: Request & { user: JwtPayloadDto },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    const product = await this.adminProductsService.updateProduct(
      request.user.userId,
      id,
      dto,
    );
    return success(product);
  }

  @Delete(':id')
  async softDeleteProduct(
    @Req() request: Request & { user: JwtPayloadDto },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const product = await this.adminProductsService.softDeleteProduct(
      request.user.userId,
      id,
    );
    return success(product);
  }
}
