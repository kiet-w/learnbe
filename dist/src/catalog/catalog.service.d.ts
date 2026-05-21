import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ProductQueryDto } from './dto/product-query.dto';
type ProductListItem = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    stock: number;
    status: ProductStatus;
    category: {
        id: number;
        name: string;
        slug: string;
    };
    images: Array<{
        id: number;
        url: string;
        alt: string | null;
    }>;
};
type ProductDetail = ProductListItem & {
    createdAt: Date;
    updatedAt: Date;
};
export declare class CatalogService {
    private readonly prisma;
    private readonly redisService;
    constructor(prisma: PrismaService, redisService: RedisService);
    findCategories(): Promise<any>;
    findProducts(query: ProductQueryDto): Promise<any>;
    findProductBySlug(slug: string): Promise<ProductDetail>;
    private buildProductWhere;
    private getProductOrderBy;
    private getProductsCacheKey;
    private serializeProduct;
}
export {};
