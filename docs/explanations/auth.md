# Phân Tích Chuyên Sâu Cấu Trúc và Tương Tác: Module Auth (`src/auth`)

Tài liệu này cung cấp một cái nhìn chuyên sâu (deep dive) vào cách thức hoạt động của module Xác thực (Auth) trong dự án. Trọng tâm của bài phân tích là sự tương tác chặt chẽ giữa Controller và Service, dòng chảy và cách xử lý dữ liệu trả về, cũng như vai trò cốt lõi của các thư viện mã nguồn mở bên thứ ba.

---

## 1. Controller (`src/auth/auth.controller.ts`)

`AuthController` là cửa ngõ giao tiếp của ứng dụng. Nhiệm vụ của nó là tiếp nhận các yêu cầu HTTP, áp dụng các lớp bảo vệ/chuyển đổi, và gọi đến các phương thức tương ứng trong Service. Điểm nhấn ở đây là việc sử dụng các Decorators tinh vi của NestJS để giữ cho mã nguồn gọn gàng.

### 1.1. Giải Mã Các Decorators Trọng Yếu

- **`@UseInterceptors(ClassSerializerInterceptor)` & `@SerializeOptions`**:
  - **Mục đích**: Tự động hóa quá trình "làm sạch" dữ liệu (loại bỏ các thông tin nhạy cảm) trước khi phản hồi về cho người dùng.
  - **Cách hoạt động**: Khi một hàm trong Controller (`login`, `register`, `me`) trả về một class instance, `ClassSerializerInterceptor` sẽ can thiệp trước khi dữ liệu được chuyển thành JSON. Decorator `@SerializeOptions({ type: AuthResponseDto })` ép kiểu cho đối tượng đầu ra, yêu cầu nó phải tuân thủ nghiêm ngặt cấu trúc của `AuthResponseDto`. Interceptor sẽ kích hoạt `class-transformer` để đọc các siêu dữ liệu (metadata) trên DTO, cụ thể là tìm các thuộc tính bị gắn `@Exclude()` (như `password` và `refreshToken` trong `UserResponseDto`) và xóa bỏ chúng hoàn toàn khỏi payload cuối cùng.
  - **Tại sao cần thiết?**: Tránh rò rỉ dữ liệu (Data Leakage). Ngay cả khi lập trình viên bất cẩn `select *` từ Database, lớp vỏ Controller vẫn đóng vai trò gác cổng cuối cùng.

- **`@Res({ passthrough: true }) response: Response`**:
  - **Mục đích**: Cấp quyền thao tác trực tiếp với đối tượng HTTP Response của Express (như set Cookie) nhưng **không** phá vỡ quy trình xử lý phản hồi (response handling) tự động của NestJS.
  - **Cách hoạt động**: Mặc định, nếu bạn tiêm đối tượng `@Res()` vào một handler, NestJS hiểu rằng bạn muốn tự mình quản lý việc gửi phản hồi (ví dụ: dùng `response.json(...)`). Khi thêm thuộc tính `passthrough: true`, bạn nói với NestJS: *"Tôi chỉ mượn đối tượng này để thiết lập Header hoặc Cookie (`response.cookie(...)`), phần còn lại hãy cứ xử lý `return` statement như bình thường"*. Điều này là bắt buộc để ứng dụng có thể vừa thiết lập HttpOnly Cookie, vừa trả về JSON Body (`AuthResponseDto`) cùng một lúc.

- **`@UseGuards(AuthGuard)`**:
  - **Mục đích**: Bảo vệ endpoint (ví dụ: `GET /auth/me`), đảm bảo chỉ những yêu cầu đã được xác thực mới đi qua được.
  - **Cách hoạt động**: `AuthGuard` trích xuất `access_token` từ request cookies, giải mã JWT, kiểm tra tính hợp lệ và thời gian sống. Nếu thành công, nó gắn payload đã giải mã vào `request.user`. Từ đó, Controller có thể an tâm truy cập thông qua `@Req() request: Request & { user: JwtPayloadDto }`.

---

## 2. Service (`src/auth/auth.service.ts`)

