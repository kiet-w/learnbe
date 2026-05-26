import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { RedisModule } from '../../redis/redis.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminCategoriesService } from './admin-categories.service';
import { AdminCategoriesRepository } from './admin-categories.repository';
import { AdminCategoriesCacheService } from './admin-categories-cache.service';

@Module({
  imports: [AuthModule, RedisModule],
  controllers: [AdminCategoriesController],
  providers: [
    AdminCategoriesService,
    AdminCategoriesRepository,
    AdminCategoriesCacheService,
    RolesGuard,
  ],
  exports: [AdminCategoriesService, AdminCategoriesRepository],
})
export class AdminCategoriesModule {}
