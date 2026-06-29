import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BookModule } from './00-index/book-management/book.module';
import { UserModule } from './00-index/01-codebase-reading-guide/user/user.module';
import { BlogModule } from './00-index/01-codebase-reading-guide/blog/blog.module';
import { RequestIdMiddleware } from './00-index/01-codebase-reading-guide/common/middlewares/request-id.middleware';

@Module({
  imports: [PrismaModule, BookModule, UserModule, BlogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Áp dụng RequestIdMiddleware cho TẤT CẢ route
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
