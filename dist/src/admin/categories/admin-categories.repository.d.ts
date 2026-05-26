import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AdminCategoriesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createCategory(data: Prisma.CategoryCreateInput): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateCategory(id: number, data: Prisma.CategoryUpdateInput): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findCategoryById(id: number): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findCategoryBySlug(slug: string): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    ensureCategoryExists(id: number): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    ensureUniqueCategorySlug(slug: string, excludeId?: number): Promise<void>;
}
