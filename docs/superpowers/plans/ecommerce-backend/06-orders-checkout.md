# 06 Orders & Checkout

## Goal

Create checkout flow that converts an authenticated user's active cart into an order without overselling stock.

## Implementation Intent

Checkout is the most important correctness boundary in this MVP. It is the only place that turns customer intent into durable order data and inventory changes. It must be transactional, must snapshot historical values, and must protect against concurrent buyers.

| Checkout Concern | Required Behavior |
| --- | --- |
| Cart freshness | Re-read active cart and product data inside transaction. |
| Empty cart | Reject before creating order. |
| Product state | Reject inactive or soft-deleted product. |
| Stock | Use conditional decrement so two checkouts cannot oversell. |
| Money | Use Decimal-compatible calculation, not JS float math. |
| History | Snapshot address, product name, product price, quantity, and subtotal. |
| Cart lifecycle | Mark cart `COMPLETED` only after order and stock updates succeed. |

## Order State Contract

- [ ] New orders start as `PENDING`.
- [ ] Payment status does not exist in v1.
- [ ] Shipping provider status does not exist in v1.
- [ ] Customer order reads always use snapshot fields for display.
- [ ] Product relation remains for traceability, not for historical name/price display.

## What Not To Build

- [ ] Do not add payment collection or paid/unpaid status.
- [ ] Do not send emails.
- [ ] Do not call shipping APIs.
- [ ] Do not calculate tax or discounts.
- [ ] Do not let customer read another user's order.

## Checkout Phase Detail

| Phase | What Happens | Failure Behavior |
| --- | --- | --- |
| Load cart | Find active cart for `userId`, include items and products. | Missing/empty cart throws `BadRequestException`. |
| Validate product state | Check each product exists, active, not deleted. | Throw clear product-specific error. |
| Validate stock | Check current stock is enough before creating order. | Throw insufficient stock error. |
| Calculate totals | Compute each subtotal and order total using Decimal-safe math. | Never use imprecise JS float math for persisted totals. |
| Create order | Insert order with `PENDING`, address snapshot, total. | Transaction rolls back on later failure. |
| Create order items | Insert item snapshots for name/price/quantity/subtotal. | Transaction rolls back on later failure. |
| Decrement stock | Use conditional `updateMany` for each product. | If any count is not `1`, throw and rollback. |
| Complete cart | Set cart status to `COMPLETED`. | Only after order/items/stock succeed. |
| Return order | Include order items. | Response uses snapshot fields. |

## Response Detail

Order response should include:

| Field | Source | Notes |
| --- | --- | --- |
| `id` | `Order.id` | Main order identifier. |
| `status` | `Order.status` | Starts as `PENDING`. |
| `total` | `Order.total` | Decimal-safe value/string. |
| `address` | `Order.address` | Snapshot from checkout input. |
| `items[].productId` | `OrderItem.productId` | Traceability to product. |
| `items[].productName` | `OrderItem.productName` | Display this, not live product name. |
| `items[].productPrice` | `OrderItem.productPrice` | Display this, not live product price. |
| `items[].quantity` | `OrderItem.quantity` | Purchased quantity. |
| `items[].subtotal` | `OrderItem.subtotal` | Snapshot subtotal. |

## Rollback Contract

- [ ] If order item creation fails, stock must not be decremented.
- [ ] If any stock decrement fails, order and order items must not persist.
- [ ] If cart completion fails, order and stock decrement must roll back.
- [ ] If checkout throws, active cart remains available for user correction unless transaction completed.

## Files To Touch

- Create `src/orders/orders.module.ts`
- Create `src/orders/orders.controller.ts`
- Create `src/orders/orders.service.ts`
- Create `src/orders/dto/checkout.dto.ts`
- Modify `src/app.module.ts`

## APIs

- [ ] `POST /orders/checkout`
- [ ] `GET /orders`
- [ ] `GET /orders/:id`

All routes require `AuthGuard`.

## Checkout Input

```json
{
  "address": "123 Nguyen Trai, District 1, Ho Chi Minh City"
}
```

Validation:

- [ ] `address` is required.
- [ ] `address` is string.
- [ ] `address` has reasonable min length, for example 10 characters.

## Checkout Transaction Rules

Inside `this.prisma.$transaction(async (tx) => { ... })`:

- [ ] Load active cart with items and products.
- [ ] Reject when cart does not exist.
- [ ] Reject when cart is empty.
- [ ] For every item, check product exists, is active, is not deleted, and has enough stock.
- [ ] Calculate total using Decimal-compatible math.
- [ ] Create order with `userId`, `address`, `status: PENDING`, and `total`.
- [ ] Create order items with snapshots: `productName`, `productPrice`, `quantity`, `subtotal`.
- [ ] Decrement stock using conditional update to prevent concurrent overselling.
- [ ] If conditional stock decrement updates zero rows, throw insufficient stock error.
- [ ] Mark cart as `COMPLETED`.
- [ ] Return created order with items.

## Concurrent Stock Protection

Use conditional update pattern:

```ts
const updated = await tx.product.updateMany({
  where: {
    id: item.productId,
    status: 'ACTIVE',
    deletedAt: null,
    stock: { gte: item.quantity },
  },
  data: {
    stock: { decrement: item.quantity },
  },
});

if (updated.count !== 1) {
  throw new BadRequestException(`${item.product.name} không đủ hàng`);
}
```

## Order Read Rules

- [ ] `GET /orders` returns only current user's orders.
- [ ] `GET /orders/:id` returns only current user's order.
- [ ] Include order items.
- [ ] Include product id for traceability, but display name/price from snapshot fields.

## Error Cases

- [ ] Empty cart returns 400.
- [ ] Product inactive returns 400.
- [ ] Product deleted returns 400.
- [ ] Insufficient stock returns 400.
- [ ] Order not owned by user returns 404.

## Logging

- [ ] Log checkout success with user id and order id.
- [ ] Log checkout failure with user id and reason.

## Tests

- [ ] Checkout creates order.
- [ ] Checkout creates order item snapshots.
- [ ] Checkout decrements product stock.
- [ ] Checkout marks cart completed.
- [ ] Checkout rejects empty cart.
- [ ] Checkout rejects inactive/deleted product.
- [ ] Checkout rejects insufficient stock.
- [ ] Concurrent checkout cannot make stock negative.
- [ ] User cannot read another user's order.

## Done Criteria

- [ ] Checkout is transactional.
- [ ] Stock cannot become negative.
- [ ] Order history works for current user.
- [ ] Future admin status management can operate on created orders without changing checkout behavior.
