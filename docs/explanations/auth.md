# Giải Thích Chi Tiết - Module Auth (`src/auth`)

Module này xử lý việc Đăng ký, Đăng nhập, và bảo mật của hệ thống bằng công nghệ **JWT (JSON Web Token)** kết hợp với **Cookie**.

## 1. `auth.controller.ts` (API Đăng Nhập/Đăng Ký)

```typescript
@Post('login')
@SerializeOptions({ type: AuthResponseDto })
async login(
  @Body() data: LoginDto,
  @Res({ passthrough: true }) response: Response,
) {
  return this.authService.login(data, response);
}
```
- Khác với API bình thường, ở đây có dùng `@Res({ passthrough: true })`. `Res` là đối tượng Response của Express. Ta cần nó để **cài đặt Cookie** vào trình duyệt của người dùng sau khi họ đăng nhập thành công.
- `@SerializeOptions`: Tự động ẩn đi các trường nhạy cảm (như mật khẩu) khi trả dữ liệu về nhờ thư viện `class-transformer`.

## 2. `auth.service.ts` (Xử Lý Xác Thực)

Nơi xử lý kiểm tra mật khẩu và tạo Token.

**Logic Đăng Ký (`register`):**
```typescript
const existingUser = await this.userService.findByEmail(data.email);
if (existingUser) throw new ConflictException('Email đã được sử dụng');

// Băm mật khẩu (Hashing)
const hashedPassword = await bcrypt.hash(data.password, 10);
await this.userService.create({ ...password: hashedPassword });
```
- **Băm mật khẩu**: Tuyệt đối không lưu mật khẩu thật (như `123456`) vào database. Ta dùng `bcrypt` để biến nó thành một chuỗi loằng ngoằng. Kể cả hacker có lấy được database cũng không biết mật khẩu thật là gì.

**Logic Đăng Nhập (`login`):**
```typescript
// So sánh mật khẩu người dùng nhập vào với mật khẩu đã băm trong database
if (!user || !(await bcrypt.compare(data.password, user.password))) {
  throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
}

// Tạo 2 cái thẻ (Tokens)
const tokens = this.generateTokens(user.id, user.email, user.role);
this.setCookies(response, tokens);
```
- Khi đăng nhập đúng, hệ thống cấp 2 loại thẻ:
  1. **Access Token**: Thẻ vào cửa ngắn hạn (15 phút).
  2. **Refresh Token**: Thẻ gia hạn dài hạn (7 ngày).

**Cài Đặt Cookie (`setCookies`):**
```typescript
response.cookie('access_token', tokens.accessToken, {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
});
```
- `httpOnly: true`: Rất quan trọng! Nó ngăn chặn mã độc JavaScript trên trình duyệt (XSS attack) đọc được Token của người dùng.
- `secure`: Chỉ gửi Token qua đường truyền mã hóa HTTPS (khi đưa lên môi trường thật).

## 3. `auth.guard.ts` (Trạm Kiểm Soát)

Guard là người bảo vệ đứng trước cửa các API. Nếu một API có gắn `@UseGuards(AuthGuard)`, Guard này sẽ chạy trước tiên.

```typescript
canActivate(context: ExecutionContext): boolean {
  const request = context.switchToHttp().getRequest();
  
  // 1. Tìm thẻ (token) trong Cookie
  const token = request.cookies['access_token'];
  if (!token) throw new UnauthorizedException('Bạn cần đăng nhập');

  // 2. Xác minh xem thẻ có phải là đồ thật do server mình cấp không
  const payload = this.authService.validateAccessToken(token);
  if (!payload) throw new UnauthorizedException('Token hết hạn');

  // 3. Nếu thật, gắn thông tin người dùng vào request để các Controller phía sau dùng
  request.user = payload;
  return true; // Cho qua
}
```
Guard này giúp các file Controller khác không cần phải viết lại code kiểm tra đăng nhập lặp đi lặp lại.