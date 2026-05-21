"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const cache_constants_1 = require("../common/constants/cache.constants");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
let CartService = class CartService {
    prisma;
    redisService;
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
    }
    async getCart(userId) {
        return this.redisService.getOrSet(cache_constants_1.CACHE_KEYS.CART(userId), async () => {
            const cart = await this.getCartWithItems(userId);
            return this.serializeCart(cart);
        }, cache_constants_1.CACHE_TTL.CART);
    }
    async addItem(userId, dto) {
        const product = await this.validateProductAvailability(dto.productId, dto.quantity);
        const cart = await this.getOrCreateActiveCart(userId);
        const existingItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: dto.productId,
                },
            },
        });
        if (existingItem) {
            const finalQuantity = existingItem.quantity + dto.quantity;
            if (finalQuantity > product.stock) {
                throw new common_1.BadRequestException('Sản phẩm không đủ hàng');
            }
            await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: finalQuantity },
            });
        }
        else {
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: dto.productId,
                    quantity: dto.quantity,
                },
            });
        }
        return this.refreshCart(userId);
    }
    async updateItem(userId, itemId, dto) {
        const cartItem = await this.findOwnedCartItem(userId, itemId);
        await this.validateProductAvailability(cartItem.productId, dto.quantity);
        await this.prisma.cartItem.update({
            where: { id: cartItem.id },
            data: { quantity: dto.quantity },
        });
        return this.refreshCart(userId);
    }
    async removeItem(userId, itemId) {
        const cartItem = await this.findOwnedCartItem(userId, itemId);
        await this.prisma.cartItem.delete({
            where: { id: cartItem.id },
        });
        return this.refreshCart(userId);
    }
    async clearCart(userId) {
        const cart = await this.getOrCreateActiveCart(userId);
        await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
        return this.refreshCart(userId);
    }
    async refreshCart(userId) {
        await this.redisService.del(cache_constants_1.CACHE_KEYS.CART(userId));
        return this.getCart(userId);
    }
    async getOrCreateActiveCart(userId) {
        const existingCart = await this.prisma.cart.findFirst({
            where: {
                userId,
                status: client_1.CartStatus.ACTIVE,
            },
        });
        if (existingCart) {
            return existingCart;
        }
        return this.prisma.cart.create({
            data: {
                userId,
                status: client_1.CartStatus.ACTIVE,
            },
        });
    }
    async getCartWithItems(userId) {
        const cart = await this.getOrCreateActiveCart(userId);
        return this.prisma.cart.findUniqueOrThrow({
            where: { id: cart.id },
            include: {
                items: {
                    orderBy: { id: 'asc' },
                    include: {
                        product: true,
                    },
                },
            },
        });
    }
    async validateProductAvailability(productId, quantity) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Sản phẩm không tồn tại');
        }
        if (product.status !== client_1.ProductStatus.ACTIVE || product.deletedAt) {
            throw new common_1.BadRequestException('Sản phẩm không còn bán');
        }
        if (product.stock < quantity) {
            throw new common_1.BadRequestException('Sản phẩm không đủ hàng');
        }
        return product;
    }
    async findOwnedCartItem(userId, itemId) {
        const cartItem = await this.prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cart: {
                    userId,
                    status: client_1.CartStatus.ACTIVE,
                },
            },
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
        }
        return cartItem;
    }
    serializeCart(cart) {
        const subtotal = cart.items.reduce((sum, item) => sum.plus(item.product.price.mul(item.quantity)), new client_1.Prisma.Decimal(0));
        return {
            id: cart.id,
            items: cart.items.map((item) => ({
                id: item.id,
                productId: item.productId,
                name: item.product.name,
                slug: item.product.slug,
                price: item.product.price.toString(),
                quantity: item.quantity,
                subtotal: item.product.price.mul(item.quantity).toString(),
            })),
            totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: subtotal.toString(),
        };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], CartService);
//# sourceMappingURL=cart.service.js.map