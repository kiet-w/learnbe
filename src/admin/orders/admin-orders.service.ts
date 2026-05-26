import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { AdminOrderResponseDto, OrderWithUserAndItems } from './dto/admin-order-response.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminOrdersRepository } from './admin-orders.repository';

@Injectable()
export class AdminOrdersService {
  private readonly logger = new Logger(AdminOrdersService.name);

  constructor(private readonly repository: AdminOrdersRepository) {}

  async findOrders(query: AdminOrderQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = {
      ...(query.status ? { status: query.status } : {}),
    };

    const [orders, total] = await Promise.all([
      this.repository.findOrders(where, skip, limit),
      this.repository.countOrders(where),
    ]);

    return {
      data: (orders as OrderWithUserAndItems[]).map((order) => new AdminOrderResponseDto(order)),
      total,
      page,
      limit,
    };
  }

  async updateOrderStatus(
    adminUserId: number,
    orderId: number,
    dto: UpdateOrderStatusDto,
  ) {
    const existing = await this.repository.ensureOrderExists(orderId);

    const order = await this.repository.updateOrder(orderId, {
      status: dto.status,
    });

    this.logger.log(
      `Admin ${adminUserId} updated order ${order.id} status ${existing.status} -> ${dto.status}`,
    );

    return new AdminOrderResponseDto(order);
  }
}
