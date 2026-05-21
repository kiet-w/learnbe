import type { Request } from 'express';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(request: Request & {
        user: JwtPayloadDto;
    }): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        id: number;
        items: Array<{
            id: number;
            productId: number;
            name: string;
            slug: string;
            price: string;
            quantity: number;
            subtotal: string;
        }>;
        totalItems: number;
        subtotal: string;
    }>>;
    addItem(request: Request & {
        user: JwtPayloadDto;
    }, dto: AddCartItemDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        id: number;
        items: Array<{
            id: number;
            productId: number;
            name: string;
            slug: string;
            price: string;
            quantity: number;
            subtotal: string;
        }>;
        totalItems: number;
        subtotal: string;
    }>>;
    updateItem(request: Request & {
        user: JwtPayloadDto;
    }, id: number, dto: UpdateCartItemDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        id: number;
        items: Array<{
            id: number;
            productId: number;
            name: string;
            slug: string;
            price: string;
            quantity: number;
            subtotal: string;
        }>;
        totalItems: number;
        subtotal: string;
    }>>;
    removeItem(request: Request & {
        user: JwtPayloadDto;
    }, id: number): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        id: number;
        items: Array<{
            id: number;
            productId: number;
            name: string;
            slug: string;
            price: string;
            quantity: number;
            subtotal: string;
        }>;
        totalItems: number;
        subtotal: string;
    }>>;
    clearCart(request: Request & {
        user: JwtPayloadDto;
    }): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        id: number;
        items: Array<{
            id: number;
            productId: number;
            name: string;
            slug: string;
            price: string;
            quantity: number;
            subtotal: string;
        }>;
        totalItems: number;
        subtotal: string;
    }>>;
}
