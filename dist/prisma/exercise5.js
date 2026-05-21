"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg(pool),
});
async function findUsersWithPosts() {
    console.log('--- Đang tạo dữ liệu mẫu cho Post ---');
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
        include: {
            posts: true,
        },
    });
    usersWithPosts.forEach((user) => {
        console.log(`\nUser: ${user.name} (${user.email})`);
        if (user.posts.length > 0) {
            console.log(`Số lượng bài viết: ${user.posts.length}`);
            console.table(user.posts);
        }
        else {
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
//# sourceMappingURL=exercise5.js.map