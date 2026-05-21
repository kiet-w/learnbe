import { OrderStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class AdminOrderQueryDto extends PaginationQueryDto {
    status?: OrderStatus;
}
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
}
export declare class AdminOrderResponseDto {
    id: number;
    status: OrderStatus;
    total: string;
    address: any;
    createdAt: Date;
    updatedAt: Date;
    user: any;
    items: any[];
    constructor(order: any);
}
