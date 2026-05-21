# Giải Thích Chuyên Sâu - Tương Tác Giữa Controller và Service Trong Module User

Tài liệu này cung cấp một cái nhìn cực kỳ chi tiết (deep dive) vào cách hoạt động của `UserController` và `UserService` trong hệ thống NestJS của chúng ta. Trọng tâm là phân tích luồng dữ liệu (data flow) từ mạng (network) vào controller, cách controller giao tiếp với service, cách service thao tác với database (thông qua Prisma) & cache (Redis), và kết quả cuối cùng được trả về cho client.

---

## 1. Tầng Giao Diện Mạng (Controllers): `UserController`

`UserController` (`src/user/user.controller.ts`) là điểm chặn (entry point) đầu tiên cho mọi HTTP request liên quan đến User.

### Cách Request Chảy Vào Controller
Khi một HTTP request đi vào server Node.js, bộ định tuyến (router) nội bộ của NestJS sẽ phân tích URL và HTTP Method để ánh xạ tới Controller tương ứng.
Decorator `@Controller('users')` trên class `UserController` đóng vai trò gắn tiền tố `/users` cho toàn bộ các route bên trong nó.

### Các Endpoints và Decorators Cốt Lõi:

1. **`@Post()` - Tạo mới người dùng**
   - **Luồng:** Nhận request `POST /users`.
   - **Tham số:** Sử dụng `@Body() data: Prisma.UserCreateInput`. Decorator `@Body()` trích xuất phần body của HTTP request và parse nó thành object JSON. Ở đây, ta đang sử dụng trực tiếp kiểu `UserCreateInput` sinh ra từ Prisma thay vì tạo một DTO riêng lẻ. Điều này giúp map trực tiếp (1-1) cấu trúc client gửi lên với cấu trúc Database mong đợi.
   - **Kết nối Service:** Controller không tự chứa logic nghiệp vụ. Nó gọi `this.userService.create(data)` và trực tiếp trả về kết quả.

2. **`@Get()` - Truy vấn danh sách**
   - **Luồng:** Nhận request `GET /users`.
   - **Kết nối Service:** Gọi `this.userService.getAllUsers()`.

3. **`@Get(':id')` - Lấy thông tin chi tiết**
   - **Luồng:** Nhận request `GET /users/:id` (Ví dụ: `/users/5`).
   - **Tham số:** Dùng `@Param('id', ParseIntPipe) id: number`. `@Param('id')` lấy giá trị chuỗi từ URL (ví dụ `"5"`). Bằng cách áp dụng `ParseIntPipe`, NestJS tự động can thiệp (intercept) và cố gắng ép kiểu `"5"` thành số nguyên `5`. Nếu client truyền `/users/abc`, Pipe này sẽ quăng lỗi `400 Bad Request` ngay lập tức trước khi chạm đến logic bên trong hàm.
   - **Kết nối Service:** Truyền biến `id` (đã là `number`) vào `this.userService.findById(id)`.

4. **`@Patch(':id')` - Cập nhật**
   - **Luồng:** Nhận request `PATCH /users/:id`.
   - **Tham số:** Kết hợp cả `@Param` để lấy `id` và `@Body() data: Prisma.UserUpdateInput` để lấy dữ liệu cần cập nhật (ví dụ: chỉ gửi lên `{ "name": "New Name" }`).
   - **Kết nối Service:** Gọi `this.userService.update(id, data)`.

5. **`@Delete(':id')` - Xóa**
   - **Luồng:** Nhận request `DELETE /users/:id`.
   - **Kết nối Service:** Gọi `this.userService.delete(id)`.

---

## 2. Tầng Logic Nghiệp Vụ (Services): `UserService`

`UserService` (`src/user/user.service.ts`) được định nghĩa với decorator `@Injectable()`, cho phép NestJS khởi tạo và tiêm (inject) nó vào `UserController` (hoặc các Module khác). Nó phụ thuộc vào `PrismaService` (để tương tác DB) và `RedisService` (để caching).

### Phân Tích Các Hàm (Public Methods)

1. **`create(data: Prisma.UserCreateInput): Promise<User>`**
   - **Map Input:** Tham số `data` nhận từ controller được truyền trực tiếp vào `this.prisma.user.create({ data })`. `Prisma.UserCreateInput` định nghĩa chính xác những trường nào bắt buộc (ví dụ: `email`, `password`) và tùy chọn theo lược đồ Prisma.
   - **Hiệu ứng phụ (Side-effect):** Sau khi Prisma tạo thành công record trong Database, hàm sẽ gọi `await this.redisService.del('all_users')`. Bước này là **Cache Invalidation** – xóa cache danh sách user cũ để tránh client đọc lại dữ liệu lỗi thời.

2. **`getAllUsers()`**
   - **Map Input:** Không có input trực tiếp.
   - **Logic Cache:** Bọc truy vấn Prisma bên trong `this.redisService.getOrSet(...)`. Key là `all_users` và TTL là 30000ms (30 giây).
   - **Tối ưu Output:** Thay vì dùng `findMany()` thông thường (trả về toàn bộ cột, có thể lộ password hash), Service sử dụng `select: { id: true, email: true, name: true }`. Điều này giới hạn lượng dữ liệu lấy ra ở tầng Database, cải thiện tốc độ I/O và tối ưu bảo mật.

