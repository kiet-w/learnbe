# Giải Thích Chi Tiết - Module Admin (`src/admin`)

`src/admin` là khu vực chứa các API chỉ dành cho quản trị viên. Module này không phục vụ khách hàng thông thường, mà tập trung vào các thao tác vận hành hệ thống như quản lý danh mục, quản lý sản phẩm và theo dõi đơn hàng.

## 1. `admin.module.ts` - Điểm ghép module

```typescript
@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
})
export class AdminModule {}
```

File này khai báo 3 ý chính:

- `imports: [AuthModule]`: tái sử dụng phần xác thực đã có sẵn từ module `auth`.
- `controllers: [AdminController]`: mọi request `/admin/...` sẽ đi vào controller này.
- `providers: [AdminService, RolesGuard]`: đăng ký service xử lý nghiệp vụ và guard kiểm tra phân quyền.

## 2. `admin.controller.ts` - Cửa vào của Admin API

```typescript
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController { ... }
```

Đây là lớp đứng ở đầu luồng request:

- `@Controller('admin')`: mọi route bên trong đều có tiền tố `/admin`.
- `@UseGuards(AuthGuard, RolesGuard)`: request phải vượt qua 2 lớp kiểm tra.
- `@Roles(UserRole.ADMIN)`: chỉ tài khoản có role `ADMIN` mới được phép dùng toàn bộ API trong controller này.

Điều này có nghĩa là nếu user chưa đăng nhập thì bị chặn từ `AuthGuard`; nếu đã đăng nhập nhưng không phải admin thì `RolesGuard` sẽ trả về `403 Forbidden`.

### Các nhóm endpoint chính

Controller hiện có 6 nhóm thao tác:

1. `POST /admin/categories`: tạo danh mục mới.
2. `PATCH /admin/categories/:id`: cập nhật danh mục.
3. `POST /admin/products`: tạo sản phẩm.
4. `PATCH /admin/products/:id`: cập nhật sản phẩm.
5. `DELETE /admin/products/:id`: xóa mềm sản phẩm.
6. `GET /admin/orders` và `PATCH /admin/orders/:id/status`: xem danh sách đơn và đổi trạng thái đơn.

Ví dụ route tạo sản phẩm:

```typescript
@Post('products')
async createProduct(
  @Req() request: Request & { user: JwtPayloadDto },
  @Body() dto: CreateProductDto,
) {
  const product = await this.adminService.createProduct(
    request.user.userId,
    dto,
  );
  return success(product);
}
```

Điểm đáng chú ý:

- `request.user.userId` được lấy từ token đã được giải mã trước đó.
- `@Body() dto` buộc dữ liệu gửi lên phải đúng schema của DTO.
- Kết quả luôn được bọc qua `success(...)` hoặc `paginated(...)` để response đồng nhất với phần còn lại của hệ thống.

## 3. `admin.service.ts` - Nơi xử lý nghiệp vụ thật

```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly redisService: RedisService,
) {}
```

`AdminService` nhận 2 phụ thuộc chính:

- `PrismaService`: đọc/ghi dữ liệu vào database.
- `RedisService`: xóa cache khi dữ liệu sản phẩm hoặc danh mục thay đổi.

Ngoài ra service còn dùng `Logger` để lưu lại dấu vết thao tác của admin, ví dụ admin nào vừa tạo sản phẩm hoặc vừa đổi trạng thái đơn hàng.

### 3.1. Quản lý danh mục

Khi tạo hoặc cập nhật danh mục, service luôn kiểm tra `slug` có bị trùng hay không bằng `ensureUniqueCategorySlug(...)`.

```typescript
async createCategory(adminUserId: number, dto: CreateCategoryDto) {
  await this.ensureUniqueCategorySlug(dto.slug);

  const category = await this.prisma.category.create({
    data: dto,
  });

  await this.invalidateCategoryCache();
  this.logger.log(`Admin ${adminUserId} created category ${category.id}`);

  return category;
}
```

Luồng xử lý ở đây là:

1. Chặn trường hợp `slug` trùng.
2. Tạo dữ liệu trong bảng `category`.
3. Xóa cache danh mục để frontend không dùng dữ liệu cũ.
4. Ghi log thao tác của admin.

### 3.2. Quản lý sản phẩm

Tạo sản phẩm có nhiều bước kiểm tra hơn:

```typescript
async createProduct(adminUserId: number, dto: CreateProductDto) {
  await this.ensureCategoryExists(dto.categoryId);
  await this.ensureUniqueProductSlug(dto.slug);

  const product = await this.prisma.product.create({
    data: {
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      price: new Prisma.Decimal(dto.price),
      stock: dto.stock,
      categoryId: dto.categoryId,
      status: dto.status ?? ProductStatus.ACTIVE,
      images: dto.images?.length
        ? {
            create: dto.images.map((image) => ({
              url: image.url,
              alt: image.alt,
            })),
          }
        : undefined,
    },
    include: {
      images: true,
      category: true,
    },
  });

  await this.invalidateProductCache(product.slug);
  return product;
}
```

Những điểm quan trọng:

- `ensureCategoryExists(dto.categoryId)`: không cho tạo sản phẩm nếu danh mục không tồn tại.
- `ensureUniqueProductSlug(dto.slug)`: tránh 2 sản phẩm dùng cùng một đường dẫn.
- `new Prisma.Decimal(dto.price)`: giá tiền được chuyển sang kiểu số thập phân chính xác để tránh lỗi làm tròn.
- `status ?? ProductStatus.ACTIVE`: nếu admin không gửi trạng thái, sản phẩm mặc định là `ACTIVE`.
- `images?.length ? { create: ... } : undefined`: chỉ tạo bản ghi ảnh khi thật sự có ảnh gửi lên.

