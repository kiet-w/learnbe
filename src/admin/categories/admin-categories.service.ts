import { Injectable, Logger } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminCategoriesRepository } from './admin-categories.repository';
import { AdminCategoriesCacheService } from './admin-categories-cache.service';

@Injectable()
export class AdminCategoriesService {
  private readonly logger = new Logger(AdminCategoriesService.name);

  constructor(
    private readonly repository: AdminCategoriesRepository,
    private readonly cacheService: AdminCategoriesCacheService,
  ) {}

  async createCategory(adminUserId: number, dto: CreateCategoryDto) {
    await this.repository.ensureUniqueCategorySlug(dto.slug);

    const category = await this.repository.createCategory(dto);

    await this.cacheService.invalidateCategoryCache();
    this.logger.log(`Admin ${adminUserId} created category ${category.id}`);

    return category;
  }

  async updateCategory(
    adminUserId: number,
    id: number,
    dto: UpdateCategoryDto,
  ) {
    await this.repository.ensureCategoryExists(id);

    if (dto.slug) {
      await this.repository.ensureUniqueCategorySlug(dto.slug, id);
    }

    const category = await this.repository.updateCategory(id, dto);

    await this.cacheService.invalidateCategoryCache();
    this.logger.log(`Admin ${adminUserId} updated category ${category.id}`);

    return category;
  }
}
