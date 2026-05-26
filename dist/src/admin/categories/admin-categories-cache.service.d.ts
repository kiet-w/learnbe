import { RedisService } from '../../redis/redis.service';
export declare class AdminCategoriesCacheService {
    private readonly redisService;
    constructor(redisService: RedisService);
    invalidateCategoryCache(): Promise<void>;
}