`AuthService` là trái tim của hệ thống Auth. Nó chứa toàn bộ logic xử lý, từ việc băm mật khẩu, so sánh dữ liệu, cho đến thao tác sinh token và thiết lập cookies, bằng cách gọi qua `UserService`.

### 2.1. Các Phương Thức Public (Luồng Nghiệp Vụ Chính)

- **`register(data: RegisterDto)`**:
  - Kiểm tra email tồn tại trong Database. Nếu có, từ chối với `ConflictException`.
  - Thực hiện mã hóa (băm) mật khẩu người dùng truyền lên.
  - Giao cho `UserService` lưu vào CSDL và trả về thông báo thành công.

- **`login(data: LoginDto, response: Response)`**:
  - Tìm kiếm người dùng bằng email.
  - Gọi thư viện `bcrypt` để so sánh mật khẩu gốc với mã băm lưu trong DB. Nếu sai, lập tức ném lỗi `UnauthorizedException`.
  - **Phối hợp làm việc**: Sau khi xác thực thành công, hàm sẽ gọi `generateTokens` để sinh cặp mã mới, sau đó gọi `updateRefreshToken` để lưu Refresh Token (đã băm) vào DB, và cuối cùng gọi `setCookies` (truyền đối tượng `response` nhận từ Controller xuống) để đưa Token vào trình duyệt.
  - Trả về `AuthResponseDto` báo cáo thành công.

- **`handleRefresh(refreshToken, response)`**:
  - Xác nhận có `refreshToken`. Dùng JWT giải mã và kiểm tra hạn sử dụng.
  - Lấy người dùng ra từ Database và kiểm tra xem `refreshToken` gửi lên có khớp với mã băm lưu ở DB hay không. Đây là cơ chế chống đánh cắp token (Token Hijacking/Reuse) - nếu token trên DB bị xóa hoặc thay đổi, các token cũ bị rò rỉ sẽ mất hiệu lực.
  - Nếu hợp lệ, hệ thống lại tiếp tục chu trình: sinh token mới (`generateTokens`), cập nhật DB (`updateRefreshToken`) và gắn lại Cookie (`setCookies`).

- **`handleLogout(accessToken, response)`**:
  - Xác định người dùng thông qua `accessToken` (kể cả khi đã hết hạn, hệ thống chỉ cần bắt lấy ID).
  - Cập nhật trường `refreshToken` của user trong DB thành `null` (Xóa bỏ khả năng tạo mới token).
  - Sử dụng lệnh `response.clearCookie('access_token', options)` và `response.clearCookie('refresh_token', options)` để gỡ bỏ hoàn toàn trạng thái phiên lưu trên trình duyệt của người dùng.

### 2.2. Các Phương Thức Private (Helpers)

Việc chia nhỏ các thao tác thành hàm `private` giúp logic chính rõ ràng, tránh trùng lặp và tăng tính bảo trì:
- **`generateTokens(userId, email, role)`**: Tập trung duy nhất vào cấu hình `jsonwebtoken` để sinh `accessToken` và `refreshToken` với thời hạn (TTL) và Secret Key tương ứng.
- **`updateRefreshToken(userId, refreshToken)`**: Không lưu plain-text. Nó tự động gọi `bcrypt.hash` trước khi yêu cầu `UserService` lưu Refresh Token.
- **`setCookies(response, tokens)`**: Tập trung các quy tắc bảo mật Cookie: cấu hình cờ `httpOnly: true`, `secure: isProduction`, `sameSite: 'lax'` và thiết lập `maxAge` phù hợp cho từng loại.

---

## 3. Theo Dấu Dữ Liệu Trả Về (Returns & Outputs Trace)

Để hiểu rõ ứng dụng hoạt động thế nào, ta cần theo dõi cách Token và DTO được luân chuyển từ Service ra đến ngoài Client:

1. **Khởi nguồn Token**: Ở tầng Service, `accessToken` và `refreshToken` ra đời tại `generateTokens()`.
2. **Thiết lập ở Cookie**: Hàm `setCookies()` âm thầm "nhét" cả hai thẻ này vào vùng Header `Set-Cookie` của HTTP Response. Trình duyệt khi nhận được sẽ tự động lưu lại thành **HttpOnly Cookies** – đồng nghĩa với việc mã Javascript của frontend (React/Vue/...) hoàn toàn không thể chạm tới chúng, phòng chống tuyệt đối tấn công **XSS** nhắm vào Token.
3. **Giá trị trả về (Body)**: Lệnh `return new AuthResponseDto(...)` trong hàm `login()` gửi về một cấu trúc định sẵn. Đáng chú ý, `accessToken` (để hỗ trợ một số Client đặc thù không dùng Cookie) được đính kèm vào Body (`{ success: true, accessToken: '...' }`), nhưng `refreshToken` thì **tuyệt đối không**.
4. **Lọc dữ liệu (Serialization)**: Khối `UserResponseDto` nằm bên trong cấu trúc trả về đi qua `ClassSerializerInterceptor`. Nhờ nhãn `@Exclude()` trên biến `password` và `refreshToken`, NestJS sẽ mạnh tay cắt bỏ hai trường này trước khi mã hóa thành chuỗi JSON cuối cùng gửi về Client. Kết quả là một JSON sạch sẽ, an toàn.

---

## 4. Vai Trò Cốt Lõi Của Các Thư Viện Bên Thứ Ba

Hệ thống Auth không thể vững chắc nếu thiếu đi sự hỗ trợ từ các công cụ chuyên dụng:

### 4.1. `bcryptjs` (Mã hóa một chiều)
- **Vai trò**: Đảm bảo an toàn cho dữ liệu nhạy cảm nhất (Mật khẩu và Refresh Token). Ngay cả khi Database bị đánh cắp, Hacker cũng không thể lấy được mật khẩu thật do cơ chế mã hóa một chiều.
- **Salt rounds = 10**: Là "chi phí tính toán" (cost factor) cho thuật toán băm. Con số 10 buộc CPU của máy chủ phải thực hiện phép toán chậm đi một cách có chủ đích (khoảng 100ms trên máy chủ thông thường). Điều này khiến các cuộc tấn công quét mật khẩu theo từ điển (Brute-force/Rainbow Table) mất hàng trăm năm để phá giải. 10 là mức cân bằng hoàn hảo giữa hiệu suất server và độ bảo mật.

### 4.2. `jsonwebtoken` (Cơ chế Token)
- **Vai trò**: Tạo (sign) và xác thực (verify) thẻ thông hành chuẩn RFC 7519, giúp hệ thống biết ai đang truy cập mà không cần lưu giữ phiên đăng nhập (Stateless Session) ở bộ nhớ.
- **Secret Keys**: Sử dụng hai chìa khóa độc lập `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET`. Nếu chìa khóa truy cập tạm thời (Access Key) bị lộ, hacker không thể tự sinh Refresh Token để chiếm phiên vĩnh viễn.
- **TTLs (Time-To-Live)**: `accessToken` có vòng đời cực ngắn (15 phút), thu hẹp tối đa thời gian Hacker có thể lợi dụng nếu token này bị bắt gói tin. Tuy nhiên, để UX tốt, `refreshToken` có tuổi thọ lớn hơn (7 ngày), đóng vai trò "chìa khóa chính" được bảo vệ cực kỳ nghiêm ngặt qua DB (so khớp băm) và HttpOnly Cookies.

### 4.3. `class-transformer` & `class-validator` (Lá chắn dữ liệu)
- **`class-validator`**: Trú ngụ ở tầng DTO (Ví dụ: `@IsEmail()`, `@IsString()`). Đây là lớp phòng thủ đầu tiên cản bước các cuộc tấn công chèn mã độc dạng SQL Injection hay NoSQL Injection bằng cách đảm bảo dữ liệu đầu vào chuẩn hóa ngay trước khi vào Controller.
- **`class-transformer`**: Cung cấp `@Exclude()`. Đây là chốt chặn bảo mật cuối cùng ở tầng Presentation, gạt bỏ khả năng nhà phát triển vô tình làm lộ thông tin mật vì những lệnh ánh xạ (mapping) sơ suất.
