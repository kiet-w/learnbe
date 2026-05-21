# Giải Thích Chi Tiết - Module Catalog (`src/catalog`)

Module Catalog đóng vai trò như một quầy trưng bày sản phẩm (danh mục, sản phẩm, tìm kiếm, lọc giá). Đặc điểm lớn nhất của module này là **hiệu năng (Performance)** vì ai vào web cũng sẽ xem sản phẩm đầu tiên.

## 1. `catalog.controller.ts`

```typescript
@Get('products')
async getProducts(@Query() query: ProductQueryDto) {
  const result = await this.catalogService.findProducts(query);
  return paginated(result.data, result.total, result.page, result.limit);
}
```
- `@Query()`: Lấy các thông số trên URL, ví dụ: `?page=1&limit=10&search=laptop`. Các thông số này được map vào class `ProductQueryDto`.
- `paginated`: Một hàm tiện ích dùng để gói dữ liệu trả về theo một chuẩn nhất định (có thông tin tổng số trang, tổng số sản phẩm).

## 2. `catalog.service.ts` (Xử Lý Logic Tìm Kiếm & Cache)

**Lấy danh sách sản phẩm (`findProducts`):**
```typescript
async findProducts(query: ProductQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  
  // 1. Tạo một cái tên (Key) riêng biệt cho từng kiểu tìm kiếm
  const cacheKey = this.getProductsCacheKey(query, page, limit);

  return this.redisService.getOrSet(
    cacheKey,
    async () => {
      // 2. Nếu Redis chưa có thì mới chạy vào đây lấy từ Database
      const [items, total] = await Promise.all([
        this.prisma.product.findMany({ ... }),
        this.prisma.product.count({ where })
      ]);
      return { data: items, total, page, limit };
    },
    CACHE_TTL.PRODUCTS // 3. Lưu lại trong Cache 5 phút
  );
}
```
Tại sao gọi `findProducts` là nghệ thuật tối ưu?
1. **Dynamic Cache Key**: Hàm `getProductsCacheKey` sẽ nối các điều kiện tìm kiếm lại (vd: `products:list:page=1&search=iphone`). Bất kỳ ai tìm giống hệt vậy trong 5 phút tới sẽ nhận ngay kết quả từ RAM (Redis) cực nhanh.
2. **`Promise.all`**: Khi lấy danh sách sản phẩm, ta cũng cần lấy tổng số sản phẩm (để làm phân trang). `Promise.all` giúp chạy 2 câu lệnh này **cùng một lúc** thay vì chờ câu này xong mới chạy câu kia, giúp giảm một nửa thời gian chờ đợi Database.

**Bộ lọc Sản Phẩm (`buildProductWhere`):**
```typescript
private buildProductWhere(query: ProductQueryDto) {
  return {
    status: ProductStatus.ACTIVE, // Chỉ lấy hàng đang bán
    deletedAt: null,              // Bỏ qua hàng đã bị xóa mềm (soft delete)
    ...(search ? { OR: [ { name: { contains: search } } ] } : {}), // Tìm theo tên
  };
}
```
Đoạn code này dùng kỹ thuật **Spread Operator (`...`)** của Javascript để lắp ráp linh động câu lệnh truy vấn. Nếu có `search` thì mới thêm điều kiện tìm kiếm bằng tên vào. Rất gọn gàng!