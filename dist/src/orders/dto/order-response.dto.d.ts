import { OrderStatus } from '@prisma/client';
export declare class OrderItemResponseDto {
    id: number;
    productId: number;
    productName: string;
    productPrice: string;
    quantity: number;
    subtotal: string;
}
export declare class OrderResponseDto {
    id: number;
    status: OrderStatus;
    total: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
    items: OrderItemResponseDto[];
}
