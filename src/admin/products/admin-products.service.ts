import { Injectable, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminProductsRepository } from './admin-products.repository';
import { AdminProductsHelper } from './admin-products.helper';
import { AdminProductsCacheService } from './admin-products-cache.service';
import { AdminCategoriesRepository } from '../categories/admin-categories.repository';

@Injectable()
export class AdminProductsService {
  private readonly logger = new Logger(AdminProductsService.name);

  constructor(
    private readonly repository: AdminProductsRepository,
    private readonly helper: AdminProductsHelper,
    private readonly cacheService: AdminProductsCacheService,
    private readonly categoriesRepository: AdminCategoriesRepository,
  ) {}

  async createProduct(adminUserId: number, dto: CreateProductDto) {
    await this.categoriesRepository.ensureCategoryExists(dto.categoryId);
    await this.repository.ensureUniqueProductSlug(dto.slug);

    const prismaData = this.helper.formatProductCreateData(dto);
    const product = await this.repository.createProduct(prismaData);

    await this.cacheService.invalidateProductCache(product.slug);
    this.logger.log(`Admin ${adminUserId} created product ${product.id}`);

    return product;
  }

  async updateProduct(adminUserId: number, id: number, dto: UpdateProductDto) {
    const existing = await this.repository.ensureProductExists(id);

    if (dto.categoryId) {
      await this.categoriesRepository.ensureCategoryExists(dto.categoryId);
    }

    if (dto.slug) {
      await this.repository.ensureUniqueProductSlug(dto.slug, id);
    }

    const updateData = this.helper.formatProductUpdateData(dto);
    const product = await this.repository.updateProduct(id, updateData);

    await this.cacheService.invalidateProductCache(existing.slug, product.slug);
    this.logger.log(`Admin ${adminUserId} updated product ${product.id}`);

    return product;
  }

  async softDeleteProduct(adminUserId: number, id: number) {
    const existing = await this.repository.ensureProductExists(id);
    const product = await this.repository.updateProduct(id, {
      deletedAt: new Date(),
    });

    await this.cacheService.invalidateProductCache(existing.slug, product.slug);
    this.logger.log(`Admin ${adminUserId} soft deleted product ${product.id}`);

    return product;
  }
}
