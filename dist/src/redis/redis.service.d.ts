import type { Cache } from 'cache-manager';
export declare class RedisService {
    private cacheManager;
    constructor(cacheManager: Cache);
    get(key: string): Promise<unknown>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    getOrSet(key: string, fetchFunction: () => Promise<any>, ttl?: number): Promise<any>;
    del(key: string): Promise<void>;
    reset(): Promise<void>;
}