Khi cập nhật sản phẩm, service còn xử lý thêm 2 trường hợp:

- Nếu đổi `categoryId` thì kiểm tra danh mục mới có tồn tại không.
- Nếu gửi `images`, toàn bộ ảnh cũ sẽ bị `deleteMany: {}` rồi tạo lại từ dữ liệu mới.

Điều này đơn giản hóa logic đồng bộ ảnh, đổi lại là mỗi lần cập nhật ảnh sẽ thay toàn bộ danh sách thay vì sửa từng ảnh lẻ.

### 3.3. Xóa mềm sản phẩm

```typescript
async softDeleteProduct(adminUserId: number, id: number) {
  const existing = await this.ensureProductExists(id);
  const product = await this.prisma.product.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  await this.invalidateProductCache(existing.slug, product.slug);
  return product;
}
```

Đây không phải xóa cứng khỏi database. Thay vào đó, code gắn `deletedAt` bằng thời điểm hiện tại. Kiểu xóa này gọi là **soft delete**:

- dữ liệu vẫn còn để truy vết hoặc khôi phục;
- tầng đọc dữ liệu có thể chủ động bỏ qua các sản phẩm đã bị xóa mềm.

### 3.4. Quản lý đơn hàng

Admin có thể xem danh sách đơn hàng với phân trang và lọc theo trạng thái:

```typescript
async findOrders(query: AdminOrderQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;
  const where: Prisma.OrderWhereInput = {
    ...(query.status ? { status: query.status } : {}),
  };

  const [orders, total] = await Promise.all([
    this.prisma.order.findMany({ ... }),
    this.prisma.order.count({ where }),
  ]);

  return {
    data: orders.map((order) => new AdminOrderResponseDto(order)),
    total,
    page,
    limit,
  };
}
```

Ở đây có vài kỹ thuật đáng chú ý:

- `page`, `limit`, `skip`: tạo phân trang cơ bản.
- `where`: chỉ thêm điều kiện `status` khi admin thực sự truyền bộ lọc.
- `Promise.all([...])`: lấy danh sách đơn và tổng số lượng song song để giảm thời gian chờ.
- `AdminOrderResponseDto`: chuyển đổi dữ liệu Prisma sang dạng response ổn định hơn, đặc biệt là biến các số kiểu Decimal thành chuỗi.

Khi cập nhật trạng thái đơn hàng, service sẽ kiểm tra đơn có tồn tại trước rồi mới `update`.

## 4. DTO (`src/admin/dto`) - Hàng rào kiểm tra dữ liệu

DTO giúp chặn dữ liệu bẩn ngay từ lớp controller trước khi chạm vào service.

### `product.dto.ts`

```typescript
export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  price!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;
}
```

Một số chi tiết cần để ý:

- `price` đang được nhận dưới dạng `string`, không phải `number`. Sau đó service mới chuyển sang `Prisma.Decimal`.
- `stock` dùng `@Type(() => Number)` để ép kiểu từ dữ liệu HTTP sang số trước khi validate.
- `categoryId` phải là số nguyên dương.
- `status` chỉ chấp nhận giá trị thuộc enum `ProductStatus`.
- `images` là mảng object lồng nhau nên cần `@ValidateNested({ each: true })`.

### `category.dto.ts`

DTO danh mục đơn giản hơn, chỉ gồm `name`, `slug`, `description`, trong đó `description` là tùy chọn.

### `order.dto.ts`

File này phục vụ 3 mục tiêu:

- `AdminOrderQueryDto`: nhận query filter và kế thừa phân trang.
- `UpdateOrderStatusDto`: chỉ cho phép đổi sang giá trị hợp lệ của `OrderStatus`.
- `AdminOrderResponseDto`: chuẩn hóa dữ liệu trả về cho API quản trị đơn hàng.

## 5. Cache và tính nhất quán dữ liệu

Khi admin thay đổi danh mục hoặc sản phẩm, service sẽ chủ động xóa cache:

```typescript
private async invalidateCategoryCache() {
  await this.redisService.del(CACHE_KEYS.CATEGORIES);
  await this.redisService.reset();
}
```

```typescript
private async invalidateProductCache(oldSlug?: string, newSlug?: string) {
  await this.redisService.reset();

  if (oldSlug) {
    await this.redisService.del(CACHE_KEYS.PRODUCT(oldSlug));
  }

  if (newSlug && newSlug !== oldSlug) {
    await this.redisService.del(CACHE_KEYS.PRODUCT(newSlug));
  }
}
```

Ý nghĩa của việc này:

- tránh việc frontend đọc lại dữ liệu cũ sau khi admin vừa sửa;
- nếu slug sản phẩm đổi, cache theo slug cũ và slug mới đều được dọn;
- `reset()` cho thấy hệ thống ưu tiên tính đúng đắn dữ liệu hơn là giữ cache quá lâu.

## 6. Tóm tắt luồng hoạt động

Luồng tổng quát của module admin là:

1. Request đi vào `AdminController`.
2. `AuthGuard` xác thực người dùng, `RolesGuard` kiểm tra role admin.
3. DTO validate dữ liệu đầu vào.
4. `AdminService` xử lý nghiệp vụ với Prisma.
5. Nếu dữ liệu ảnh hưởng đến catalog, Redis cache sẽ bị xóa.
6. Response trả về theo format chung bằng `success(...)` hoặc `paginated(...)`.

Nói ngắn gọn, `src/admin` chính là lớp điều khiển vận hành cho phần backoffice: chỉ admin mới được vào, mọi thay đổi quan trọng đều được kiểm tra, ghi log, và đồng bộ lại cache để phần khách hàng nhìn thấy dữ liệu mới nhất.
