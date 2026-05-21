import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// Load biến môi trường từ .env
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function findUsersWithPosts() {
  console.log('--- Đang tạo dữ liệu mẫu cho Post ---');

  // Lấy một user bất kỳ để tạo post
  const firstUser = await prisma.user.findFirst();

  if (firstUser) {
    await prisma.post.createMany({
      data: [
        {
          title: 'Bài viết số 1',
          content: 'Nội dung bài 1',
          authorId: firstUser.id,
        },
        {
          title: 'Bài viết số 2',
          content: 'Nội dung bài 2',
          authorId: firstUser.id,
          published: true,
        },
      ],
      skipDuplicates: true,
    });
    console.log(`Đã tạo 2 bài viết cho User: ${firstUser.name}`);
  }

  console.log('\n--- Truy vấn lồng nhau (Nested Queries) ---');
  console.log('Đang lấy danh sách User kèm theo các bài viết của họ...');

  const usersWithPosts = await prisma.user.findMany({
    // 🔥 Sử dụng include để lấy dữ liệu quan hệ
    include: {
      posts: true,
    },
  });

  // Hiển thị kết quả
  usersWithPosts.forEach((user) => {
    console.log(`\nUser: ${user.name} (${user.email})`);
    if (user.posts.length > 0) {
      console.log(`Số lượng bài viết: ${user.posts.length}`);
      console.table(user.posts);
    } else {
      console.log('Chưa có bài viết nào.');
    }
  });
}

findUsersWithPosts()
  .catch((e) => {
    console.error('Lỗi khi truy vấn:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
    console.log('\nĐã đóng kết nối!');
  });
