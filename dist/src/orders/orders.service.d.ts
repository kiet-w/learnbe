import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
type OrderResponse = {
    id: number;
    status: OrderStatus;
    total: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
        id: number;
        productId: number;
        productName: string;
        productPrice: string;
        quantity: number;
        subtotal: string;
    }>;
};
export declare class OrdersService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    checkout(userId: number, dto: CheckoutDto): Promise<OrderResponse>;
    findOrders(userId: number): Promise<OrderResponse[]>;
    findOrderById(userId: number, orderId: number): Promise<OrderResponse>;
    private serializeOrder;
}
export {};
