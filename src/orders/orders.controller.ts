import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { success } from '../common/utils/api-response.util';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  async checkout(
    @Req() request: Request & { user: JwtPayloadDto },
    @Body() dto: CheckoutDto,
  ): Promise<ApiResponse<OrderResponseDto>> {
    const order = await this.ordersService.checkout(request.user.userId, dto);
    return success(order);
  }

  @Get()
  async getOrders(
    @Req() request: Request & { user: JwtPayloadDto },
  ): Promise<ApiResponse<OrderResponseDto[]>> {
    const orders = await this.ordersService.findOrders(request.user.userId);
    return success(orders);
  }

  @Get(':id')
  async getOrderById(
    @Req() request: Request & { user: JwtPayloadDto },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<OrderResponseDto>> {
    const order = await this.ordersService.findOrderById(
      request.user.userId,
      id,
    );
    return success(order);
  }
}
