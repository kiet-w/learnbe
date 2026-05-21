# Giải Thích Chuyên Sâu - Module Redis (`src/redis`)

Module Redis đóng vai trò là Lớp Bộ Nhớ Đệm (Caching Layer) toàn cục. Với khả năng lưu trữ dữ liệu trực tiếp trên RAM thay vì ổ cứng, Redis giúp tăng tốc độ phản hồi gấp hàng nghìn lần và giảm tải (load) cực lớn cho hệ cơ sở dữ liệu chính yếu (PostgreSQL), đặc biệt hữu dụng với các dữ liệu được đọc thường xuyên (như danh sách sản phẩm) nhưng ít thay đổi.

## 1. Tích Hợp Thư Viện Bên Thứ Ba: `cache-manager`

Bên trong `redis.service.ts`, chúng ta không tương tác trực tiếp với các SDK thô của Redis (như `ioredis` hay `redis` client native). Thay vào đó, dự án sử dụng cầu nối tiêu chuẩn của hệ sinh thái NestJS thông qua thư viện `cache-manager` và module `@nestjs/cache-manager`.

```typescript
constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
```

- **Lợi ích cốt lõi**: `cache-manager` cung cấp một lớp trừu tượng (abstraction layer). Bằng cách chích (inject) `CACHE_MANAGER`, chúng ta có được các hàm giao tiếp chuẩn hóa như `.get()`, `.set()`, `.del()`.
- **Tính linh hoạt (Agnostic Caching)**: Cấu trúc này giải phóng logic code khỏi việc bị trói buộc với một nhà cung cấp cụ thể. Nếu trong tương lai có yêu cầu đổi từ Redis sang In-Memory Cache (RAM cục bộ của Node.js) hoặc Memcached, bạn chỉ cần thay đổi cấu hình kết nối tại `AppModule` hoặc `RedisModule`. Toàn bộ file `RedisService` và các Domain Services đang sử dụng nó sẽ **không cần phải sửa đổi dù chỉ một dòng code**.

## 2. Public Methods vs Private Logic: Sức Mạnh Của Hàm `getOrSet`

Trong khi các hàm `get`, `set`, `del`, `reset` được khai báo public chỉ là những lớp bọc mỏng (thin wrappers) gọi thẳng xuống `cache-manager`, sức mạnh nghiệp vụ thực sự của module này lại hội tụ hoàn toàn ở hàm `getOrSet`.

Hàm `getOrSet` là hiện thân hoàn hảo của một mẫu thiết kế kinh điển mang tên **Cache Aside Pattern** (Mẫu Bộ Đệm Nằm Ngoài). Logic nội bộ của hàm này tự động hóa vòng đời của việc truy xuất: "Kiểm tra cache -> Trả về nếu có -> Tính toán/Truy vấn DB nếu thiếu -> Lưu lại vào cache -> Trả về kết quả".

### Cơ Chế Hoạt Động Của Callback (`fetchFunction`)

Hãy phân tích chữ ký hàm:
```typescript
async getOrSet(
  key: string,
  fetchFunction: () => Promise<any>,
  ttl: number = 30000,
)
```

Điều khiến `getOrSet` mạnh mẽ là tham số `fetchFunction`. Đây không phải là một biến chứa dữ liệu tĩnh, mà là một **Hàm Callback** (một khối lệnh hứa hẹn sẽ trả về dữ liệu - Promise). Tham số này cho phép `RedisService` **trì hoãn (defer)** việc tiêu tốn tài nguyên truy vấn DB cho tới giây phút thực sự bắt buộc phải làm vậy.

**Các bước diễn ra bên trong:**
1. **Nhận Lệnh**: Từ một Domain Service (vd: `CatalogService`), lập trình viên gọi `getOrSet` và truyền vào một định danh (key) kèm theo một khối lệnh truy vấn DB: `() => this.prisma.product.findMany()`. Lưu ý: Lúc này khối lệnh Prisma **chưa hề chạy**.
2. **Kiểm Tra Trạng Thái (Cache Hit/Miss)**: Logic nội bộ của `getOrSet` sẽ ưu tiên gọi `await this.cacheManager.get(key)` để tra cứu RAM.
3. **Thực Thi Callback Động (Lazy Execution)**: Nếu dữ liệu đã tồn tại trong Redis, `getOrSet` bỏ qua `fetchFunction` và trả về ngay kết quả. Nhưng nếu Redis trống (Cache Miss), nó mới kích hoạt nòng súng: gọi `await fetchFunction()`. Ngay tại khoảnh khắc này, truy vấn Prisma mới thực sự đổ xuống PostgreSQL.
4. **Cập Nhật & Phản Hồi**: Kết quả được hứng lại, lưu (set) vào Redis với thời hạn `ttl` đã định, trước khi được đóng gói trả về.

Thiết kế kiến trúc này tạo ra ranh giới tách bạch tuyệt đối: Logic truy vấn DB (sự hiểu biết về bảng/cột) nằm ở Domain Service, trong khi Logic quản trị Bộ nhớ đệm (vòng đời, TTL, hit/miss) nằm ở Redis Service. Chúng không bị chồng chéo (coupled) lẫn nhau.

## 3. Luồng Trả Về Và Đích Đến (Returns/Outputs)

Bản thân `RedisService` đóng vai trò là một "kho trung chuyển".
- **Kết quả trả về**: Khi một phương thức bên ngoài hoàn tất việc gọi `this.redisService.getOrSet(...)`, cái mà nó nhận lại được là một tập hợp dữ liệu JSON nguyên vẹn y hệt như những gì DB trả ra. Đối với người gọi, họ hoàn toàn "mù mờ" (transparency) - họ không cần biết dữ liệu này vừa được lôi ra từ kho Redis trên RAM tốc độ ánh sáng hay vừa phải đào bới từ ổ cứng PostgreSQL lên.
- **Đích đến**: Sau khi ra khỏi `RedisService`, tập dữ liệu này chảy ngược về cho **Domain Service** tương ứng (như `CatalogService`). Tại đây, dữ liệu cache có thể được trộn lẫn, lọc bớt, hay biến đổi thành các Data Transfer Object (DTO) an toàn trước khi Controller mang nó đi trả về dưới dạng JSON Response cho client/người dùng qua API.
