import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { success } from '../common/utils/api-response.util';
import { AuthGuard } from '../auth/auth.guard';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(
    @Req() request: Request & { user: JwtPayloadDto },
  ): Promise<ApiResponse<CartResponseDto>> {
    const cart = await this.cartService.getCart(request.user.userId);
    return success(cart);
  }

  @Post('items')
  async addItem(
    @Req() request: Request & { user: JwtPayloadDto },
    @Body() dto: AddCartItemDto,
  ): Promise<ApiResponse<CartResponseDto>> {
    const cart = await this.cartService.addItem(request.user.userId, dto);
    return success(cart);
  }

  @Patch('items/:id')
  async updateItem(
    @Req() request: Request & { user: JwtPayloadDto },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
  ): Promise<ApiResponse<CartResponseDto>> {
    const cart = await this.cartService.updateItem(
      request.user.userId,
      id,
      dto,
    );
    return success(cart);
  }

  @Delete('items/:id')
  async removeItem(
    @Req() request: Request & { user: JwtPayloadDto },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<CartResponseDto>> {
    const cart = await this.cartService.removeItem(request.user.userId, id);
    return success(cart);
  }

  @Delete()
  async clearCart(
    @Req() request: Request & { user: JwtPayloadDto },
  ): Promise<ApiResponse<CartResponseDto>> {
    const cart = await this.cartService.clearCart(request.user.userId);
    return success(cart);
  }
}
