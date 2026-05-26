import { RedisService } from '../../redis/redis.service';
export declare class AdminProductsCacheService {
    private readonly redisService;
    constructor(redisService: RedisService);
    invalidateProductCache(oldSlug?: string, newSlug?: string): Promise<void>;
}
