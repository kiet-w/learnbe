"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCategoriesModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../../auth/auth.module");
const redis_module_1 = require("../../redis/redis.module");
const roles_guard_1 = require("../../common/guards/roles.guard");
const admin_categories_controller_1 = require("./admin-categories.controller");
const admin_categories_service_1 = require("./admin-categories.service");
const admin_categories_repository_1 = require("./admin-categories.repository");
const admin_categories_cache_service_1 = require("./admin-categories-cache.service");
let AdminCategoriesModule = class AdminCategoriesModule {
};
exports.AdminCategoriesModule = AdminCategoriesModule;
exports.AdminCategoriesModule = AdminCategoriesModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, redis_module_1.RedisModule],
        controllers: [admin_categories_controller_1.AdminCategoriesController],
        providers: [
            admin_categories_service_1.AdminCategoriesService,
            admin_categories_repository_1.AdminCategoriesRepository,
            admin_categories_cache_service_1.AdminCategoriesCacheService,
            roles_guard_1.RolesGuard,
        ],
        exports: [admin_categories_service_1.AdminCategoriesService, admin_categories_repository_1.AdminCategoriesRepository],
    })
], AdminCategoriesModule);
//# sourceMappingURL=admin-categories.module.js.map