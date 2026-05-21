# Giải Thích Chi Tiết - Module Redis (`src/redis`)

Redis là một kho chứa dữ liệu nằm thẳng trên RAM (bộ nhớ tạm của máy tính). Truy xuất dữ liệu từ RAM nhanh hơn gấp hàng nghìn lần so với việc đọc từ ổ cứng (Database/PostgreSQL). Ở đây, ta dùng Redis làm **Cache** (Bộ nhớ đệm).

## 1. `redis.module.ts`

Tương tự như Prisma, `RedisModule` cũng được gắn chữ `@Global()` để trở thành đồ dùng chung cho cả công ty. Ai cần dùng Cache cứ gọi `RedisService` ra là được.

## 2. `redis.service.ts` (Dịch Vụ Tối Ưu Tốc Độ)

Dịch vụ này được thiết kế để giấu đi sự phức tạp của việc thao tác với Cache.

```typescript
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  // ...
}
```
- Sử dụng `@nestjs/cache-manager` làm công cụ lõi để tương tác với server Redis thật.

**Hàm Tuyệt Chiêu: `getOrSet`**

Đây là hàm quan trọng nhất trong file này. Nó hoạt động theo một tư duy gọi là "Cache Aside Pattern".

```typescript
async getOrSet(key: string, fetchFunction: () => Promise<any>, ttl: number = 30000) {
  // Bước 1: Mở tủ lạnh (Redis) xem có đồ ăn (dữ liệu) không?
  const cachedData = await this.cacheManager.get(key);
  
  if (cachedData) {
    // Có thì lấy ra ăn luôn, cực kỳ nhanh!
    console.log(`⚡ Lấy [${key}] từ tủ lạnh Redis!`);
    return cachedData;
  }

  // Bước 2: Tủ lạnh trống rỗng, phải lặn lội đi siêu thị (xuống Database PostgreSQL)
  console.log(`🐌 Xuống hầm tìm dữ liệu cho [${key}]...`);
  const freshData = await fetchFunction();
  
  // Bước 3: Mua về xong, cất một bản vào tủ lạnh (lưu Cache) để lần sau lấy cho lẹ
  await this.cacheManager.set(key, freshData, ttl);

  return freshData;
}
```

- Tham số `fetchFunction: () => Promise<any>` là một hàm. Tức là `getOrSet` nói với các module khác rằng: *"Cứ đưa tôi chìa khóa (Key) và cách đi lấy hàng (fetchFunction). Nếu tôi có sẵn tôi sẽ trả luôn, nếu không tôi sẽ tự chạy cái hàm lấy hàng của anh rồi lưu lại cho anh!"*

Nhờ thiết kế hàm này, các module như `Catalog` hay `Cart` viết code cực kỳ ngắn gọn và sạch sẽ khi muốn áp dụng bộ nhớ đệm.