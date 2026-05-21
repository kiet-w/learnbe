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
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { success } from '../common/utils/api-response.util';
import { CheckoutDto } from './dto/checkout.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  async checkout(
    @Req() request: Request & { user: JwtPayloadDto },
    @Body() dto: CheckoutDto,
  ) {
    const order = await this.ordersService.checkout(request.user.userId, dto);
    return success(order);
  }

  @Get()
  async getOrders(@Req() request: Request & { user: JwtPayloadDto }) {
    const orders = await this.ordersService.findOrders(request.user.userId);
    return success(orders);
  }

  @Get(':id')
  async getOrderById(
    @Req() request: Request & { user: JwtPayloadDto },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const order = await this.ordersService.findOrderById(
      request.user.userId,
      id,
    );
    return success(order);
  }
}
