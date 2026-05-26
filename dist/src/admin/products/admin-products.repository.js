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
exports.AdminProductsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminProductsRepository = class AdminProductsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProduct(data) {
        return this.prisma.product.create({
            data,
            include: {
                images: true,
                category: true,
            },
        });
    }
    async updateProduct(id, data) {
        return this.prisma.product.update({
            where: { id },
            data,
            include: {
                images: true,
                category: true,
            },
        });
    }
    async findProductById(id) {
        return this.prisma.product.findUnique({
            where: { id },
        });
    }
    async findProductBySlug(slug) {
        return this.prisma.product.findUnique({
            where: { slug },
        });
    }
    async ensureProductExists(id) {
        const product = await this.findProductById(id);
        if (!product) {
            throw new common_1.NotFoundException('Sản phẩm không tồn tại');
        }
        return product;
    }
    async ensureUniqueProductSlug(slug, excludeId) {
        const existing = await this.findProductBySlug(slug);
        if (existing && existing.id !== excludeId) {
            throw new common_1.ConflictException('Slug sản phẩm đã tồn tại');
        }
    }
};
exports.AdminProductsRepository = AdminProductsRepository;
exports.AdminProductsRepository = AdminProductsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminProductsRepository);
//# sourceMappingURL=admin-products.repository.js.map