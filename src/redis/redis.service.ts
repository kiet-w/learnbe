import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(key: string) {
    return await this.cacheManager.get(key);
  }

  async set(key: string, value: any, ttl: number = 30000) {
    await this.cacheManager.set(key, value, ttl);
  }

  async getOrSet(
    key: string,
    fetchFunction: () => Promise<any>,
    ttl: number = 30000,
  ) {
    const cachedData = await this.cacheManager.get(key);
    if (cachedData) {
      console.log(`⚡ Lấy [${key}] từ tủ lạnh Redis!`);
      return cachedData;
    }
    console.log(`🐌 Xuống hầm tìm dữ liệu cho [${key}]...`);
    const freshData = await fetchFunction();
    await this.cacheManager.set(key, freshData, ttl);

    return freshData;
  }

  async del(key: string) {
    await this.cacheManager.del(key);
  }

  async reset() {
    const cache = this.cacheManager as Cache & {
      clear?: () => Promise<void>;
      reset?: () => Promise<void>;
    };

    if (typeof cache.clear === 'function') {
      await cache.clear();
      return;
    }

    if (typeof cache.reset === 'function') {
      await cache.reset();
    }
  }
}
