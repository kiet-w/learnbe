import { Injectable } from '@nestjs/common';
import { CACHE_KEYS } from '../../common/constants/cache.constants';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class AdminCategoriesCacheService {
  constructor(private readonly redisService: RedisService) {}

  async invalidateCategoryCache() {
    await this.redisService.del(CACHE_KEYS.CATEGORIES);
    await this.redisService.reset();
  }
}
