# Giải Thích Chi Tiết - Module Common (`src/common`)

Khác với các thư mục khác chứa tính năng cụ thể, `common` là cái "túi thần kỳ" chứa các công cụ dùng chung cho toàn bộ dự án. Khi có logic nào dùng đi dùng lại ở nhiều file, lập trình viên sẽ nhét nó vào đây.

## 1. Thư mục `constants` (Hằng Số)
```typescript
export const CACHE_KEYS = {
  PRODUCTS: 'products:list',
  CART: (userId: number) => `cart:${userId}`,
} as const;
```
Thay vì gõ chuỗi chữ `'cart:5'` khắp nơi trong code (rất dễ gõ sai chính tả), ta định nghĩa nó thành biến ở đây. Sau này muốn đổi tên, chỉ cần vào file `constants` đổi 1 lần là xong.

## 2. Thư mục `decorators` & `guards` (Phân Quyền)
```typescript
// roles.decorator.ts
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```
File này tự chế ra một cái thẻ `@Roles()`. Khi ta gắn thẻ này lên một hàm (ví dụ ở Controller của Admin), biến môi trường `'roles'` sẽ được lưu lại.

```typescript
// roles.guard.ts
const requiredRoles = this.reflector.getAllAndOverride('roles', [...]);
const userRole = request.user?.role;

if (!requiredRoles.includes(userRole)) {
  throw new ForbiddenException('Bạn không có quyền');
}
```
Sau đó `RolesGuard` sẽ vào đọc xem cái thẻ `@Roles` lúc nãy đòi hỏi quyền gì (ví dụ: `ADMIN`). Nó sẽ đối chiếu với chức vụ của người đang đăng nhập (`userRole`). Nếu không khớp, Guard sẽ chém luôn bằng lỗi `403 Forbidden`.

## 3. Thư mục `filters` (Bắt Lỗi Toàn Cục)
```typescript
// all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // ...
    // Ghi log lỗi ra console cho Dev đọc
    this.logger.error(`Lỗi: ${exception.stack}`);
    
    // Gửi lỗi về cho người dùng giao diện đẹp đẽ
    response.status(status).json({
      success: false,
      message: 'Có sự cố xảy ra...',
    });
  }
}
```
Trong code, đôi khi có những lỗi bất ngờ (như mất mạng, code viết sai bị văng lỗi). Filter này sẽ đứng hứng toàn bộ lỗi đó. Nó làm 2 việc:
1. Ghi log đầy đủ chi tiết để lập trình viên sửa.
2. Trả về cho khách hàng một câu xin lỗi thân thiện thay vì phun đống code lỗi rườm rà ra màn hình.

## 4. Thư mục `utils` (Hàm Tiện Ích)
```typescript
// api-response.util.ts
export function success<T>(data: T) {
  return { success: true, data };
}
```
Nhờ hàm này, thay vì mỗi file Controller phải tự gõ `{ success: true, data: result }`, ta chỉ cần gọi `return success(result);`. Code ngắn và chuẩn hóa hơn rất nhiều.