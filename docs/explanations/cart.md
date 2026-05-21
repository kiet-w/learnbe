# Giải Thích Chi Tiết - Module Cart (`src/cart`)

Module này chịu trách nhiệm quản lý các hoạt động liên quan đến giỏ hàng trong hệ thống.

## `cart.controller.ts`
**Mục đích:** Xử lý các yêu cầu HTTP liên quan đến giỏ hàng từ người dùng, đảm bảo tính bảo mật thông qua xác thực JWT.

**Các tính năng chính:**
- Tiếp nhận yêu cầu lấy thông tin giỏ hàng (`GET /cart`).
- Thêm sản phẩm vào giỏ hàng (`POST /cart/items`).
- Cập nhật số lượng sản phẩm trong giỏ (`PATCH /cart/items/:id`).
- Xóa sản phẩm khỏi giỏ hàng (`DELETE /cart/items/:id`).
- Làm trống toàn bộ giỏ hàng (`DELETE /cart`).
- Sử dụng `AuthGuard` để tự động trích xuất `userId` từ Token, ngăn chặn việc sửa đổi giỏ hàng của người khác.

**Luồng dữ liệu:** Dữ liệu từ Request (Body DTOs, Params) được chuyển đến `CartService`, sau đó phản hồi được đóng gói qua chuẩn `ApiResponse`.

---

## `cart.service.ts`
**Mục đích:** Chứa logic nghiệp vụ lõi (Business Logic) để quản lý trạng thái giỏ hàng, kiểm tra kho hàng và tối ưu hiệu năng bằng Cache.

**Các tính năng chính:**
- **Quản lý trạng thái:** Chỉ tương tác với giỏ hàng có trạng thái `ACTIVE` của người dùng.
- **Kiểm tra chặt chẽ:** Validate tồn kho (`stock`) và trạng thái sản phẩm (`ACTIVE`) trước khi cho phép thêm vào giỏ.
- **Tối ưu Cache:** Sử dụng `RedisService` để lưu trữ giỏ hàng, giúp giảm tải cho Database chính.
- **Tính toán chính xác:** Sử dụng `Prisma.Decimal` để tính tổng tiền, tránh các sai số dấu phẩy động (float point error) trong giao dịch tài chính.
- **Làm mới dữ liệu:** Tự động hủy Cache (`refreshCart`) mỗi khi có hành động thêm/sửa/xóa để đảm bảo người dùng luôn thấy dữ liệu mới nhất.

**Luồng dữ liệu:** Tương tác hai chiều với Prisma (PostgreSQL) và Redis; trả về `CartResponse` đã được tính toán đầy đủ thông tin `subtotal` và `totalItems`.

---

## `cart.module.ts`
**Mục đích:** Đóng gói và định nghĩa phạm vi của module Cart trong ứng dụng NestJS.

**Các tính năng chính:**
- Kết nối `CartController` và `CartService`.
- Import `AuthModule` để hỗ trợ các Guard bảo mật.
- Export `CartService` để module `Orders` có thể sử dụng dữ liệu giỏ hàng trong quá trình Checkout.

**Luồng dữ liệu:** Khai báo các thành phần phụ thuộc (Dependencies) và xuất bản dịch vụ cho toàn bộ hệ thống.

---

*Tài liệu này được cập nhật tự động bởi CocoIndex Codebase Analyzer.*
