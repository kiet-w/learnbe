# Giải Thích Chi Tiết - Module User (`src/user`)

Module User chịu trách nhiệm lưu trữ và quản lý thông tin của người dùng (tên, email, password băm). Module này khá đơn giản, chủ yếu thực hiện các thao tác CRUD (Create, Read, Update, Delete) cơ bản.

## 1. `user.controller.ts`

```typescript
@Controller('users')
export class UserController {
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }
}
```
- `@Param('id', ParseIntPipe)`: Khi người dùng truy cập `GET /users/5`, chữ `5` trên URL bản chất là chuỗi (string). `ParseIntPipe` có nhiệm vụ tự động chuyển đổi chuỗi `'5'` thành số nguyên `5` (number). Nếu nhập `/users/abc`, nó sẽ tự động ném ra lỗi 400 Bad Request.

## 2. `user.service.ts`

```typescript
async create(data: Prisma.UserCreateInput): Promise<User> {
  const user = await this.prisma.user.create({ data });
  await this.redisService.del('all_users');
  return user;
}
```
- Giao tiếp trực tiếp với Prisma (`this.prisma.user.create`).
- Rất cẩn thận trong việc dọn dẹp bộ nhớ đệm: Bất cứ khi nào tạo mới (`create`), cập nhật (`update`) hay xóa (`delete`) một người dùng, hàm `this.redisService.del('all_users')` sẽ được gọi để xóa danh sách người dùng cũ trong bộ nhớ đệm.

**Giao tiếp với Auth Module:**
Bạn sẽ thấy trong `auth.service.ts`, thay vì `AuthService` tự gọi Prisma để tìm Email, nó lại gọi `this.userService.findByEmail(email)`. 
Điều này tuân thủ nguyên tắc **"Không xen vào chuyện của nhà người ta"**. Auth chỉ lo chuyện bảo mật, còn việc thọc tay vào Database tìm User thì phải nhờ UserService làm giùm. Giúp code không bị dính chùm vào nhau.