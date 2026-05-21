"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderResponseDto = exports.OrderItemResponseDto = void 0;
class OrderItemResponseDto {
    id;
    productId;
    productName;
    productPrice;
    quantity;
    subtotal;
}
exports.OrderItemResponseDto = OrderItemResponseDto;
class OrderResponseDto {
    id;
    status;
    total;
    address;
    createdAt;
    updatedAt;
    items;
}
exports.OrderResponseDto = OrderResponseDto;
//# sourceMappingURL=order-response.dto.js.map