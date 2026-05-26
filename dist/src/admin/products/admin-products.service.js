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
var AdminProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminProductsService = void 0;
const common_1 = require("@nestjs/common");
const admin_products_repository_1 = require("./admin-products.repository");
const admin_products_helper_1 = require("./admin-products.helper");
const admin_products_cache_service_1 = require("./admin-products-cache.service");
const admin_categories_repository_1 = require("../categories/admin-categories.repository");
let AdminProductsService = AdminProductsService_1 = class AdminProductsService {
    repository;
    helper;
    cacheService;
    categoriesRepository;
    logger = new common_1.Logger(AdminProductsService_1.name);
    constructor(repository, helper, cacheService, categoriesRepository) {
        this.repository = repository;
        this.helper = helper;
        this.cacheService = cacheService;
        this.categoriesRepository = categoriesRepository;
    }
    async createProduct(adminUserId, dto) {
        await this.categoriesRepository.ensureCategoryExists(dto.categoryId);
        await this.repository.ensureUniqueProductSlug(dto.slug);
        const prismaData = this.helper.formatProductCreateData(dto);
        const product = await this.repository.createProduct(prismaData);
        await this.cacheService.invalidateProductCache(product.slug);
        this.logger.log(`Admin ${adminUserId} created product ${product.id}`);
        return product;
    }
    async updateProduct(adminUserId, id, dto) {
        const existing = await this.repository.ensureProductExists(id);
        if (dto.categoryId) {
            await this.categoriesRepository.ensureCategoryExists(dto.categoryId);
        }
        if (dto.slug) {
            await this.repository.ensureUniqueProductSlug(dto.slug, id);
        }
        const updateData = this.helper.formatProductUpdateData(dto);
        const product = await this.repository.updateProduct(id, updateData);
        await this.cacheService.invalidateProductCache(existing.slug, product.slug);
        this.logger.log(`Admin ${adminUserId} updated product ${product.id}`);
        return product;
    }
    async softDeleteProduct(adminUserId, id) {
        const existing = await this.repository.ensureProductExists(id);
        const product = await this.repository.updateProduct(id, {
            deletedAt: new Date(),
        });
        await this.cacheService.invalidateProductCache(existing.slug, product.slug);
        this.logger.log(`Admin ${adminUserId} soft deleted product ${product.id}`);
        return product;
    }
};
exports.AdminProductsService = AdminProductsService;
exports.AdminProductsService = AdminProductsService = AdminProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_products_repository_1.AdminProductsRepository,
        admin_products_helper_1.AdminProductsHelper,
        admin_products_cache_service_1.AdminProductsCacheService,
        admin_categories_repository_1.AdminCategoriesRepository])
], AdminProductsService);
//# sourceMappingURL=admin-products.service.js.map