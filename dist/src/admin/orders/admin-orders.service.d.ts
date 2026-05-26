import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { AdminOrderResponseDto } from './dto/admin-order-response.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminOrdersRepository } from './admin-orders.repository';
export declare class AdminOrdersService {
    private readonly repository;
    private readonly logger;
    constructor(repository: AdminOrdersRepository);
    findOrders(query: AdminOrderQueryDto): Promise<{
        data: AdminOrderResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateOrderStatus(adminUserId: number, orderId: number, dto: UpdateOrderStatusDto): Promise<AdminOrderResponseDto>;
}
