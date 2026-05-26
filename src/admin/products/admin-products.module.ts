import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { RedisModule } from '../../redis/redis.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { AdminProductsRepository } from './admin-products.repository';
import { AdminProductsHelper } from './admin-products.helper';
import { AdminProductsCacheService } from './admin-products-cache.service';
import { AdminCategoriesModule } from '../categories/admin-categories.module';

@Module({
  imports: [AuthModule, RedisModule, AdminCategoriesModule],
  controllers: [AdminProductsController],
  providers: [
    AdminProductsService,
    AdminProductsRepository,
    AdminProductsHelper,
    AdminProductsCacheService,
    RolesGuard,
  ],
})
export class AdminProductsModule {}
