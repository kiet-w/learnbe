# Giải Thích Chi Tiết Chuyên Sâu - Module Catalog (`src/catalog`)

Module Catalog là "quầy trưng bày" của hệ thống e-commerce, chịu trách nhiệm xử lý các luồng dữ liệu liên quan đến danh mục, sản phẩm, tìm kiếm và lọc. Đặc thù của module này là **lượng truy cập đọc (read-heavy) rất lớn**, do đó kiến trúc của nó tập trung tối đa vào tối ưu hoá hiệu năng (Performance) và bộ nhớ đệm (Caching).

Tài liệu này sẽ đi sâu vào sự tương tác giữa Controller và Service, cách xử lý luồng dữ liệu, và các pattern thiết kế được áp dụng.

---

## 1. Controllers: Lớp Giao Tiếp Đầu Vào (`catalog.controller.ts`)

`CatalogController` là điểm chạm đầu tiên tiếp nhận các request từ client.

### 1.1 Chi Tiết Endpoint và Xử Lý Dữ Liệu
Module có 3 endpoints chính:
- `GET /categories`: Lấy toàn bộ danh mục sản phẩm.
- `GET /products`: Lấy danh sách sản phẩm (có hỗ trợ phân trang, lọc, tìm kiếm).
- `GET /products/:slug`: Lấy chi tiết một sản phẩm cụ thể.

### 1.2 Cơ Chế Ánh Xạ URL Query Vào DTO (`@Query() query: ProductQueryDto`)
Trong endpoint `GET /products`, tham số `@Query() query: ProductQueryDto` là một minh chứng rõ ràng cho sức mạnh của NestJS.
- **Cách thức hoạt động:** Khi một request dạng `GET /products?search=iphone&minPrice=1000&page=2` được gửi tới, NestJS không chỉ truyền một đối tượng Javascript thuần tuý vào controller. Dựa vào **Global ValidationPipe** (thường được cấu hình trong `main.ts` với `transform: true`), NestJS sử dụng thư viện `class-transformer` và `class-validator` để tự động khởi tạo (instantiate) một object của class `ProductQueryDto`.
- **Kế thừa (Inheritance):** `ProductQueryDto` kế thừa từ `PaginationQueryDto`. Điều này giúp module Catalog tái sử dụng được logic phân trang mặc định (`page`, `limit`) của toàn hệ thống, đồng thời mở rộng thêm các trường lọc đặc thù (`search`, `minPrice`, `maxPrice`, `category`, `sort`).
- **Lợi ích:** Đảm bảo controller nhận được một đối tượng an toàn, đã được xác thực kiểu dữ liệu và giá trị, giúp loại bỏ các lỗi tiềm ẩn do client gửi dữ liệu sai định dạng trước khi chúng chạm tới lớp logic của Service.

---

## 2. Services: Lõi Logic Trọng Tâm (`catalog.service.ts`)

`CatalogService` là nơi thực thi toàn bộ Business Logic. Service này sử dụng một thiết kế rõ ràng bằng cách tách biệt public API cho controller và các helper private cho xử lý logic nội bộ.

### 2.1 Các Phương Thức Public (Public Methods)
- **`findCategories()`**: Trả về danh sách danh mục (id, name, slug, description). Hàm này tận dụng Redis để lưu bộ nhớ đệm, tối ưu tốc độ cho một bảng dữ liệu hiếm khi thay đổi.
- **`findProductBySlug(slug: string)`**: Lấy dữ liệu chi tiết của một sản phẩm. Nó validate dữ liệu với Prisma (`deletedAt: null`, `status: ACTIVE`) và sẽ ném ra `NotFoundException` (HTTP 404) nếu không tìm thấy.
- **`findProducts(query: ProductQueryDto)`**: Đây là phương thức phức tạp nhất. Nó làm nhiệm vụ kết nối (orchestrate) các private helpers:
  1. Xác định phân trang (`page`, `limit`) và tính toán độ dời (`skip`).
  2. Dùng **`getProductsCacheKey`** để tạo key bộ nhớ đệm duy nhất cho chuỗi truy vấn hiện tại.
  3. Dùng **`buildProductWhere`** và **`getProductOrderBy`** để khởi tạo các tham số truy vấn Prisma.
  4. Trả kết quả (đã serialize và bọc meta data) về cho Controller.

### 2.2 Tương Tác Với Các Private Helpers
Việc chia nhỏ logic vào các hàm private giúp code dễ đọc, dễ test và tuân thủ nguyên lý Single Responsibility Principle (SRP).
- **`buildProductWhere(query: ProductQueryDto)`**: Nhiệm vụ duy nhất là chuyển đổi các điều kiện từ DTO sang định dạng `Prisma.ProductWhereInput`. Nó xử lý linh hoạt việc tìm kiếm không phân biệt hoa thường (`mode: 'insensitive'`) ở cột `name` hoặc `description` (sử dụng toán tử `OR`), và áp dụng khoảng giá (`gte`, `lte`) linh hoạt dựa trên dữ liệu đầu vào.
- **`getProductOrderBy(sort)`**: Dịch chuỗi từ người dùng (ví dụ: `price_asc`) thành object định hướng sắp xếp của Prisma (ví dụ: `{ price: 'asc' }`).
- **`getProductsCacheKey(query, page, limit)`**: Sinh ra một chuỗi định danh duy nhất (sử dụng `URLSearchParams`) để làm key trên Redis. Nếu user A và user B cùng gọi một bộ lọc như nhau, họ sẽ chia sẻ chung một Cache Key, từ đó giảm tối đa lượt gọi vào DB.
- **`serializeProduct(product)`**: Đóng vai trò như một Data Mapper. Nó chuẩn hoá dữ liệu thô từ Prisma (loại bỏ dữ liệu rác, biến đổi kiểu Decimal của thuộc tính `price` sang chuỗi `string` để client dễ dàng parse thành số hoặc hiển thị). Hàm này tạo ra kết quả có cấu trúc nhất quán dạng `ProductListItem`.

