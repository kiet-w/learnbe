# Giải Thích Chi Tiết - Module Orders (`src/orders`)

Module Orders là trái tim của sàn thương mại điện tử, xử lý bước quan trọng nhất: **Thanh toán (Checkout)**. Nơi này cực kỳ nhạy cảm, sai một dòng code có thể dẫn đến thất thoát tiền hoặc bán lố số lượng hàng trong kho.

## 1. `orders.service.ts` - Giao Dịch (Transaction)

**Tại sao phải dùng `$transaction`?**
Khi bạn bấm nút "Đặt hàng", hệ thống phải làm rất nhiều việc:
1. Kiểm tra giỏ hàng có đồ không.
2. Tạo mới đơn hàng (Order).
3. Tạo chi tiết đơn hàng (Order Items).
4. **Trừ số lượng tồn kho (Stock)** của từng sản phẩm.
5. Đổi trạng thái giỏ hàng thành "Đã hoàn thành".

Giả sử hệ thống đang làm đến bước 3 thì máy chủ bị mất điện! Bạn đã có đơn hàng nhưng sản phẩm chưa bị trừ trong kho. Thế là hỏng bét.
**Giải pháp**: `prisma.$transaction`. Prisma sẽ nhóm 5 bước này vào 1 khối (block). Nếu bước 4 lỗi, nó sẽ TỰ ĐỘNG XÓA (Rollback) các bước 1,2,3 trước đó để trả database về nguyên vẹn như chưa có gì xảy ra.

**Phân Tích Code `checkout`:**

```typescript
async checkout(userId: number, dto: CheckoutDto): Promise<OrderResponse> {
  const order = await this.prisma.$transaction(async (tx) => {
    // 1. Lấy giỏ hàng
    const cart = await tx.cart.findFirst({ ... });
    
    // 2. Chuyển giỏ hàng thành dữ liệu đơn hàng
    const orderItemsData = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      subtotal: item.product.price.mul(item.quantity),
    }));

    // 3. Tạo Đơn hàng
    const order = await tx.order.create({
      data: { ... items: { create: orderItemsData } }
    });

    // 4. Trừ tồn kho (Cực kỳ quan trọng)
    for (const item of cart.items) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          stock: { gte: item.quantity }, // Điều kiện: Phải còn ĐỦ hàng mới cho trừ
        },
        data: {
          stock: { decrement: item.quantity }, // Phép trừ trong SQL
        },
      });

      if (updated.count !== 1) {
        // Nếu không trừ được (vì hết hàng hoặc ai đó vừa mua mất) -> Báo lỗi
        throw new BadRequestException(`${item.product.name} không đủ hàng`);
      }
    }

    return order;
  });
  
  return this.serializeOrder(order);
}
```

**Kỹ thuật chống lỗi âm kho hàng (Race Condition):**
Hãy nhìn vào bước 4. Tại sao lại dùng `updateMany` kết hợp với `gte` (greater than or equal - lớn hơn hoặc bằng)?
Nếu 2 khách hàng cùng bấm "Mua" 1 cái áo cuối cùng cùng 1 mili-giây. Nếu code dùng kiểu `if (stock > 0) stock = stock - 1;` thì cả 2 sẽ cùng đi lọt qua hàm if (vì lúc đó kho đang = 1) -> kho thành âm 1.

Thay vào đó, ta ép luôn điều kiện kiểm tra kho và lệnh trừ làm chung 1 cục xuống tận Database SQL (`updateMany` + `decrement`). SQL sẽ đảm bảo chỉ có 1 người được trừ kho thành công, người thứ 2 sẽ nhận về `updated.count === 0` và bị văng lỗi! Kỹ thuật này gọi là **Optimistic Locking**.