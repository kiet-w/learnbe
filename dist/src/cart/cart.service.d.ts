import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
type CartResponse = {
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
};
export declare class CartService {
    private readonly prisma;
    private readonly redisService;
    constructor(prisma: PrismaService, redisService: RedisService);
    getCart(userId: number): Promise<CartResponse>;
    addItem(userId: number, dto: AddCartItemDto): Promise<CartResponse>;
    updateItem(userId: number, itemId: number, dto: UpdateCartItemDto): Promise<CartResponse>;
    removeItem(userId: number, itemId: number): Promise<CartResponse>;
    clearCart(userId: number): Promise<CartResponse>;
    private refreshCart;
    private getOrCreateActiveCart;
    private getCartWithItems;
    private validateProductAvailability;
    private findOwnedCartItem;
    private serializeCart;
}
export {};
