import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({
      data,
      include: {
        images: true,
        category: true,
      },
    });
  }

  async updateProduct(id: number, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        images: true,
        category: true,
      },
    });
  }

  async findProductById(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async findProductBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
    });
  }

  async ensureProductExists(id: number) {
    const product = await this.findProductById(id);
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }
    return product;
  }

  async ensureUniqueProductSlug(slug: string, excludeId?: number) {
    const existing = await this.findProductBySlug(slug);
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Slug sản phẩm đã tồn tại');
    }
  }
}
