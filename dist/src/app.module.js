"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const redis_module_1 = require("./redis/redis.module");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const products_module_1 = require("./catalog/products/products.module");
const categories_module_1 = require("./catalog/categories/categories.module");
const cart_module_1 = require("./cart/cart.module");
const orders_module_1 = require("./orders/orders.module");
const admin_users_module_1 = require("./admin/users/admin-users.module");
const admin_products_module_1 = require("./admin/products/admin-products.module");
const admin_categories_module_1 = require("./admin/categories/admin-categories.module");
const admin_orders_module_1 = require("./admin/orders/admin-orders.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            redis_module_1.RedisModule,
            products_module_1.CatalogProductsModule,
            categories_module_1.CatalogCategoriesModule,
            cart_module_1.CartModule,
            orders_module_1.OrdersModule,
            admin_users_module_1.AdminUsersModule,
            admin_products_module_1.AdminProductsModule,
            admin_categories_module_1.AdminCategoriesModule,
            admin_orders_module_1.AdminOrdersModule,
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                inject: [config_1.ConfigService],
                useFactory: async (configService) => {
                    if (configService.get('NODE_ENV') === 'test') {
                        return {
                            ttl: 30 * 1000,
                        };
                    }
                    return {
                        store: await (0, cache_manager_redis_yet_1.redisStore)({
                            url: configService.get('REDIS_URL') ??
                                'redis://localhost:6379',
                            ttl: 30 * 1000,
                        }),
                    };
                },
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_PIPE,
                useValue: new common_1.ValidationPipe({
                    whitelist: true,
                    transform: true,
                    forbidNonWhitelisted: true,
                }),
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map