3. **`findById(id: number)` và `findByEmail(email: string)`**
   - **Logic:** Gọi hàm `findUnique` của Prisma. Việc dùng `findUnique` đảm bảo cơ sở dữ liệu sẽ tìm kiếm dựa trên Primary Key (`id`) hoặc Unique Constraint (`email`), cho độ phức tạp $O(1)$ nếu Database đã được index.
   - **Kết quả trả về:** Trả về nguyên mẫu object `User` (có toàn bộ các field theo Schema) hoặc `null` nếu record không tồn tại.

4. **`update(id: number, data: Prisma.UserUpdateInput): Promise<User>`**
   - **Map Input:** Lấy `id` từ Param và `data` từ Body. Truyền vào `{ where: { id }, data }` trong hàm `prisma.user.update`.
   - **Hiệu ứng phụ:** Tương tự `create`, thực hiện xóa cache `all_users`.

5. **`delete(id: number): Promise<User>`**
   - **Logic:** Gọi `prisma.user.delete` với điều kiện `id`.
   - **Hiệu ứng phụ:** Xóa cache `all_users`.

---

## 3. Luồng Kết Quả / Outputs (Returns Flow)

**Câu hỏi: Chính xác thì Controller trả về cái gì? Nó có bọc lại (wrap) hay truyền nguyên bản (raw)? Dữ liệu sẽ đi về đâu?**

- **Từ Service về Controller:** Các phương thức trong `UserService` trả về kết quả thô của Prisma (ví dụ đối tượng `User` với các cột `id`, `email`, v.v., hoặc danh sách chứa các object tương tự).
- **Từ Controller về Client:** Trong hệ thống hiện tại, `UserController` **trả về trực tiếp (pass it raw)** bất cứ thứ gì mà Service trả về. Ví dụ: `return this.userService.getAllUsers();`.
- **Dưới mui xe của NestJS:** Controller không nhất thiết phải gọi `res.send()` hay `res.json()`. Theo cơ chế cốt lõi của NestJS, khi một route handler (như `@Get()`) trả về một Object hoặc một Array (hay một `Promise` chứa Object/Array), NestJS sẽ tự động:
  1. Đợi (await) Promise giải quyết.
  2. Kích hoạt bộ tuần tự hóa (serializer) nội bộ - ngầm định gọi `JSON.stringify()`.
  3. Tự động thiết lập header `Content-Type: application/json`.
  4. Trả HTTP Response có Status Code là 200 (hoặc 201 cho POST) và gửi chuỗi JSON thẳng về Client.

**Lưu ý Bảo Mật:** Việc trả về dạng thô (raw) các Model Prisma (ví dụ hàm `findById` trả về cả trường `password`) đòi hỏi chúng ta phải xử lý loại bỏ mật khẩu ở tầng Service hoặc sử dụng Interceptors (như `ClassSerializerInterceptor` với `@Exclude()`) trước khi trả dữ liệu về network. Hiện tại, ngoại trừ `getAllUsers` có dùng thuộc tính `select`, các hàm khác như `findById` đang tiềm ẩn nguy cơ trả về toàn bộ dữ liệu thô ra cho người dùng.

---

## 4. Phụ Thuộc Khéo Léo (Dependencies) và Tương Tác với Module Auth

`UserService` là một dependency lõi, được sử dụng rộng rãi bởi các module khác, đặc biệt là `AuthModule`.

### Tương tác với Auth
- Khi một người dùng cố gắng đăng nhập, `AuthService` sẽ không tự gọi database. Thay vào đó, nó sẽ inject `UserService` và gọi phương thức `this.userService.findByEmail(email)`.
- **Tại sao cần hàm này?** Nếu `findByEmail` tìm thấy người dùng, `AuthService` sẽ lấy object `User` trả về (bao gồm cả password hash) để đối chiếu mật khẩu (bằng `bcrypt.compare`).

### Xử Lý Phụ Thuộc Vòng (Circular Dependency)
Trong nhiều hệ thống thực tế:
- `AuthModule` gọi `UserService` (để xác thực email).
- `UserModule` (tương lai) có thể cần gọi `AuthService` hoặc sử dụng JWT Guards từ AuthModule để bảo vệ các route như `PATCH /users/:id` chỉ cho phép người dùng tự sửa thông tin.
- Nếu cả hai nhập trực tiếp (import) lẫn nhau sẽ gây ra **Phụ Thuộc Vòng (Circular Dependency)** và làm crash ứng dụng Node.js lúc khởi động.
- **Giải quyết bằng `@Inject(forwardRef(() => AuthModule))`:** NestJS hỗ trợ mô hình `forwardRef()`. Đây là một hàm bọc (wrapper func) giúp trì hoãn việc tham chiếu đến Module kia cho đến khi cả hai Module đều đã được cấp phát trên bộ nhớ (instantiated). Ví dụ nếu `UserController` cần Auth Guards, ta sẽ phải nhập khẩu (import) AuthModule bằng hàm `forwardRef(() => AuthModule)` bên trong khai báo mảng `imports` của `UserModule`, thay vì import module tĩnh như thông thường.

Nhờ cách thiết kế tách biệt (Controller lo Router/Network, Service lo DB/Logic), `UserService` trở thành một thành phần linh hoạt, độc lập, có thể dễ dàng được tái sử dụng qua lại trong toàn hệ thống.
