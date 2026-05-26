import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminProductsRepository } from './admin-products.repository';
import { AdminProductsHelper } from './admin-products.helper';
import { AdminProductsCacheService } from './admin-products-cache.service';
import { AdminCategoriesRepository } from '../categories/admin-categories.repository';
export declare class AdminProductsService {
    private readonly repository;
    private readonly helper;
    private readonly cacheService;
    private readonly categoriesRepository;
    private readonly logger;
    constructor(repository: AdminProductsRepository, helper: AdminProductsHelper, cacheService: AdminProductsCacheService, categoriesRepository: AdminCategoriesRepository);
    createProduct(adminUserId: number, dto: CreateProductDto): Promise<{
        category: {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        images: {
            url: string;
            id: number;
            createdAt: Date;
            alt: string | null;
            productId: number;
        }[];
    } & {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        categoryId: number;
    }>;
    updateProduct(adminUserId: number, id: number, dto: UpdateProductDto): Promise<{
        category: {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        images: {
            url: string;
            id: number;
            createdAt: Date;
            alt: string | null;
            productId: number;
        }[];
    } & {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        categoryId: number;
    }>;
    softDeleteProduct(adminUserId: number, id: number): Promise<{
        category: {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        images: {
            url: string;
            id: number;
            createdAt: Date;
            alt: string | null;
            productId: number;
        }[];
    } & {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        categoryId: number;
    }>;
}
