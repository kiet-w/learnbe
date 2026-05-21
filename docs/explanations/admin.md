# Giải Thích Chi Tiết - Module Admin (`src/admin`)

Module `admin` đóng vai trò là "bộ não" quản trị (Back-office) của hệ thống. Đây là nơi cung cấp các API đặc quyền để Quản trị viên (Admin) vận hành cửa hàng, bao gồm việc quản lý danh mục (Category), sản phẩm (Product) và tiến trình xử lý đơn hàng (Order). 

Dưới đây là một phân tích **chuyên sâu** về cách các thành phần trong module này (Controller, Service) tương tác với nhau, luồng dữ liệu từ Client đến Database và cách trả về.

---

## 1. Controller: "Người gác cổng" và Điều phối viên (`admin.controller.ts`)

`AdminController` là điểm chạm đầu tiên của mọi request gửi đến các endpoint bắt đầu bằng `/admin`. Trước khi dữ liệu thực sự chạm đến logic xử lý, nó phải đi qua một loạt các trạm kiểm duyệt.

### 1.1. Hệ thống Decorator: Bảo vệ và Phân giải dữ liệu

Mỗi decorator trong NestJS có một nhiệm vụ cực kỳ cụ thể để đảm bảo an toàn và cấu trúc dữ liệu:

- **`@Controller('admin')`**: Định tuyến tất cả request có prefix `/admin` vào class này.
- **`@UseGuards(AuthGuard, RolesGuard)`**: Hai lớp khiên bảo vệ.
  - `AuthGuard`: Kiểm tra JWT Token trong header `Authorization`. Nếu hợp lệ, nó sẽ giải mã và gắn thông tin người dùng (user payload) vào object `Request`.
  - `RolesGuard`: Chạy ngay sau `AuthGuard`. Nó sẽ đọc role của user và so sánh với quyền được yêu cầu.
- **`@Roles(UserRole.ADMIN)`**: Định nghĩa Metadata cho `RolesGuard` biết rằng: "Chỉ cho phép tài khoản có role là `ADMIN` đi qua".
- **`@Req() request`**: Trích xuất toàn bộ object `Request` của Express. Ở đây, ta dùng nó để lấy `request.user.userId` (đã được `AuthGuard` nhét vào) nhằm mục đích ghi log (ai là người thực hiện hành động).
- **`@Body() dto`**: Hứng dữ liệu JSON từ phần thân (body) của request, sau đó chuyển đổi và xác thực thông qua các DTO (`CreateCategoryDto`, `UpdateProductDto`...). Nếu dữ liệu sai định dạng (ví dụ thiếu `name` hoặc `price` không hợp lệ), NestJS tự động chặn lại và trả về lỗi 400 Bad Request ngay tại đây, không cho phép tiến vào Controller.
- **`@Param('id', ParseIntPipe)`**: Lấy tham số `id` từ URL (ví dụ `/admin/products/5`) và tự động ép kiểu sang dạng `number` an toàn thông qua `ParseIntPipe`. Nếu `id` không phải là số, sẽ trả về lỗi 400.
- **`@Query() query`**: Trích xuất các tham số trên URL (ví dụ `/admin/orders?page=2&status=PENDING`) và map vào `AdminOrderQueryDto`.

### 1.2. Phân tích chi tiết các Endpoint

- **Quản lý Danh mục (`POST /admin/categories`, `PATCH /admin/categories/:id`)**: Nhận `CreateCategoryDto` hoặc `UpdateCategoryDto`. Chuyển dữ liệu xuống Service. Kết quả trả về được bọc qua `success()` - một tiện ích chuẩn hóa cấu trúc JSON (`{ statusCode: 200, data: ... }`).
- **Quản lý Sản phẩm (`POST /admin/products`, `PATCH /admin/products/:id`, `DELETE /admin/products/:id`)**: Nhận dữ liệu tạo/sửa hoặc `id` để xóa mềm. Luồng xử lý tương tự, đẩy việc nặng xuống Service và gói kết quả lại.
- **Quản lý Đơn hàng (`GET /admin/orders`, `PATCH /admin/orders/:id/status`)**: API `GET` dùng để liệt kê, gọi `adminService.findOrders` và sử dụng hàm `paginated()` để định dạng kết quả phân trang chuẩn (`{ data: [], meta: { total, page, limit } }`). API `PATCH` cập nhật trạng thái đơn hàng.

**Luồng dữ liệu đến Controller:** Client -> HTTP Request -> Middleware -> Guard (`AuthGuard`, `RolesGuard`) -> Pipe (`ValidationPipe` trên DTO, `ParseIntPipe`) -> **Controller Method**.

---

## 2. Service: "Khối óc" xử lý nghiệp vụ (`admin.service.ts`)

Nếu Controller là lễ tân, thì `AdminService` chính là những chuyên gia phía sau xử lý logic cốt lõi. Nơi đây quyết định dữ liệu có được lưu trữ hay không.

### 2.1. Tương tác giữa Public Methods và Private Helpers

Một trong những thiết kế quan trọng của Service là việc tách biệt các kiểm tra nghiệp vụ (business validation) thành các hàm private (helper methods).

