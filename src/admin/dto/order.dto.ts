import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class AdminOrderQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}

export class AdminOrderResponseDto {
  id: number;
  status: OrderStatus;
  total: string;
  address: any;
  createdAt: Date;
  updatedAt: Date;
  user: any;
  items: any[];

  constructor(order: any) {
    this.id = order.id;
    this.status = order.status;
    this.total = order.total.toString();
    this.address = order.address;
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
    this.user = order.user;
    this.items = order.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productPrice: item.productPrice.toString(),
      quantity: item.quantity,
      subtotal: item.subtotal.toString(),
    }));
  }
}
