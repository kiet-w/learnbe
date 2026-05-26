"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminProductsModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../../auth/auth.module");
const redis_module_1 = require("../../redis/redis.module");
const roles_guard_1 = require("../../common/guards/roles.guard");
const admin_products_controller_1 = require("./admin-products.controller");
const admin_products_service_1 = require("./admin-products.service");
const admin_products_repository_1 = require("./admin-products.repository");
const admin_products_helper_1 = require("./admin-products.helper");
const admin_products_cache_service_1 = require("./admin-products-cache.service");
const admin_categories_module_1 = require("../categories/admin-categories.module");
let AdminProductsModule = class AdminProductsModule {
};
exports.AdminProductsModule = AdminProductsModule;
exports.AdminProductsModule = AdminProductsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, redis_module_1.RedisModule, admin_categories_module_1.AdminCategoriesModule],
        controllers: [admin_products_controller_1.AdminProductsController],
        providers: [
            admin_products_service_1.AdminProductsService,
            admin_products_repository_1.AdminProductsRepository,
            admin_products_helper_1.AdminProductsHelper,
            admin_products_cache_service_1.AdminProductsCacheService,
            roles_guard_1.RolesGuard,
        ],
    })
], AdminProductsModule);
//# sourceMappingURL=admin-products.module.js.map