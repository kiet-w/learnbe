import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrders(where: Prisma.OrderWhereInput, skip: number, take: number) {
    return this.prisma.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: true,
      },
    });
  }

  async countOrders(where: Prisma.OrderWhereInput) {
    return this.prisma.order.count({ where });
  }

  async findOrderById(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
    });
  }

  async ensureOrderExists(id: number) {
    const order = await this.findOrderById(id);
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return order;
  }

  async updateOrder(id: number, data: Prisma.OrderUpdateInput) {
    return this.prisma.order.update({
      where: { id },
      data,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }
}
