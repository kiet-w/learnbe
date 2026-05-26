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
var AdminOrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminOrdersService = void 0;
const common_1 = require("@nestjs/common");
const admin_order_response_dto_1 = require("./dto/admin-order-response.dto");
const admin_orders_repository_1 = require("./admin-orders.repository");
let AdminOrdersService = AdminOrdersService_1 = class AdminOrdersService {
    repository;
    logger = new common_1.Logger(AdminOrdersService_1.name);
    constructor(repository) {
        this.repository = repository;
    }
    async findOrders(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const where = {
            ...(query.status ? { status: query.status } : {}),
        };
        const [orders, total] = await Promise.all([
            this.repository.findOrders(where, skip, limit),
            this.repository.countOrders(where),
        ]);
        return {
            data: orders.map((order) => new admin_order_response_dto_1.AdminOrderResponseDto(order)),
            total,
            page,
            limit,
        };
    }
    async updateOrderStatus(adminUserId, orderId, dto) {
        const existing = await this.repository.ensureOrderExists(orderId);
        const order = await this.repository.updateOrder(orderId, {
            status: dto.status,
        });
        this.logger.log(`Admin ${adminUserId} updated order ${order.id} status ${existing.status} -> ${dto.status}`);
        return new admin_order_response_dto_1.AdminOrderResponseDto(order);
    }
};
exports.AdminOrdersService = AdminOrdersService;
exports.AdminOrdersService = AdminOrdersService = AdminOrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_orders_repository_1.AdminOrdersRepository])
], AdminOrdersService);
//# sourceMappingURL=admin-orders.service.js.map