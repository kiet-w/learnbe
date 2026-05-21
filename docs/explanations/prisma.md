# Giải Thích Chuyên Sâu - Module Prisma (`src/prisma`)

Module Prisma trong dự án NestJS này không chỉ đơn thuần là việc khởi tạo ORM mặc định, mà nó được thiết kế theo chuẩn Enterprise với kiến trúc kết nối tối ưu, đặc biệt phù hợp cho các môi trường có luồng truy cập lớn và yêu cầu cao về hiệu năng.

## 1. Kiến Trúc Toàn Cục (`prisma.module.ts`)

Module này được đánh dấu bằng decorator `@Global()`. Đây là một thiết kế quan trọng trong NestJS:
- **Tái sử dụng liền mạch**: Khi `PrismaModule` được import một lần duy nhất vào `AppModule`, `PrismaService` sẽ tự động có mặt (injectable) ở khắp mọi nơi trong dự án (User, Catalog, Cart, Orders...) mà không cần phải lặp lại `imports: [PrismaModule]` ở từng module con.
- **Single Source of Truth**: Giảm thiểu việc khởi tạo nhiều instance không cần thiết, giúp quản lý vòng đời (lifecycle) của kết nối Database tại một nơi duy nhất.

## 2. Đi Sâu Vào `PrismaService` (`prisma.service.ts`)

`PrismaService` kế thừa trực tiếp từ `PrismaClient` và triển khai interface `OnModuleInit`. Đây là trung tâm đầu não của việc giao tiếp với cơ sở dữ liệu PostgreSQL.

### 2.1. Cơ Chế Khởi Tạo Chủ Động (`onModuleInit`)

NestJS cung cấp các lifecycle hook (vòng đời). Bằng cách implement `OnModuleInit`, hàm `onModuleInit()` sẽ được tự động gọi ngay sau khi module chứa nó được khởi tạo, nhưng **trước khi** ứng dụng bắt đầu nhận các HTTP requests đầu tiên.

```typescript
async onModuleInit() {
  await this.$connect();
}
```

- **Tại sao lại quan trọng?** Theo mặc định, Prisma thực hiện Lazy Connection (chỉ mở kết nối khi có câu query đầu tiên). Điều này sẽ làm request đầu tiên của người dùng bị chậm đáng kể do phải chịu chi phí thiết lập kết nối mạng (cold start).
- Hàm `onModuleInit` ép Prisma phải tạo sẵn kết nối (Eager Connection) ngay trong quá trình boot của server.
- **An toàn hệ thống**: Nhờ kết nối sớm, nếu cấu hình biến môi trường sai (như `DATABASE_URL` hỏng hoặc DB bị sập), server sẽ báo lỗi và từ chối khởi động ngay lập tức. Điều này ngăn chặn các lỗi ngầm định (silent failures) nguy hiểm khi runtime.

### 2.2. Tối Ưu Kết Nối Với Thư Viện Bên Thứ 3: `pg` Pool & Driver Adapter

Thay vì sử dụng Prisma Engine với giao thức kết nối TCP/Rust mặc định (dễ gây tắc nghẽn ở quy mô lớn), dự án này được tích hợp kiến trúc **Driver Adapter** tiên tiến:

```typescript
const pool = new Pool({
  connectionString: databaseUrl,
});
const adapter = new PrismaPg(pool);
super({ adapter });
```

- **`pg` (node-postgres) Pool**: `pg` là một thư viện native cực kỳ phổ biến của Node.js để tương tác với PostgreSQL. Ở đây ta khởi tạo một `Pool`. Một `Pool` giống như một hồ bơi chứa một tập hợp các kết nối (connections) được duy trì mở sẵn. Khi có hàng trăm request API đến cùng lúc, thay vì mỗi request phải tốn thời gian tạo một kết nối DB mới, chúng sẽ "mượn" một kết nối đang rảnh từ `Pool`, truy vấn xong thì trả lại. Thiết kế này ngăn chặn triệt để tình trạng cạn kiệt kết nối (connection exhaustion) thường khiến DB bị crash.
- **Adapter `@prisma/adapter-pg`**: Đây là cầu nối giữa Prisma và `pg`. Nó nhận các lệnh thao tác (findMany, create...) từ Prisma, biên dịch thành các truy vấn SQL, nhưng thay vì tự gửi đi, nó ủy quyền (delegate) việc thực thi câu SQL đó cho `pg` Pool.

## 3. Luồng Trả Về Dữ Liệu (Returns/Outputs)

Khi thực thi các phương thức của PrismaService (ví dụ `this.prisma.user.findUnique(...)`), kết quả trả về là các Promise chứa **Dữ liệu thô (Raw Data / Entities)**.

- **Đích đến**: Khối dữ liệu này tuyệt đối **không** được trả thẳng ra ngoài cho Controller (HTTP response).
- Nó sẽ đi ngược trở lại **Domain Services** (ví dụ `CatalogService`, `AuthService`, `UserService`...).
- Tại các Domain Service này, dữ liệu thô từ Prisma sẽ được xử lý logic nghiệp vụ: tính toán giảm giá, lọc bỏ các trường nhạy cảm (như mật khẩu), kiểm tra quyền, v.v., trước khi được ánh xạ (map) sang các DTO (Data Transfer Objects). Do đó, `PrismaService` đóng vai trò thuần túy là Data Access Layer siêu phàm, không can thiệp vào nghiệp vụ.
