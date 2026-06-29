import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BookModule } from './00-index/book-management/book.module';
import { UserModule } from './00-index/01-codebase-reading-guide/user/user.module';
import { BlogModule } from './00-index/01-codebase-reading-guide/blog/blog.module';
@Module({
  imports: [PrismaModule, BookModule, UserModule, BlogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