Khi một hàm public như `createProduct(adminUserId, dto)` được gọi:
1. DTO chảy từ Controller thẳng vào hàm này.
2. Nó không gọi database lưu ngay lập tức, mà phải trải qua kiểm tra tính đúng đắn thông qua các private helper:
   - `await this.ensureCategoryExists(dto.categoryId);`: Helper này query Prisma. Nếu category không tồn tại, nó chủ động ném `NotFoundException(404)`. Hệ thống tự động bắt lỗi và báo về cho client.
   - `await this.ensureUniqueProductSlug(dto.slug);`: Helper này kiểm tra trùng lặp slug. Nếu trùng, nó ném `ConflictException(409)`.
3. Chỉ khi tất cả helper đều pass (không throw exception), tiến trình lưu vào Database mới được thực hiện.

Điều này làm cho hàm public ngắn gọn, dễ đọc và tập trung vào luồng chính (Happy Path), trong khi các logic kiểm tra phức tạp được giấu gọn bên trong helper.

### 2.2. Chi tiết một số nghiệp vụ phức tạp

- **`updateProduct(adminUserId, id, dto)`**:
  - DTO đưa vào có thể chỉ chứa một vài trường cần cập nhật (nhờ tính chất `Partial` của Update DTO).
  - Nó sử dụng toán tử spread (`...rest`) để tách lấy những trường bình thường.
  - Xử lý ảnh là một chiến thuật đặc biệt: thay vì tìm xem ảnh nào xóa/thêm/sửa, Service sử dụng "xóa hết và tạo mới" (`deleteMany: {}` tiếp theo là `create`). Đây là cách đồng bộ nhanh chóng, đẩy trách nhiệm sắp xếp và quản lý danh sách ảnh về phía Frontend.

- **`findOrders(query)`**:
  - Sử dụng `Promise.all([findMany, count])` để tối ưu hóa. Thay vì chờ lấy danh sách xong mới đếm tổng, hai query này chạy song song (concurrently) bằng Prisma, giảm một nửa thời gian phản hồi.
  - Data trả về từ database được map thủ công qua `new AdminOrderResponseDto(order)` để làm sạch dữ liệu trước khi trả về.

---

## 3. Quản lý Kết quả trả về (Outputs & Returns)

Dữ liệu đi theo hành trình quay ngược lại vô cùng rõ ràng:

1. **Từ Database (Prisma)**: Trả về một object nguyên thủy chứa thông tin (ví dụ: `Product` kèm `images` và `category`). Ở giai đoạn này, dữ liệu còn khá "thô", có thể chứa cấu trúc của Prisma như kiểu `Decimal` cho giá tiền.
2. **Từ Service**: Đôi khi Service trả trực tiếp (với Product, Category), nhưng ở những entity phức tạp như Order, nó gọi `new AdminOrderResponseDto()` để mapping (chuyển `Decimal` về `string` để trình duyệt không bị sai số float). Service trả object này về lại cho Controller.
3. **Từ Controller về Client**: Object chưa thể đi trực tiếp. Controller gói nó qua hàm `success(product)` (từ `src/common/utils/api-response.util.ts`).
   - **Tại sao phải bọc (wrapped)?**: Để tạo sự đồng nhất (consistency). Bất kể client gọi API lấy user, order hay product, cấu trúc JSON trả về luôn có dạng:
     ```json
     {
       "statusCode": 200,
       "message": "Success",
       "data": { "id": 1, "name": "..." }
     }
     ```
   - Điều này giúp frontend không cần phải viết lại logic parse JSON cho từng API. Tất cả đều tuân thủ một chuẩn giao tiếp duy nhất.

---

## 4. Vai trò của Third-Party & Thư viện

Module này hoạt động trơn tru nhờ sự phối hợp của ba công cụ đắc lực:

- **Prisma (`PrismaService`)**: Là cầu nối giao tiếp với cơ sở dữ liệu. Nó đóng vai trò ORM, dịch các object JavaScript (như `{ where: { id }, data: dto }`) thành câu lệnh SQL an toàn. Prisma trả về các object có đầy đủ type-safe (an toàn kiểu dữ liệu), giúp IDE cảnh báo ngay nếu truy xuất sai tên cột.
- **Redis (`RedisService`)**: Đóng vai trò là hệ thống tăng tốc (Cache). 
  - Admin là người thay đổi dữ liệu (ví dụ: đổi giá sản phẩm). Khách hàng (End-user) là người xem. 
  - Nếu admin update sản phẩm nhưng bộ nhớ tạm (Cache) của khách hàng không được xóa đi, họ sẽ vẫn thấy giá cũ.
  - Do đó, sau mỗi lệnh `create/update/delete` thành công trên Prisma, service bắt buộc phải gọi các hàm như `this.invalidateProductCache(product.slug)`. Redis sẽ dọn dẹp các cache key liên quan (ví dụ `product:dien-thoai-iphone`), buộc hệ thống phải lấy dữ liệu mới ở lần truy cập tiếp theo của khách hàng.
- **Logging (`Logger`)**: `this.logger.log(...)` được gọi mỗi khi có thao tác thay đổi dữ liệu.
  - Nó ghi lại chuỗi như `"Admin 1 updated order 5 status PENDING -> SHIPPED"`.
  - Trong các hệ thống Enterprise, điều này là cốt lõi để tạo ra **Audit Trail** (dấu vết kiểm toán). Nếu đơn hàng bị hủy sai quy định hoặc giá bán bị thay đổi, quản trị viên cấp cao có thể dựa vào log này để biết chính xác `adminUserId` nào đã làm việc đó vào lúc nào.
