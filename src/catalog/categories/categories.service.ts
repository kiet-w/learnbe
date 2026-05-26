import { Injectable } from '@nestjs/common';
import { CACHE_KEYS, CACHE_TTL } from '../../common/constants/cache.constants';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async findCategories() {
    return this.redisService.getOrSet(
      CACHE_KEYS.CATEGORIES,
      async () => {
        const categories = await this.prisma.category.findMany({
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return categories;
      },
      CACHE_TTL.CATEGORIES,
    );
  }
}
