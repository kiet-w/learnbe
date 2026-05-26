import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { AuthGuard } from '../../auth/auth.guard';
import { JwtPayloadDto } from '../../auth/dto/jwt-payload.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { paginated, success } from '../../common/utils/api-response.util';
import { AdminOrdersService } from './admin-orders.service';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('admin/orders')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  async getOrders(@Query() query: AdminOrderQueryDto) {
    const result = await this.adminOrdersService.findOrders(query);
    return paginated(result.data, result.total, result.page, result.limit);
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Req() request: Request & { user: JwtPayloadDto },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.adminOrdersService.updateOrderStatus(
      request.user.userId,
      id,
      dto,
    );
    return success(order);
  }
}
