# Giải Thích Chuyên Sâu - Module Cart (`src/cart`)

Module `cart` là trái tim của hệ thống thương mại điện tử, chịu trách nhiệm quản lý vòng đời giỏ hàng của người dùng. Tài liệu này cung cấp một cái nhìn cực kỳ chi tiết về sự tương tác giữa Controller và Service, các quyết định thiết kế, và cách các thư viện bên thứ ba được tích hợp.

## 1. Tầng Giao Tiếp (Controllers): `CartController`

`CartController` (`cart.controller.ts`) là cửa ngõ tiếp nhận các HTTP request liên quan đến giỏ hàng. 

### Phép Thuật Của `@UseGuards(AuthGuard)` và `@Req() user`

Toàn bộ controller được bảo vệ bởi `@UseGuards(AuthGuard)`. Điều này tạo ra một "phép thuật" vô hình nhưng vô cùng quan trọng đối với các tham số đầu vào của các endpoint:

1.  **Luồng hoạt động của AuthGuard:** Khi một request chạm tới bất kỳ endpoint nào trong `CartController`, nó sẽ bị chặn lại bởi `AuthGuard`. Guard này sẽ trích xuất JWT Token từ header `Authorization`, xác thực token bằng secret key.
2.  **Gắn kết `user` vào Request:** Nếu token hợp lệ, `AuthGuard` giải mã payload của JWT (chứa thông tin như `userId`, `roles`,...). Bước quan trọng nhất: nó **gắn thẳng payload này vào object `request`** của Express (ví dụ: `request.user = payload`).
3.  **Trích xuất tại Controller:** Nhờ bước trên, trong các hàm của Controller, chúng ta sử dụng decorator `@Req() request: Request & { user: JwtPayloadDto }`. TypeScript hiểu rằng object `request` lúc này đã được "bơm" thêm thuộc tính `user`. Chúng ta lấy được `request.user.userId` một cách an toàn và tin cậy mà không cần phải tự giải mã token trong từng endpoint. Điều này đảm bảo tính đóng gói và tái sử dụng mã.

### Các Endpoints Chính

-   `GET /cart`: Trả về giỏ hàng hiện tại. Chỉ cần truyền `userId` từ token xuống Service.
-   `POST /cart/items`: Thêm một sản phẩm (`AddCartItemDto`). Controller đóng vai trò trạm trung chuyển, gom `userId` từ token và `dto` từ Body để ném xuống `CartService.addItem`.
-   `PATCH /cart/items/:id`: Sửa số lượng của một `CartItem`. Sử dụng `@Param('id', ParseIntPipe)` để đảm bảo ID là một số nguyên trước khi xử lý.
-   `DELETE /cart/items/:id`: Xóa một item khỏi giỏ hàng.
-   `DELETE /cart`: Xóa toàn bộ giỏ hàng (clear cart).

Tất cả các endpoint đều bọc kết quả từ Service vào hàm tiện ích `success(cart)`, trả về format chuẩn API: `{ statusCode: 200, message: '...', data: { ... } }`.

---

## 2. Tầng Nghiệp Vụ (Services): `CartService`

`CartService` (`cart.service.ts`) là nơi chứa toàn bộ logic nghiệp vụ phức tạp.

### Tương Tác Giữa Các Phương Thức Public và Private

Các phương thức public (như `getCart`, `addItem`) hoạt động như các orchestrator (người điều phối), chúng gọi một loạt các helper private để thực hiện nhiệm vụ:

1.  **`addItem(userId, dto)`:**
    *   **Bước 1: Kiểm tra sản phẩm.** Gọi private method `validateProductAvailability(productId, quantity)`. Hàm này sẽ query DB để xem sản phẩm có tồn tại (`NotFoundException`), có đang bán (`BadRequestException`), và số lượng trong kho (`stock`) có đủ đáp ứng không.
    *   **Bước 2: Tìm hoặc tạo giỏ hàng.** Gọi private method `getOrCreateActiveCart(userId)`. Hàm này đảm bảo người dùng luôn có một giỏ hàng trạng thái `ACTIVE`. Nếu chưa có, nó tự động `create` một cái mới trong DB.
    *   **Bước 3: Xử lý item.** Kiểm tra xem sản phẩm đã có trong giỏ chưa bằng ràng buộc duy nhất (`cartId_productId`). Nếu có, tiến hành cộng dồn `quantity` (và kiểm tra tồn kho một lần nữa). Nếu chưa, tạo `CartItem` mới.
    *   **Bước 4: Cập nhật cache.** Trả về bằng cách gọi `refreshCart(userId)`, hàm này sẽ xóa cache Redis cũ và gọi lại `getCart` để trả về dữ liệu mới nhất.

2.  **`updateItem` và `removeItem`:**
    *   Dựa dẫm mạnh mẽ vào private method `findOwnedCartItem(userId, itemId)`. Đây là chốt chặn bảo mật, query DB với điều kiện `itemId` phải thuộc về một `cart` có `userId` tương ứng. Nếu hacker cố gắng sửa `itemId` của người khác, DB sẽ không trả về kết quả và ném ra `NotFoundException`.

