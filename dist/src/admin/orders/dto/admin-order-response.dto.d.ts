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
export declare class AdminOrderResponseDto {
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
    constructor(order: OrderWithUserAndItems);
}
