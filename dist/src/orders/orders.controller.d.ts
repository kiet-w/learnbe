import type { Request } from 'express';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    checkout(request: Request & {
        user: JwtPayloadDto;
    }, dto: CheckoutDto): Promise<ApiResponse<OrderResponseDto>>;
    getOrders(request: Request & {
        user: JwtPayloadDto;
    }): Promise<ApiResponse<OrderResponseDto[]>>;
    getOrderById(request: Request & {
        user: JwtPayloadDto;
    }, id: number): Promise<ApiResponse<OrderResponseDto>>;
}
