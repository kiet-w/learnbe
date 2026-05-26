"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminProductsHelper = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let AdminProductsHelper = class AdminProductsHelper {
    formatProductCreateData(dto) {
        return {
            name: dto.name,
            slug: dto.slug,
            description: dto.description,
            price: new client_1.Prisma.Decimal(dto.price),
            stock: dto.stock,
            category: { connect: { id: dto.categoryId } },
            status: dto.status ?? client_1.ProductStatus.ACTIVE,
            images: dto.images?.length
                ? {
                    create: dto.images.map((image) => ({
                        url: image.url,
                        alt: image.alt,
                    })),
                }
                : undefined,
        };
    }
    formatProductUpdateData(dto) {
        const { images, price, categoryId, ...rest } = dto;
        return {
            ...rest,
            ...(price ? { price: new client_1.Prisma.Decimal(price) } : {}),
            ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
            ...(images
                ? {
                    images: {
                        deleteMany: {},
                        create: images.map((image) => ({
                            url: image.url,
                            alt: image.alt,
                        })),
                    },
                }
                : {}),
        };
    }
};
exports.AdminProductsHelper = AdminProductsHelper;
exports.AdminProductsHelper = AdminProductsHelper = __decorate([
    (0, common_1.Injectable)()
], AdminProductsHelper);
//# sourceMappingURL=admin-products.helper.js.map