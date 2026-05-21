# Giải thích chi tiết Module Orders

Tài liệu này cung cấp một cái nhìn sâu sắc (deep dive) vào sự tương tác giữa Controller và Service trong module `orders` của hệ thống. Nó sẽ đi sâu vào cách các endpoint hoạt động, cách chúng giao tiếp với service, cách xử lý transaction an toàn với cơ sở dữ liệu và cách định dạng dữ liệu trả về cho client.

## 1. Controllers (Bộ điều khiển)

File `src/orders/orders.controller.ts` đóng vai trò là cửa ngõ nhận các HTTP request liên quan đến đơn hàng, xử lý kiểm tra bảo mật ban đầu và chuyển tiếp dữ liệu đến Service.

### Các Endpoints

Controller này định nghĩa ba endpoint chính:
- `POST /orders/checkout`: Tạo đơn hàng mới từ giỏ hàng hiện tại (thanh toán).
- `GET /orders`: Lấy danh sách tất cả các đơn hàng của user.
- `GET /orders/:id`: Lấy chi tiết một đơn hàng cụ thể.

### Decorators và Trích xuất Dữ liệu

- **`@UseGuards(AuthGuard)`**: Toàn bộ controller được bảo vệ bởi `AuthGuard`. Điều này đảm bảo chỉ những user đã xác thực (có JWT hợp lệ) mới có thể truy cập các endpoint này. Guard này sẽ phân tích token và gắn thông tin payload vào object `request.user`.
- **Trích xuất `userId`**: Trong mỗi phương thức, chúng ta thấy cách tiếp cận: `@Req() request: Request & { user: JwtPayloadDto }`. Express Request object được mở rộng type để bao gồm thuộc tính `user` (được thêm vào bởi `AuthGuard`). Từ đây, `request.user.userId` được lấy ra và truyền an toàn cho Service. Cách này đảm bảo user chỉ có thể thao tác với đơn hàng của chính họ và không thể xem/sửa đơn hàng của người khác.
- **`@Param('id', ParseIntPipe)`**: Được sử dụng trong endpoint `GET /orders/:id`.
  - `@Param('id')` lấy giá trị `id` từ URL (ví dụ: đường dẫn `/orders/123` thì `id` là `"123"`).
  - `ParseIntPipe` là một NestJS pipe tích hợp sẵn. Nó có hai tác dụng: **Biến đổi** (chuyển chuỗi `"123"` thành số `123`) và **Xác thực** (nếu `id` truyền vào không phải là số hợp lệ, nó sẽ tự động ném ra lỗi `400 Bad Request` trước khi request kịp chạm tới logic bên trong hàm).

## 2. Services (Lớp Logic Nghiệp Vụ)

File `src/orders/orders.service.ts` chứa toàn bộ logic kinh doanh (business logic) cốt lõi của module orders.

### Deep dive: Phương thức `checkout`

Phương thức `checkout` là trái tim của module này, xử lý quá trình chuyển đổi một giỏ hàng thành đơn hàng. Nó bao gồm nhiều bước phức tạp và phải đảm bảo tính toàn vẹn dữ liệu (ACID).

1. **Lấy Giỏ hàng & Kiểm tra (Validation)**:
   - Tìm giỏ hàng đang ở trạng thái `ACTIVE` của user kèm theo các sản phẩm bên trong.
   - Ném lỗi `BadRequestException` nếu giỏ hàng trống, sản phẩm không còn bán (trạng thái khác `ACTIVE` hoặc đã bị xóa mềm `deletedAt`), hoặc số lượng tồn kho (`stock`) không đủ cho đơn hàng.

2. **Tính toán Tổng tiền**:
   - Duyệt qua các items, tính `subtotal` bằng cách nhân giá sản phẩm với số lượng (`item.product.price.mul(item.quantity)`). Chú ý rằng hệ thống sử dụng `Prisma.Decimal` cho các thao tác tiền tệ để tránh lỗi làm tròn số thực (floating-point precision issues).
   - Cộng dồn lại để ra `total` của toàn bộ đơn hàng.

3. **Tạo Đơn hàng (Create Order)**:
   - Tạo bản ghi mới trong bảng `Order` với trạng thái `PENDING`. Dữ liệu của sản phẩm (như giá và tên) tại thời điểm thanh toán được sao chép cứng vào `OrderItem` (`productName`, `productPrice`). Đây là một best practice cực kỳ quan trọng: thông tin trong đơn hàng là "snapshot" lịch sử và sẽ không bị thay đổi nếu sau này người quản trị hệ thống đổi tên hoặc tăng/giảm giá sản phẩm.

4. **Trừ Tồn kho (Deduct Stock)**:
   - Thay vì trừ tồn kho bằng lệnh `update` thông thường, hệ thống sử dụng `updateMany` kết hợp với điều kiện an toàn `stock: { gte: item.quantity }`. (Xem phân tích chi tiết ở mục khóa dữ liệu bên dưới).

5. **Hoàn tất Giỏ hàng**:
   - Cập nhật trạng thái của giỏ hàng hiện tại thành `COMPLETED`. User sẽ tự động có một giỏ hàng mới (`ACTIVE`) khi thêm sản phẩm trong lần mua sắm tiếp theo.

### Prisma `$transaction` API

