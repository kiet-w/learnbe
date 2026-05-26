import { Injectable } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class AdminProductsHelper {
  formatProductCreateData(dto: CreateProductDto): Prisma.ProductCreateInput {
    return {
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      price: new Prisma.Decimal(dto.price),
      stock: dto.stock,
      category: { connect: { id: dto.categoryId } },
      status: dto.status ?? ProductStatus.ACTIVE,
      images: dto.images?.length
        ? {
            create: dto.images.map((image) => ({
              url: image.url,
              alt: image.alt,
            })),
          }
        : undefined,
    };
  }

  formatProductUpdateData(dto: UpdateProductDto): Prisma.ProductUpdateInput {
    const { images, price, categoryId, ...rest } = dto;
    return {
      ...rest,
      ...(price ? { price: new Prisma.Decimal(price) } : {}),
      ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      ...(images
        ? {
            images: {
              deleteMany: {},
              create: images.map((image) => ({
                url: image.url,
                alt: image.alt,
              })),
            },
          }
        : {}),
    };
  }
}