### Tối Ưu Hóa Với Redis Caching

`CartService` ứng dụng mạnh mẽ Redis để giảm tải cho Database:
-   **Pattern `getOrSet`:** Trong hàm `getCart(userId)`, hệ thống gọi `redisService.getOrSet`. Nó sẽ kiểm tra key `CACHE_KEYS.CART(userId)`. 
    -   Nếu **Cache Hit** (dữ liệu có trong Redis), trả về ngay lập tức, bỏ qua query DB.
    -   Nếu **Cache Miss**, nó thực thi callback: gọi `getCartWithItems` (query DB), sau đó đưa dữ liệu vào Redis với một TTL (Time To Live), rồi mới trả về.
-   **Cache Invalidation (Xóa cache):** Bất cứ khi nào giỏ hàng bị thay đổi (`addItem`, `updateItem`, `removeItem`, `clearCart`), Service bắt buộc phải gọi `refreshCart(userId)`. Hàm này thực hiện `redisService.del` để xóa bỏ dữ liệu cũ, đảm bảo lần gọi `getCart` tiếp theo sẽ fetch lại dữ liệu mới nhất từ DB.

---

## 3. Theo Dấu Dữ Liệu: Trả Về Và Serialization

Làm thế nào dữ liệu thô từ Database trở thành một JSON Response gọn gàng gửi cho Client? Đó là nhiệm vụ của hàm private `serializeCart`.

### Lược Đồ Chuyển Đổi (`CartResponseDto`)
Khi lấy dữ liệu từ Prisma (`getCartWithItems`), giá sản phẩm được biểu diễn dưới kiểu `Prisma.Decimal`. Đây là cấu trúc dữ liệu đặc biệt giúp bảo toàn độ chính xác tuyệt đối cho các phép toán tài chính (tránh lỗi `0.1 + 0.2 = 0.30000000000000004` phổ biến trong JavaScript do dấu phẩy động).

**Sứ mệnh của `serializeCart`:**
1.  **Tính Toán Chính Xác:** Sử dụng các method của `Decimal` như `.mul(quantity)` và `.plus()` để tính `subtotal` (thành tiền của từng item) và tổng cộng giỏ hàng mà không làm mất độ chính xác.
2.  **Transform (Decimal -> String):** Trước khi trả về object `CartResponseDto`, toàn bộ kiểu `Prisma.Decimal` bắt buộc phải được gọi hàm `.toString()`. 
    -   *Tại sao?* Vì JSON chuẩn (JSON specification) không có kiểu dữ liệu chuẩn cho số thập phân có độ chính xác tùy ý. Nếu để nguyên `Decimal` (hoặc ép về số float bình thường của JS), khi NestJS sử dụng `JSON.stringify` ở chặng cuối để đẩy response qua HTTP, các con số tài chính lớn hoặc lẻ sẽ bị làm tròn sai lệnh ở phía Frontend. Việc chuyển sang `String` (ví dụ: `"199.99"`) đảm bảo Frontend nhận được exacly (chính xác) chuỗi ký tự đó, và Frontend sẽ tự parse lại bằng thư viện xử lý tiền tệ tương ứng.

### Đích Đến Của Dữ Liệu (JSON Destination)
Object `CartResponseDto` (nơi tiền tệ đã là String) được trả ngược lên `CartController`. 
Tại Controller, nó được bọc trong hàm `success()`. NestJS sau đó sẽ chạy qua các Interceptor (nếu có), và cuối cùng sử dụng engine serialization mặc định (thường là `JSON.stringify` của Express/Fastify) để chuyển object JS thành một chuỗi JSON chuẩn. Chuỗi JSON này được nhét vào Body của HTTP Response và gửi qua mạng internet trở về trình duyệt/ứng dụng của người dùng.

---

## 4. Tích Hợp Thư Viện Bên Thứ Ba

### Sức Mạnh Của Prisma (Postgres Relations)
-   **Ràng Buộc Duy Nhất (Unique Constraint):** Prisma sử dụng ràng buộc `cartId_productId` (được định nghĩa trong `schema.prisma`). Điều này đảm bảo ở cấp độ Database rằng trong cùng một giỏ hàng, một sản phẩm không thể xuất hiện 2 dòng (record) khác nhau, mà phải được cộng dồn `quantity` vào một dòng duy nhất.
-   **Join Dữ Liệu Dễ Dàng:** Trong `getCartWithItems`, Prisma cho phép truy vấn lồng nhau cực kỳ trực quan: `include: { items: { include: { product: true } } }`. Chỉ với một lời gọi, Prisma tự động sinh ra các câu lệnh `SQL JOIN` (hoặc nhiều query tối ưu tùy theo engine) để lấy ra toàn bộ Cây Giỏ Hàng -> Chi Tiết Giỏ Hàng -> Thông Tin Sản Phẩm Mức Giá.
