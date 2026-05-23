import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { CatalogModule } from './catalog/catalog.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    RedisModule,
    CatalogModule,
    CartModule,
    OrdersModule,
    AdminModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        if (configService.get<string>('NODE_ENV') === 'test') {
          return {
            ttl: 30 * 1000,
          };
        }

        return {
          store: await redisStore({
            url:
              configService.get<string>('REDIS_URL') ??
              'redis://localhost:6379',
            ttl: 30 * 1000, // 30 seconds
          }),
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // Loại bỏ các trường không được định nghĩa trong DTO
        transform: true, // Tự động convert kiểu dữ liệu (vd: string -> number)
        forbidNonWhitelisted: true, // Báo lỗi nếu gửi lên trường lạ
      }),
    },
  ],
})
export class AppModule {}
