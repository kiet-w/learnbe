import type { Request } from 'express';
import { JwtPayloadDto } from '../../auth/dto/jwt-payload.dto';
import { AdminOrdersService } from './admin-orders.service';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class AdminOrdersController {
    private readonly adminOrdersService;
    constructor(adminOrdersService: AdminOrdersService);
    getOrders(query: AdminOrderQueryDto): Promise<import("../../common/interfaces/api-response.interface").PaginatedApiResponse<import("./dto/admin-order-response.dto").AdminOrderResponseDto>>;
    updateOrderStatus(request: Request & {
        user: JwtPayloadDto;
    }, id: number, dto: UpdateOrderStatusDto): Promise<import("../../common/interfaces/api-response.interface").ApiResponse<import("./dto/admin-order-response.dto").AdminOrderResponseDto>>;
}
