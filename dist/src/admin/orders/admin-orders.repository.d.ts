import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AdminOrdersRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findOrders(where: Prisma.OrderWhereInput, skip: number, take: number): Promise<({
        user: {
            id: number;
            email: string;
            name: string | null;
        };
        items: {
            id: number;
            productId: number;
            quantity: number;
            productName: string;
            productPrice: Prisma.Decimal;
            subtotal: Prisma.Decimal;
            orderId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        userId: number;
        total: Prisma.Decimal;
        address: string;
    })[]>;
    countOrders(where: Prisma.OrderWhereInput): Promise<number>;
    findOrderById(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        userId: number;
        total: Prisma.Decimal;
        address: string;
    } | null>;
    ensureOrderExists(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        userId: number;
        total: Prisma.Decimal;
        address: string;
    }>;
    updateOrder(id: number, data: Prisma.OrderUpdateInput): Promise<{
        user: {
            id: number;
            email: string;
            name: string | null;
        };
        items: {
            id: number;
            productId: number;
            quantity: number;
            productName: string;
            productPrice: Prisma.Decimal;
            subtotal: Prisma.Decimal;
            orderId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        userId: number;
        total: Prisma.Decimal;
        address: string;
    }>;
}
