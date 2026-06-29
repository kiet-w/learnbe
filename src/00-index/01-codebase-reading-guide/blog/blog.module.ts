import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { PrismaModule } from 'src/prisma/prisma.module'; // Đảm bảo đường dẫn này đúng với dự án của bạn

@Module({
  // 1. Import PrismaModule để UserService có thể xài được PrismaService bên trong nó
  imports: [PrismaModule],
  
  // 2. Khai báo UserController để tiếp nhận các HTTP Request (POST /users)
  controllers: [BlogController],
  
  // 3. Khai báo UserService để NestJS tự động tiêm (Inject) vào Controller
  providers: [BlogService],
})
export class BlogModule {}