import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderResponseDto } from './dto/order-response.dto';
export declare class OrdersService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    checkout(userId: number, dto: CheckoutDto): Promise<OrderResponseDto>;
    findOrders(userId: number): Promise<OrderResponseDto[]>;
    findOrderById(userId: number, orderId: number): Promise<OrderResponseDto>;
    private serializeOrder;
}
