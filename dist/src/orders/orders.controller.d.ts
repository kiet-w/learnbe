import type { Request } from 'express';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    checkout(request: Request & {
        user: JwtPayloadDto;
    }, dto: CheckoutDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        id: number;
        status: import("@prisma/client").OrderStatus;
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
    }>>;
    getOrders(request: Request & {
        user: JwtPayloadDto;
    }): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        id: number;
        status: import("@prisma/client").OrderStatus;
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
    }[]>>;
    getOrderById(request: Request & {
        user: JwtPayloadDto;
    }, id: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        id: number;
        status: import("@prisma/client").OrderStatus;
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
    }>>;
}