---

## 3. Quản Lý Đầu Ra (Returns/Outputs)

Cách Controller và Service cấu trúc phản hồi về phía client là một phần cốt lõi của giao tiếp API RESTful tiêu chuẩn.

### 3.1 Trace Lồng Đầu Ra (Trace the output)
1. Trong Service, kết quả truy vấn từ Prisma được truyền vào mảng `data` sau khi chạy hàm `serializeProduct`. Mảng `data` này cùng với các giá trị `total`, `page`, `limit` được gom lại và trả về cho Controller.
2. Controller nhận kết quả này (có kiểu là object chứa data và metadata) và bọc nó thông qua một hàm tiện ích là `paginated()`.

### 3.2 Tại Sao Lại Dùng `paginated()`?
Hàm `paginated(data, total, page, limit)` tạo ra một chuẩn phản hồi thống nhất toàn hệ thống cho các danh sách dữ liệu. Nó giúp Front-end (hoặc Mobile App) luôn biết cách đọc dữ liệu và trạng thái phân trang mà không phải đoán hay xử lý if-else phức tạp.

### 3.3 Cấu Trúc JSON Chính Xác Trả Về Client
Cấu trúc cuối cùng mà client nhận được từ `GET /products` sẽ luôn có dạng:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sản phẩm A",
      "slug": "san-pham-a",
      "description": "Mô tả sản phẩm A",
      "price": "1000.00",
      "stock": 50,
      "status": "ACTIVE",
      "category": {
        "id": 2,
        "name": "Điện thoại",
        "slug": "dien-thoai"
      },
      "images": [
        {
          "id": 10,
          "url": "https://example.com/image.jpg",
          "alt": "Ảnh sản phẩm A"
        }
      ]
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```
*Lưu ý: Metadata (total, page, limit, totalPages) cho phép UI hiển thị thanh điều hướng trang chính xác.*

---

## 4. Tích Hợp Third-Party & Thư Viện

Module Catalog tận dụng triệt để các sức mạnh của Prisma và Redis để thiết lập kiến trúc tối ưu.

### 4.1 Tối Ưu Bằng `Promise.all` Với Prisma
Khi thực hiện truy vấn danh sách sản phẩm, chúng ta cần 2 dữ liệu: **Danh sách sản phẩm hiện tại (có limit/skip)** và **Tổng số lượng sản phẩm (count) thỏa mãn điều kiện** (để tính số trang cho pagination).
Thay vì chạy tuần tự (`await findMany...` rồi mới `await count...`), `CatalogService` sử dụng `Promise.all()`:
```typescript
const [items, total] = await Promise.all([
  this.prisma.product.findMany({ ... }),
  this.prisma.product.count({ where }),
]);
```
**Tại sao lại dùng `Promise.all`?** 
Nó đẩy đồng thời cả hai truy vấn tới database driver (PostgreSQL/Prisma Client). Cả hai câu SQL sẽ được thực thi song song (concurrent), giúp giảm gần một nửa thời gian chờ phản hồi I/O, đặc biệt trên các server có độ trễ network.

### 4.2 Pattern Cache-Aside Với `redisService.getOrSet`
Toàn bộ service ứng dụng mạnh mẽ mẫu thiết kế **Cache-Aside Pattern** được đóng gói qua hàm `redisService.getOrSet`.
**Cơ chế hoạt động:**
1. **Kiểm tra Cache:** Đầu tiên ứng dụng hỏi Redis: "Có dữ liệu của key `CACHE_KEYS.CATEGORIES` hay chưa?".
2. **Cache Hit (Tìm thấy):** Trả ngay dữ liệu từ RAM của Redis về, kết thúc luồng. (Rất nhanh, thường dưới 5ms).
3. **Cache Miss (Không tìm thấy/Đã hết hạn):** Nếu Redis báo không có, ứng dụng sẽ thực thi hàm callback (là khối lệnh `async () => { return await prisma... }`) để móc dữ liệu từ Database.
4. **Cập nhật Cache:** Nhận kết quả Database xong, `getOrSet` tự động lưu bản sao vào Redis kèm theo một khoảng thời gian sống (TTL - Time To Live) trước khi trả dữ liệu về. Lần gọi API tới có cùng điều kiện sẽ được phục vụ thẳng từ Cache.

Mô hình này giúp cho ứng dụng có khả năng "đỡ" được lượng traffic (CCU) cực lớn đổ vào trang chủ hoặc trang danh mục mà không làm sập Database.
