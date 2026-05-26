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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const cache_constants_1 = require("../../common/constants/cache.constants");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../redis/redis.service");
let ProductsService = class ProductsService {
    prisma;
    redisService;
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
    }
    async findProducts(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const cacheKey = this.getProductsCacheKey(query, page, limit);
        const where = this.buildProductWhere(query);
        const orderBy = this.getProductOrderBy(query.sort);
        return this.redisService.getOrSet(cacheKey, async () => {
            const [items, total] = await Promise.all([
                this.prisma.product.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy,
                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                        images: {
                            select: {
                                id: true,
                                url: true,
                                alt: true,
                            },
                        },
                    },
                }),
                this.prisma.product.count({ where }),
            ]);
            return {
                data: items.map((item) => this.serializeProduct(item)),
                total,
                page,
                limit,
            };
        }, cache_constants_1.CACHE_TTL.PRODUCTS);
    }
    async findProductBySlug(slug) {
        return this.redisService.getOrSet(cache_constants_1.CACHE_KEYS.PRODUCT(slug), async () => {
            const product = await this.prisma.product.findFirst({
                where: {
                    slug,
                    status: client_1.ProductStatus.ACTIVE,
                    deletedAt: null,
                },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                    images: {
                        select: {
                            id: true,
                            url: true,
                            alt: true,
                        },
                    },
                },
            });
            if (!product) {
                throw new common_1.NotFoundException('Sản phẩm không tồn tại');
            }
            return {
                ...this.serializeProduct(product),
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
            };
        }, cache_constants_1.CACHE_TTL.PRODUCT);
    }
    buildProductWhere(query) {
        const search = query.search?.trim();
        const minPrice = query.minPrice
            ? new client_1.Prisma.Decimal(query.minPrice)
            : undefined;
        const maxPrice = query.maxPrice
            ? new client_1.Prisma.Decimal(query.maxPrice)
            : undefined;
        return {
            status: client_1.ProductStatus.ACTIVE,
            deletedAt: null,
            ...(query.category ? { categoryId: query.category } : {}),
            ...(search
                ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : {}),
            ...((minPrice || maxPrice) && {
                price: {
                    ...(minPrice ? { gte: minPrice } : {}),
                    ...(maxPrice ? { lte: maxPrice } : {}),
                },
            }),
        };
    }
    getProductOrderBy(sort) {
        switch (sort) {
            case 'price_asc':
                return { price: 'asc' };
            case 'price_desc':
                return { price: 'desc' };
            case 'created_asc':
                return { createdAt: 'asc' };
            case 'created_desc':
            default:
                return { createdAt: 'desc' };
        }
    }
    getProductsCacheKey(query, page, limit) {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (query.category) {
            params.set('category', String(query.category));
        }
        if (query.search) {
            params.set('search', query.search);
        }
        if (query.minPrice) {
            params.set('minPrice', query.minPrice);
        }
        if (query.maxPrice) {
            params.set('maxPrice', query.maxPrice);
        }
        if (query.sort) {
            params.set('sort', query.sort);
        }
        return `${cache_constants_1.CACHE_KEYS.PRODUCTS}:${params.toString()}`;
    }
    serializeProduct(product) {
        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price.toString(),
            stock: product.stock,
            status: product.status,
            category: product.category,
            images: product.images,
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], ProductsService);
//# sourceMappingURL=products.service.js.map