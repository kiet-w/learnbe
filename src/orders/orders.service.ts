import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CartStatus, OrderStatus, Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkout(userId: number, dto: CheckoutDto): Promise<OrderResponseDto> {
    try {
      const order = await this.prisma.$transaction(async (tx) => {
        const cart = await tx.cart.findFirst({
          where: {
            userId,
            status: CartStatus.ACTIVE,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        if (!cart || cart.items.length === 0) {
          throw new BadRequestException('Giỏ hàng trống');
        }

        for (const item of cart.items) {
          if (
            item.product.status !== ProductStatus.ACTIVE ||
            item.product.deletedAt
          ) {
            throw new BadRequestException('Sản phẩm không còn bán');
          }

          if (item.product.stock < item.quantity) {
            throw new BadRequestException('Sản phẩm không đủ hàng');
          }
        }

        const orderItemsData = cart.items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          productPrice: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price.mul(item.quantity),
        }));

        const total = orderItemsData.reduce(
          (sum, item) => sum.plus(item.subtotal),
          new Prisma.Decimal(0),
        );

        const order = await tx.order.create({
          data: {
            userId,
            status: OrderStatus.PENDING,
            total,
            address: dto.address,
            items: {
              create: orderItemsData,
            },
          },
          include: {
            items: true,
          },
        });

        for (const item of cart.items) {
          const updated = await tx.product.updateMany({
            where: {
              id: item.productId,
              status: ProductStatus.ACTIVE,
              deletedAt: null,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          if (updated.count !== 1) {
            throw new BadRequestException(`${item.product.name} không đủ hàng`);
          }
        }

        await tx.cart.update({
          where: { id: cart.id },
          data: { status: CartStatus.COMPLETED },
        });

        return order;
      });

      this.logger.log(
        `Checkout success userId=${userId} orderId=${order.id} total=${order.total.toString()}`,
      );

      return this.serializeOrder(order);
    } catch (error) {
      this.logger.warn(
        `Checkout failed userId=${userId} reason=${error instanceof Error ? error.message : 'unknown'}`,
      );
      throw error;
    }
  }

  async findOrders(userId: number): Promise<OrderResponseDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    return orders.map((order) => this.serializeOrder(order));
  }

  async findOrderById(
    userId: number,
    orderId: number,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return this.serializeOrder(order);
  }

  private serializeOrder(
    order: Prisma.OrderGetPayload<{
      include: {
        items: true;
      };
    }>,
  ): OrderResponseDto {
    return {
      id: order.id,
      status: order.status,
      total: order.total.toString(),
      address: order.address,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productPrice: item.productPrice.toString(),
        quantity: item.quantity,
        subtotal: item.subtotal.toString(),
      })),
    };
  }
}
