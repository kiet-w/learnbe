import { Injectable } from '@nestjs/common';
import { CACHE_KEYS } from '../../common/constants/cache.constants';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class AdminProductsCacheService {
  constructor(private readonly redisService: RedisService) {}

  async invalidateProductCache(oldSlug?: string, newSlug?: string) {
    await this.redisService.reset();

    if (oldSlug) {
      await this.redisService.del(CACHE_KEYS.PRODUCT(oldSlug));
    }

    if (newSlug && newSlug !== oldSlug) {
      await this.redisService.del(CACHE_KEYS.PRODUCT(newSlug));
    }
  }
}
