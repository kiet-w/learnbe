# Tổng quan Kiến trúc: NestJS Backend (Mô hình Nhà Hàng)

Dựa trên việc phân tích mã nguồn (`src/`), database schema (`prisma/schema.prisma`), và cấu hình (`package.json`), dưới đây là báo cáo chi tiết về toàn bộ hệ thống Backend.

## 1. Stack Công Nghệ (Tech Stack)
Hệ thống sử dụng các công nghệ cực kỳ hiện đại và mạnh mẽ:
- **Framework:** NestJS (Phiên bản v11).
- **Database ORM:** Prisma v7.8 (hỗ trợ `driverAdapters` cho hiệu năng cao).
- **Database:** PostgreSQL (kết nối qua Supabase/pgbouncer).
- **Caching:** Redis (`@nestjs/cache-manager`, `cache-manager-redis-yet`) dùng để tối ưu tốc độ và chặn spam (rate limit).
- **Bảo mật:** `jsonwebtoken` (JWT) cho Authentication và `bcryptjs` để mã hóa mật khẩu.
- **Data Validation:** `class-validator` và `class-transformer` dùng trong Pipe để lọc dữ liệu.

---

## 2. Giải Phẫu Thư Mục `src/` (Cấu trúc Source Code)

### Tầng 1: Khởi tạo hệ thống
- `main.ts`: File khởi động ứng dụng (Mở cửa nhà hàng, gắn các Global Pipes/Filters, khai báo cổng 3000).
- `app.module.ts`: Module gốc chứa toàn bộ ứng dụng (Bản vẽ mặt bằng nhà hàng nối tất cả các phòng ban lại).
- `app.controller.ts` & `app.service.ts`: Xử lý các request cơ bản nhất (Ví dụ: Ping/Healthcheck).

### Tầng 2: Công cụ cốt lõi (Core Tools)
- `prisma/`: Kết nối xuống kho tổng PostgreSQL. Chứa `prisma.service.ts` quản lý connection lifecycle.
- `redis/`: Tích hợp bộ nhớ tạm thời RAM. Giúp lưu session hoặc cache danh mục sản phẩm.
- `common/`: Thư mục dùng chung cho toàn bộ dự án:
  - `constants/`: Biến hằng số (VD: thời gian sống của cache).
  - `decorators/`: Các Decorator tự tạo (VD: `@Roles()` để phân quyền).
  - `dto/`: DTO phân trang (`pagination-query.dto.ts`).
  - `filters/`: Nơi bắt TẤT CẢ các lỗi văng ra trong app (`all-exceptions.filter.ts`) và chuẩn hóa lại thành JSON.
  - `guards/`: Bảo vệ các route nhạy cảm (`roles.guard.ts`).

### Tầng 3: Các Module Nghiệp Vụ (Features)
- `auth/` (Trạm kiểm soát):
  - Chịu trách nhiệm Login/Register.
  - Chứa `AuthGuard`, trả về và xác thực JWT token (Vé VIP).
- `user/` (Khách hàng):
  - API quản lý thông tin khách, lấy hồ sơ cá nhân.
- `catalog/` (Thực đơn):
  - API trả về danh sách Danh mục (`Category`) và Sản phẩm (`Product`).
  - Thường xuyên được gắn Cache (Redis) vì người dùng gọi liên tục.
- `cart/` (Giỏ hàng):
  - API thêm/xóa/sửa giỏ hàng (`add-cart-item.dto.ts`).
- `orders/` (Đơn hàng):
  - API Checkout quan trọng nhất.
  - Gọi `$transaction` (Prisma) để Trừ Tồn Kho + Tạo Hóa Đơn cùng một thời điểm.
- `admin/` (Khu Quản lý):
  - Dành riêng cho `UserRole.ADMIN`.
  - Có các DTO riêng (`category.dto.ts`, `product.dto.ts`) để CRUD (Thêm, sửa, xóa) hệ thống.

---

## 3. Cấu trúc Cơ Sở Dữ Liệu (Prisma Schema)

Hệ thống xoay quanh mô hình E-commerce (Thương mại điện tử) với các Entity chính:

1. **User (Khách & Nhân viên):** 
   - Có `UserRole` (CUSTOMER hoặc ADMIN).
2. **Category & Product (Danh mục & Món ăn):**
   - 1 Category có nhiều Product.
   - Product có trạng thái `ACTIVE/INACTIVE` và có quản lý `stock` (tồn kho).
   - Có bảng `ProductImage` lưu ảnh sản phẩm (quan hệ 1-n).
3. **Cart & CartItem (Xe đẩy hàng):**
   - Lưu trữ trạng thái giỏ hàng (`ACTIVE`, `COMPLETED`, `ABANDONED`).
   - Liên kết tới `User` và `Product`.
4. **Order & OrderItem (Hóa đơn):**
   - Hóa đơn chính thức. Trạng thái chạy từ `PENDING` -> `CONFIRMED` -> `SHIPPED` -> `DELIVERED`.
   - `OrderItem` sao chép lại giá gốc của sản phẩm (`productPrice`) để phòng trường hợp món ăn đổi giá trong tương lai thì hóa đơn cũ không bị lệch tiền.
5. **Post (Bài viết/Tin tức):**
   - Có thể dùng làm Blog hoặc Bảng thông báo của nhà hàng.

---

## 4. Luồng Nghiệp Vụ Điển Hình (Checkout Flow)

1. **Client** gửi `POST /orders` mang theo Token + Giỏ hàng.
2. `auth.guard.ts` giải mã Token để nhận diện Khách.
3. `orders.controller.ts` chuyển data xuống `orders.service.ts`.
4. Service gọi Prisma `findUnique` kiểm tra tồn kho (Stock) trong Database.
5. Service gọi Prisma `$transaction`:
   - Bước 1: Tính tổng tiền.
   - Bước 2: Trừ đi số lượng trong bảng `Product`.
   - Bước 3: Tạo record trong bảng `Order` và các dòng `OrderItem`.
   - Bước 4: Đổi trạng thái bảng `Cart` sang `COMPLETED`.
6. Xóa cache Redis ở các vùng bị ảnh hưởng (nếu có).
7. Trả về `200 OK` cho Khách hàng.

*(Tài liệu này được tạo tự động sau khi phân tích mã nguồn thực tế của dự án).*
