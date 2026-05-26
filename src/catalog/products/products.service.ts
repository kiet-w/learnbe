import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { CACHE_KEYS, CACHE_TTL } from '../../common/constants/cache.constants';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { ProductQueryDto } from '../dto/product-query.dto';

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

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async findProducts(query: ProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const cacheKey = this.getProductsCacheKey(query, page, limit);
    const where = this.buildProductWhere(query);
    const orderBy = this.getProductOrderBy(query.sort);

    return this.redisService.getOrSet(
      cacheKey,
      async () => {
        const [items, total] = await Promise.all([
          this.prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              images: {
                select: {
                  id: true,
                  url: true,
                  alt: true,
                },
              },
            },
          }),
          this.prisma.product.count({ where }),
        ]);

        return {
          data: items.map((item) => this.serializeProduct(item)),
          total,
          page,
          limit,
        };
      },
      CACHE_TTL.PRODUCTS,
    );
  }

  async findProductBySlug(slug: string): Promise<ProductDetail> {
    return this.redisService.getOrSet(
      CACHE_KEYS.PRODUCT(slug),
      async () => {
        const product = await this.prisma.product.findFirst({
          where: {
            slug,
            status: ProductStatus.ACTIVE,
            deletedAt: null,
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            images: {
              select: {
                id: true,
                url: true,
                alt: true,
              },
            },
          },
        });

        if (!product) {
          throw new NotFoundException('Sản phẩm không tồn tại');
        }

        return {
          ...this.serializeProduct(product),
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        };
      },
      CACHE_TTL.PRODUCT,
    );
  }

  private buildProductWhere(query: ProductQueryDto): Prisma.ProductWhereInput {
    const search = query.search?.trim();
    const minPrice = query.minPrice
      ? new Prisma.Decimal(query.minPrice)
      : undefined;
    const maxPrice = query.maxPrice
      ? new Prisma.Decimal(query.maxPrice)
      : undefined;

    return {
      status: ProductStatus.ACTIVE,
      deletedAt: null,
      ...(query.category ? { categoryId: query.category } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice ? { gte: minPrice } : {}),
          ...(maxPrice ? { lte: maxPrice } : {}),
        },
      }),
    };
  }

  private getProductOrderBy(sort?: ProductQueryDto['sort']) {
    switch (sort) {
      case 'price_asc':
        return { price: 'asc' } as const;
      case 'price_desc':
        return { price: 'desc' } as const;
      case 'created_asc':
        return { createdAt: 'asc' } as const;
      case 'created_desc':
      default:
        return { createdAt: 'desc' } as const;
    }
  }

  private getProductsCacheKey(
    query: ProductQueryDto,
    page: number,
    limit: number,
  ): string {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));

    if (query.category) {
      params.set('category', String(query.category));
    }
    if (query.search) {
      params.set('search', query.search);
    }
    if (query.minPrice) {
      params.set('minPrice', query.minPrice);
    }
    if (query.maxPrice) {
      params.set('maxPrice', query.maxPrice);
    }
    if (query.sort) {
      params.set('sort', query.sort);
    }

    return `${CACHE_KEYS.PRODUCTS}:${params.toString()}`;
  }

  private serializeProduct(
    product: Prisma.ProductGetPayload<{
      include: {
        category: {
          select: {
            id: true;
            name: true;
            slug: true;
          };
        };
        images: {
          select: {
            id: true;
            url: true;
            alt: true;
          };
        };
      };
    }>,
  ): ProductListItem {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock,
      status: product.status,
      category: product.category,
      images: product.images,
    };
  }
}
