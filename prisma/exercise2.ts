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

async function findGmailUsers() {
  console.log('Đang tìm kiếm 2 User dùng Gmail đầu tiên...');

  const users = await prisma.user.findMany({
    // 1. Bộ lọc: Chỉ lấy người dùng @gmail.com
    where: {
      email: {
        contains: '@gmail.com',
        mode: 'insensitive',
      },
    },
    // 2. Sắp xếp: Tên từ A -> Z
    orderBy: {
      name: 'asc',
    },
    // 🔥 3. THỬ THÁCH: Giới hạn chỉ lấy đúng 2 người đầu tiên
    take: 2,
  });

  console.log('Kết quả tìm thấy sau khi giới hạn:');
  console.table(users);
}

findGmailUsers()
  .catch((e) => {
    console.error('Lỗi khi tìm kiếm:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Luôn nhớ đóng bãi xe tải an toàn nha!
    console.log('Đã đóng kết nối!');
  });