Toàn bộ 5 bước trên được bọc bên trong một Prisma `$transaction(async (tx) => { ... })`.
- Điều này có nghĩa là tất cả các thao tác đọc/ghi cơ sở dữ liệu bên trong hàm callback `tx` được coi là một **giao dịch duy nhất**.
- Nếu bất kỳ truy vấn nào thất bại, hoặc nếu logic chủ động ném ra một exception (ví dụ: `throw new BadRequestException(...)`), toàn bộ các thay đổi cơ sở dữ liệu sẽ bị **rollback** (hoàn tác) ngay lập tức.
- Ví dụ: Đơn hàng đã được tạo, nhưng việc trừ tồn kho của sản phẩm thứ hai bị thất bại vì có người khác vừa mua hết. Prisma sẽ tự động xóa bản ghi đơn hàng vừa tạo, trả lại nguyên trạng tồn kho của sản phẩm thứ nhất, hủy bỏ thay đổi trạng thái giỏ hàng, và báo lỗi cho người dùng. Không bao giờ xảy ra tình trạng dữ liệu "nửa vời".

### Cơ chế Khóa Lạc quan/Bi quan (Optimistic/Pessimistic Locking) bằng `updateMany`

Việc trừ tồn kho là một thao tác nhạy cảm, dễ gặp lỗi *race condition* (khi nhiều user cùng thanh toán một sản phẩm tại cùng một thời điểm, dẫn đến bán vượt quá số lượng trong kho). Hệ thống giải quyết triệt để việc này bằng `updateMany`:

```typescript
const updated = await tx.product.updateMany({
  where: {
    id: item.productId,
    status: ProductStatus.ACTIVE,
    deletedAt: null,
    stock: { gte: item.quantity }, // ĐIỀU KIỆN THEN CHỐT
  },
  data: {
    stock: { decrement: item.quantity },
  },
});

if (updated.count !== 1) {
  throw new BadRequestException(`${item.product.name} không đủ hàng`);
}
```

- **Ngăn chặn Race Condition**: Dưới database, truy vấn SQL sinh ra sẽ có dạng `UPDATE Product SET stock = stock - quantity WHERE id = X AND stock >= quantity`. Các hệ quản trị cơ sở dữ liệu quan hệ (như PostgreSQL/MySQL) sẽ áp dụng khóa cấp độ hàng (row-level lock) tự động cho bản ghi này trong lúc thực thi câu lệnh UPDATE.
- Nếu có hai request (A và B) cùng chạy tới đoạn code này cùng lúc, cơ sở dữ liệu sẽ bắt buộc chúng phải xếp hàng. Request A chạy trước, thỏa mãn `stock >= quantity`, tồn kho bị trừ thành công. Khi Request B thực thi ngay sau đó, nó kiểm tra điều kiện `stock >= quantity`, nếu lượng tồn kho hiện tại không còn đủ, câu lệnh UPDATE sẽ thất bại và bỏ qua bản ghi đó (`updated.count === 0`). Service sau đó ném lỗi `BadRequestException`, hủy transaction. Đây là một dạng khóa thông minh giúp bảo toàn dữ liệu an toàn tuyệt đối ở môi trường đồng thời (concurrency) cao.

## 3. Returns và Outputs

### Helper method `serializeOrder`

Prisma trả về dữ liệu có kiểu phức tạp, đặc biệt là các trường tiền tệ (như giá sản phẩm, tổng tiền) được định dạng bằng kiểu `Prisma.Decimal`. Nếu trả trực tiếp các object này qua HTTP, các thư viện JSON (như của Express) thường sẽ biến chúng thành object lồng nhau khó đọc hoặc gặp lỗi làm tròn sai.

Để giải quyết, `OrdersService` định nghĩa một hàm private là `serializeOrder`:
- **Chuyển đổi Decimal thành String**: `.toString()` được gọi trên các biến `total`, `productPrice`, `subtotal`. Client sẽ nhận chuỗi (string) - ví dụ `"150000.00"` - và có thể hiển thị trực tiếp hoặc dùng các thư viện xử lý tiền tệ riêng ở Frontend.
- **Chuẩn hóa dữ liệu trả về**: Hàm này cấu trúc chính xác kiểu dữ liệu thành object `OrderResponse` mong muốn, "phẳng hóa" (flatten) các quan hệ phức tạp và loại bỏ các trường không cần thiết khỏi payload.

### Vòng đời dữ liệu (Data Lifecycle) từ Service tới Controller

1. Service sử dụng `serializeOrder` và trả về một object đã được chuẩn hóa (kiểu `OrderResponse`).
2. Trở lại `OrdersController`, dữ liệu này được nhận và bao bọc bởi hàm tiện ích `success()` (từ `src/common/utils/api-response.util`): `return success(order);`.
3. Hàm `success()` có nhiệm vụ cấu trúc lại toàn bộ phản hồi API theo một quy ước chung thống nhất của toàn hệ thống (Standardized API Response). Thông thường, dạng trả về sẽ là:
   ```json
   {
     "success": true,
     "data": {
       "id": 1,
       "status": "PENDING",
       "total": "150000.00",
       "address": "123 Đường ABC",
       "createdAt": "2026-05-21T10:00:00.000Z",
       "updatedAt": "2026-05-21T10:00:00.000Z",
       "items": [
         {
           "id": 10,
           "productId": 5,
           "productName": "Sản phẩm A",
           "productPrice": "150000.00",
           "quantity": 1,
           "subtotal": "150000.00"
         }
       ]
     }
   }
   ```
4. Cuối cùng, NestJS sẽ tự động đảm nhiệm quá trình tuần tự hóa object kết quả này thành một chuỗi JSON chuẩn và đính kèm vào response HTTP với status `200 OK` (mặc định) để gửi về cho phía client.
