import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(data: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({
      data,
    });
  }

  async updateCategory(id: number, data: Prisma.CategoryUpdateInput) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async findCategoryById(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async findCategoryBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
    });
  }

  async ensureCategoryExists(id: number) {
    const category = await this.findCategoryById(id);
    if (!category) {
      throw new NotFoundException('Danh mục không tồn tại');
    }
    return category;
  }

  async ensureUniqueCategorySlug(slug: string, excludeId?: number) {
    const existing = await this.findCategoryBySlug(slug);
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Slug danh mục đã tồn tại');
    }
  }
}
