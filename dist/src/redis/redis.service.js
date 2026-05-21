"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
let RedisService = class RedisService {
    cacheManager;
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
    }
    async get(key) {
        return await this.cacheManager.get(key);
    }
    async set(key, value, ttl = 30000) {
        await this.cacheManager.set(key, value, ttl);
    }
    async getOrSet(key, fetchFunction, ttl = 30000) {
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
    async del(key) {
        await this.cacheManager.del(key);
    }
    async reset() {
        const cache = this.cacheManager;
        if (typeof cache.clear === 'function') {
            await cache.clear();
            return;
        }
        if (typeof cache.reset === 'function') {
            await cache.reset();
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], RedisService);
//# sourceMappingURL=redis.service.js.map