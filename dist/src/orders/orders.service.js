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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = OrdersService_1 = class OrdersService {
    prisma;
    logger = new common_1.Logger(OrdersService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkout(userId, dto) {
        try {
            const order = await this.prisma.$transaction(async (tx) => {
                const cart = await tx.cart.findFirst({
                    where: {
                        userId,
                        status: client_1.CartStatus.ACTIVE,
                    },
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                });
                if (!cart || cart.items.length === 0) {
                    throw new common_1.BadRequestException('Giỏ hàng trống');
                }
                for (const item of cart.items) {
                    if (item.product.status !== client_1.ProductStatus.ACTIVE ||
                        item.product.deletedAt) {
                        throw new common_1.BadRequestException('Sản phẩm không còn bán');
                    }
                    if (item.product.stock < item.quantity) {
                        throw new common_1.BadRequestException('Sản phẩm không đủ hàng');
                    }
                }
                const orderItemsData = cart.items.map((item) => ({
                    productId: item.productId,
                    productName: item.product.name,
                    productPrice: item.product.price,
                    quantity: item.quantity,
                    subtotal: item.product.price.mul(item.quantity),
                }));
                const total = orderItemsData.reduce((sum, item) => sum.plus(item.subtotal), new client_1.Prisma.Decimal(0));
                const order = await tx.order.create({
                    data: {
                        userId,
                        status: client_1.OrderStatus.PENDING,
                        total,
                        address: dto.address,
                        items: {
                            create: orderItemsData,
                        },
                    },
                    include: {
                        items: true,
                    },
                });
                for (const item of cart.items) {
                    const updated = await tx.product.updateMany({
                        where: {
                            id: item.productId,
                            status: client_1.ProductStatus.ACTIVE,
                            deletedAt: null,
                            stock: { gte: item.quantity },
                        },
                        data: {
                            stock: { decrement: item.quantity },
                        },
                    });
                    if (updated.count !== 1) {
                        throw new common_1.BadRequestException(`${item.product.name} không đủ hàng`);
                    }
                }
                await tx.cart.update({
                    where: { id: cart.id },
                    data: { status: client_1.CartStatus.COMPLETED },
                });
                return order;
            });
            this.logger.log(`Checkout success userId=${userId} orderId=${order.id} total=${order.total.toString()}`);
            return this.serializeOrder(order);
        }
        catch (error) {
            this.logger.warn(`Checkout failed userId=${userId} reason=${error instanceof Error ? error.message : 'unknown'}`);
            throw error;
        }
    }
    async findOrders(userId) {
        const orders = await this.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: true,
            },
        });
        return orders.map((order) => this.serializeOrder(order));
    }
    async findOrderById(userId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                userId,
            },
            include: {
                items: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Không tìm thấy đơn hàng');
        }
        return this.serializeOrder(order);
    }
    serializeOrder(order) {
        return {
            id: order.id,
            status: order.status,
            total: order.total.toString(),
            address: order.address,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            items: order.items.map((item) => ({
                id: item.id,
                productId: item.productId,
                productName: item.productName,
                productPrice: item.productPrice.toString(),
                quantity: item.quantity,
                subtotal: item.subtotal.toString(),
            })),
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map