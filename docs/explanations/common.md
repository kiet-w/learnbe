# Giải Thích Chuyên Sâu - Module Common (`src/common`)

Khác với các module chứa logic nghiệp vụ cụ thể (như `user`, `cart`, `catalog`), `common` là module chứa các công cụ, tiện ích, cấu hình và các lớp bảo vệ dùng chung cho toàn bộ hệ thống. Mục tiêu cốt lõi của `common` là giảm thiểu code lặp lại (DRY - Don't Repeat Yourself), tăng tính nhất quán và chuẩn hóa toàn bộ ứng dụng NestJS.

Dưới đây là tài liệu đi sâu vào các cơ chế quan trọng nhất của `src/common`.

---

## 1. Decorators & Guards: Hệ Thống Phân Quyền Xuyên Suốt

Để bảo vệ các API khỏi những truy cập không hợp lệ, ứng dụng sử dụng cơ chế Decorator kết hợp với Guard. Đây là một quy trình tinh tế gồm 2 bước: "Dán nhãn" và "Kiểm tra nhãn".

### `@Roles()` Decorator (`src/common/decorators/roles.decorator.ts`)
Thay vì viết logic kiểm tra quyền hạn vào từng hàm xử lý (controller handler), ta tạo ra một Custom Decorator.
- **Hoạt động:** Hàm `Roles(...roles: UserRole[])` nhận vào một danh sách các quyền (ví dụ `ADMIN`, `USER`). 
- **Bản chất:** Nó sử dụng `SetMetadata` của NestJS để "ghim" ẩn một siêu dữ liệu (metadata) với từ khóa `ROLES_KEY` (`'roles'`) vào chính Class hoặc Method Controller đó.
- **Ví dụ:** Khi bạn gắn `@Roles(UserRole.ADMIN)` lên trên phương thức xóa người dùng, bạn mới chỉ "dán nhãn" yêu cầu cho nó, chứ chưa thực sự chặn ai cả.

### `RolesGuard` (`src/common/guards/roles.guard.ts`)
Guard này đóng vai trò như một "nhân viên an ninh" thực thụ đứng trước các API.
- **Luồng Xử Lý & `Reflector`**: 
  1. Kế thừa `CanActivate` để lấy quyền cho phép/chặn request.
  2. Sử dụng `Reflector` (công cụ đọc metadata của NestJS) quét qua Context (cả Class và Handler) để tìm xem API này có dán nhãn `ROLES_KEY` nào không.
  3. Nếu `requiredRoles` trống, nó tự động cho qua (`return true`).
- **`request.user` đến từ đâu?**: 
  - `RolesGuard` truy cập `request.user?.role`. Nhưng làm sao `user` lại nằm trong đối tượng `request`?
  - Thực tế, trong một vòng đời Request của NestJS, **AuthGuard** (thường kiểm tra JWT Token) sẽ chạy *trước* `RolesGuard`. Khi AuthGuard xác thực token thành công, nó sẽ giải mã payload (chứa `id`, `role`,...) và gắn trực tiếp (populate) đối tượng đó vào `request.user`.
- **Ra quyết định**: 
  - Nếu request không có thông tin user, hoặc `user.role` không nằm trong danh sách `requiredRoles` (nhãn dán từ Decorator), Guard lập tức ném ra lỗi `ForbiddenException` ("Bạn không có quyền thực hiện thao tác này"), trả về mã HTTP 403.
  - Nếu hợp lệ, nó trả về `true` cho phép request đi tiếp vào Controller.

---

## 2. Filters: Lưới Chống "Sập" Và Chuẩn Hóa Lỗi Toàn Cục

Trong quá trình ứng dụng chạy, lỗi là điều không thể tránh khỏi (lỗi validate, lỗi database, lỗi logic). Việc bắt và định dạng lại lỗi này được giao cho **`AllExceptionsFilter`** (`src/common/filters/all-exceptions.filter.ts`).

### Đặc điểm Kỹ Thuật:
- Sử dụng decorator `@Catch()` không truyền tham số để đóng vai trò làm "Catch-All Filter". Bất kể lỗi gì xảy ra trong hệ thống đều sẽ rơi vào mẻ lưới này.

### Cơ Chế Hoạt Động & JSON Format:
1. **Phân Loại Lỗi:** Filter xác định xem đây là lỗi có chủ đích (`HttpException` như NotFound, BadRequest) hay lỗi máy chủ sập ngoài ý muốn (`Internal Server Error`).
2. **Che Giấu Thông Tin (Security):**
   - Với `HttpException`, filter sẽ lấy nội dung thông báo lỗi nguyên bản (ví dụ từ class Validator).
   - Với lỗi `HttpStatus.INTERNAL_SERVER_ERROR` (500), nó giấu đi lý do lỗi thực sự bằng một câu thông báo thân thiện với người dùng: *"Có sự cố xảy ra, chúng tôi đang xử lý. Xin lỗi bạn vì sự bất tiện này!"*. Điều này giúp tránh rò rỉ các lỗi truy vấn SQL hoặc cấu trúc mã nguồn ra ngoài cho hacker khai thác.
3. **Logging Chi Tiết Dành Cho Dev:**
   - Trong khi che giấu lỗi với client, filter dùng `Logger('CrisisManagementTeam')` in thẳng xuống Terminal (console) mọi ngóc ngách của lỗi.
   - Nó ghi lại: Đường dẫn API lỗi (`request.url`), Phương thức (`request.method`), và đặc biệt là chuỗi **Stack Trace** (lịch sử chuỗi các hàm gọi gây ra lỗi) để lập trình viên có thể fix bug ngay lập tức.
4. **Cấu Trúc JSON Trả Về Client:** 
   - Thay vì mỗi lỗi trả về một kiểu khác nhau, nó ép tất cả exception thành một format duy nhất, thân thiện với Frontend:
   ```json
   {
     "statusCode": 403,
     "timestamp": "2026-05-21T10:00:00.000Z",
     "path": "/admin/products",
     "message": "Bạn không có quyền thực hiện thao tác này"
   }
   ```

---

## 3. Utils & Interfaces: Thống Nhất Giao Tiếp Backend - Frontend

Trong các file `src/common/interfaces/api-response.interface.ts` và `src/common/utils/api-response.util.ts`, hệ thống định nghĩa các công cụ bọc dữ liệu (Wrapper).

### Tại sao lại cần nó?
Nếu một API trả về Array mảng sản phẩm `[]`, API khác trả về đối tượng `{ id, name }`, Frontend sẽ rất chật vật trong việc viết hàm bắt dữ liệu (fetch interceptor). Do đó, ứng dụng ép **mọi API trả về thành công đều phải tuân theo 1 trong 2 Interface chuẩn**.

### `ApiResponse` & Hàm `success()`
- Giao diện `ApiResponse<T>` đảm bảo luôn luôn có một cờ `success: boolean` và dữ liệu thực sự sẽ nằm trọn trong thuộc tính `data`.
- Hàm helper `success(data)` giúp các Controller bọc kết quả nhanh chóng thay vì phải tự viết JSON:
  ```typescript
  // Thay vì return user;
  return success(user); // Output: { success: true, data: { id: 1, ... } }
  ```

### `PaginatedApiResponse` & Hàm `paginated()`
- Giao diện `PaginatedApiResponse<T>` cung cấp thêm cục dữ liệu `meta` (`PaginatedMeta`) chứa toàn bộ các thông số để Frontend có thể dễ dàng vẽ thanh chuyển trang (Pagination Component).
- Hàm helper `paginated(data, total, page, limit)` không chỉ bọc dữ liệu mà còn thông minh thực hiện luôn phép toán phân trang.
- **Tính toán `totalPages`:** Dùng thuật toán `Math.ceil(total / limit)`. Ví dụ: Có tổng cộng 25 sản phẩm (`total=25`), chia làm 10 sản phẩm mỗi trang (`limit=10`). Phép chia `25/10 = 2.5`, hàm `Math.ceil()` làm tròn lên thành `3`. Frontend sẽ biết để vẽ chính xác 3 nút trang! Nếu `total = 0`, hàm có cơ chế an toàn trả ngay về `0`. 

Tóm lại, **`src/common`** đóng vai trò là "bộ quy tắc thép" của ứng dụng, giúp hệ thống ổn định, an toàn và dễ dàng mở rộng, đồng thời mang lại sự "hạnh phúc" cho Frontend khi tích hợp API.
