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
var AdminCategoriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const admin_categories_repository_1 = require("./admin-categories.repository");
const admin_categories_cache_service_1 = require("./admin-categories-cache.service");
let AdminCategoriesService = AdminCategoriesService_1 = class AdminCategoriesService {
    repository;
    cacheService;
    logger = new common_1.Logger(AdminCategoriesService_1.name);
    constructor(repository, cacheService) {
        this.repository = repository;
        this.cacheService = cacheService;
    }
    async createCategory(adminUserId, dto) {
        await this.repository.ensureUniqueCategorySlug(dto.slug);
        const category = await this.repository.createCategory(dto);
        await this.cacheService.invalidateCategoryCache();
        this.logger.log(`Admin ${adminUserId} created category ${category.id}`);
        return category;
    }
    async updateCategory(adminUserId, id, dto) {
        await this.repository.ensureCategoryExists(id);
        if (dto.slug) {
            await this.repository.ensureUniqueCategorySlug(dto.slug, id);
        }
        const category = await this.repository.updateCategory(id, dto);
        await this.cacheService.invalidateCategoryCache();
        this.logger.log(`Admin ${adminUserId} updated category ${category.id}`);
        return category;
    }
};
exports.AdminCategoriesService = AdminCategoriesService;
exports.AdminCategoriesService = AdminCategoriesService = AdminCategoriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_categories_repository_1.AdminCategoriesRepository,
        admin_categories_cache_service_1.AdminCategoriesCacheService])
], AdminCategoriesService);
//# sourceMappingURL=admin-categories.service.js.map