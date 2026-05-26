import { OrderStatus, Prisma } from '@prisma/client';

export type OrderWithUserAndItems = Prisma.OrderGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        email: true;
        name: true;
      };
    };
    items: true;
  };
}>;

export class AdminOrderResponseDto {
  id: number;
  status: OrderStatus;
  total: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  items: {
    id: number;
    productId: number;
    productName: string;
    productPrice: string;
    quantity: number;
    subtotal: string;
  }[];

  constructor(order: OrderWithUserAndItems) {
    this.id = order.id;
    this.status = order.status;
    this.total = order.total.toString();
    this.address = order.address;
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
    this.user = order.user;
    this.items = order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productPrice: item.productPrice.toString(),
      quantity: item.quantity,
      subtotal: item.subtotal.toString(),
    }));
  }
}
