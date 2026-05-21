import type { Request } from 'express';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(request: Request & {
        user: JwtPayloadDto;
    }): Promise<ApiResponse<CartResponseDto>>;
    addItem(request: Request & {
        user: JwtPayloadDto;
    }, dto: AddCartItemDto): Promise<ApiResponse<CartResponseDto>>;
    updateItem(request: Request & {
        user: JwtPayloadDto;
    }, id: number, dto: UpdateCartItemDto): Promise<ApiResponse<CartResponseDto>>;
    removeItem(request: Request & {
        user: JwtPayloadDto;
    }, id: number): Promise<ApiResponse<CartResponseDto>>;
    clearCart(request: Request & {
        user: JwtPayloadDto;
    }): Promise<ApiResponse<CartResponseDto>>;
}
