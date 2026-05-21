# Giải Thích Chi Tiết - Module Prisma (`src/prisma`)

Prisma là một ORM (Object-Relational Mapping). Hiểu đơn giản, thay vì bạn phải viết câu lệnh SQL thủ công như `SELECT * FROM users`, Prisma cho phép bạn viết code Javascript/Typescript (`prisma.user.findMany()`) và nó sẽ tự dịch ra SQL giùm bạn.

## 1. `prisma.module.ts` (Khai báo Toàn Cục)

```typescript
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```
- `@Global()`: Đây là "bùa chú" rất mạnh. Nhờ gắn `@Global()`, Module Prisma trở thành của công cộng. Các module khác (như User, Auth, Cart) chỉ cần gọi `PrismaService` ra dùng mà **không cần** phải gõ `imports: [PrismaModule]` thêm một lần nào nữa.

## 2. `prisma.service.ts` (Cấu Hình Kết Nối)

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');

    // Dùng Pool của thư viện pg để tăng tốc độ
    const pool = new Pool({
      connectionString: databaseUrl,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
```
**Tại sao phải dùng `Pool` và `PrismaPg`?**
Bình thường Prisma có thể tự kết nối thẳng đến Database. Nhưng trong hệ thống lớn, nếu có 1000 người cùng vào web, mở 1000 kết nối Database sẽ làm sập máy chủ.
Việc dùng `Pool` (Hồ bơi kết nối) của thư viện `pg` giúp máy chủ mở sẵn một số lượng kết nối (ví dụ: 10). Ai cần thì nhảy vào dùng, dùng xong trả lại "hồ bơi" cho người khác dùng tiếp. Điều này giúp web chịu tải tốt hơn rất nhiều.

- `onModuleInit()`: Hàm này tự động chạy khi phần mềm khởi động, giúp thiết lập sẵn đường ống kết nối đến Database trước khi khách hàng đầu tiên truy cập.