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
exports.AdminOrdersRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminOrdersRepository = class AdminOrdersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOrders(where, skip, take) {
        return this.prisma.order.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                items: true,
            },
        });
    }
    async countOrders(where) {
        return this.prisma.order.count({ where });
    }
    async findOrderById(id) {
        return this.prisma.order.findUnique({
            where: { id },
        });
    }
    async ensureOrderExists(id) {
        const order = await this.findOrderById(id);
        if (!order) {
            throw new common_1.NotFoundException('Không tìm thấy đơn hàng');
        }
        return order;
    }
    async updateOrder(id, data) {
        return this.prisma.order.update({
            where: { id },
            data,
            include: {
                items: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
    }
};
exports.AdminOrdersRepository = AdminOrdersRepository;
exports.AdminOrdersRepository = AdminOrdersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminOrdersRepository);
//# sourceMappingURL=admin-orders.repository.js.map