import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AdminProductsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createProduct(data: Prisma.ProductCreateInput): Promise<{
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
        price: Prisma.Decimal;
        stock: number;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        categoryId: number;
    }>;
    updateProduct(id: number, data: Prisma.ProductUpdateInput): Promise<{
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
        price: Prisma.Decimal;
        stock: number;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        categoryId: number;
    }>;
    findProductById(id: number): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        price: Prisma.Decimal;
        stock: number;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        categoryId: number;
    } | null>;
    findProductBySlug(slug: string): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        price: Prisma.Decimal;
        stock: number;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        categoryId: number;
    } | null>;
    ensureProductExists(id: number): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        price: Prisma.Decimal;
        stock: number;
        status: import("@prisma/client").$Enums.ProductStatus;
        deletedAt: Date | null;
        categoryId: number;
    }>;
    ensureUniqueProductSlug(slug: string, excludeId?: number): Promise<void>;
}
