import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminCategoriesRepository } from './admin-categories.repository';
import { AdminCategoriesCacheService } from './admin-categories-cache.service';
export declare class AdminCategoriesService {
    private readonly repository;
    private readonly cacheService;
    private readonly logger;
    constructor(repository: AdminCategoriesRepository, cacheService: AdminCategoriesCacheService);
    createCategory(adminUserId: number, dto: CreateCategoryDto): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateCategory(adminUserId: number, id: number, dto: UpdateCategoryDto): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
