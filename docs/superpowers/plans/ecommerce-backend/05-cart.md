# 05 Cart

## Goal

Implement authenticated customer cart APIs with product validation and consistent subtotal calculation.

## Implementation Intent

Cart is temporary customer intent, not an order and not a stock reservation. It should always re-check product availability when items are added or updated, but it must not decrement stock until checkout.

| Cart Rule | Reason |
| --- | --- |
| One active cart per user | Keeps checkout simple and avoids merging multiple active carts. |
| Cart requires login | Avoids guest cart identity and merge complexity in v1. |
| Cart validates product state | Prevents customers from adding inactive/deleted products. |
| Cart does not reserve stock | Avoids abandoned carts blocking inventory. |
| Checkout revalidates stock | Cart state can become stale after other customers buy products. |

## Ownership Contract

- [ ] Every cart operation uses `request.user.userId`.
- [ ] Users can only read/update/delete items from their own active cart.
- [ ] If an item id belongs to another user, return not found or forbidden consistently with project style.
- [ ] Do not accept `userId` from request body or query params for customer cart APIs.

## Quantity Contract

- [ ] Quantity must be a positive integer.
- [ ] Quantity `0` is rejected in v1. Use `DELETE /cart/items/:id` to remove an item.
- [ ] Adding an existing product increments quantity.
- [ ] The final quantity after increment must be less than or equal to current product stock.

## What Not To Build

- [ ] Do not implement guest cart.
- [ ] Do not implement cart merge after login.
- [ ] Do not implement saved-for-later.
- [ ] Do not decrement product stock from cart operations.
- [ ] Do not add coupon/discount fields to cart.

## Endpoint Detail

| Endpoint | Input | Behavior | Success Response | Important Failure |
| --- | --- | --- | --- | --- |
| `GET /cart` | Auth cookie. | Load or create active cart for `request.user.userId`. | Cart response with items, `totalItems`, and `subtotal`. | Missing auth is rejected. |
| `POST /cart/items` | `{ productId, quantity }`. | Add product or increment existing item. | Updated cart. | Product missing/inactive/deleted/insufficient stock. |
| `PATCH /cart/items/:id` | `{ quantity }`. | Replace quantity for current user's item. | Updated cart. | Item not owned by user; quantity invalid; insufficient stock. |
| `DELETE /cart/items/:id` | Item id. | Remove current user's item. | Updated cart or success response. | Item not owned by user. |
| `DELETE /cart` | Auth cookie. | Remove all items from active cart. | Empty cart response or success response. | Missing auth is rejected. |

## Operation Algorithms

| Operation | Required Steps |
| --- | --- |
| Get cart | Read active cart by user id; create if missing; include items/products; compute subtotal from current product price; return wrapper. |
| Add item | Validate product; load/create cart; check existing cart item; compute final quantity; validate final quantity <= stock; create/update item; invalidate cart cache; return cart. |
| Update item | Load item through active cart ownership; validate product state; validate requested quantity <= stock; update quantity; invalidate cart cache; return cart. |
| Remove item | Load item through active cart ownership; delete item; invalidate cart cache; return cart. |
| Clear cart | Delete all items for active cart; invalidate cart cache; return empty cart. |

## Cart Response Calculation

| Value | Calculation |
| --- | --- |
| Item `subtotal` | `product.price * item.quantity` using Decimal-safe math. |
| `totalItems` | Sum of item quantities, not item row count. |
| Cart `subtotal` | Sum of item subtotals. |
| Price display | Return decimal-compatible string/value; do not convert through JS float formatting. |

## Files To Touch

- Create `src/cart/cart.module.ts`
- Create `src/cart/cart.controller.ts`
- Create `src/cart/cart.service.ts`
- Create `src/cart/dto/add-cart-item.dto.ts`
- Create `src/cart/dto/update-cart-item.dto.ts`
- Modify `src/app.module.ts`

## APIs

- [ ] `GET /cart`
- [ ] `POST /cart/items`
- [ ] `PATCH /cart/items/:id`
- [ ] `DELETE /cart/items/:id`
- [ ] `DELETE /cart`

All routes require `AuthGuard`.

## Data Rules

- [ ] Each user has one active cart at a time.
- [ ] `GET /cart` creates an active cart if none exists.
- [ ] Adding the same product increments existing cart item quantity.
- [ ] Updating quantity to `0` is rejected with validation. Use `DELETE /cart/items/:id` to remove an item.
- [ ] Cart item quantity must be positive integer.
- [ ] Product must exist.
- [ ] Product must be `ACTIVE`.
- [ ] Product must have `deletedAt: null`.
- [ ] Product stock must be greater than or equal to requested quantity.

## Response Shape

Cart response:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "items": [
      {
        "id": 1,
        "productId": 10,
        "name": "iPhone 15",
        "slug": "iphone-15",
        "price": "999.00",
        "quantity": 2,
        "subtotal": "1998.00"
      }
    ],
    "totalItems": 2,
    "subtotal": "1998.00"
  }
}
```

## Cache Rules

- [ ] Cart may use `CACHE_KEYS.CART(userId)` for read optimization.
- [ ] Cart database state is always source of truth.
- [ ] Add/update/delete/clear invalidates cart cache.

## Error Cases

- [ ] Product not found returns 404.
- [ ] Product inactive returns 400.
- [ ] Product deleted returns 400.
- [ ] Insufficient stock returns 400.
- [ ] Cart item not owned by user returns 404 or forbidden behavior consistent with existing project style.

## Tests

- [ ] Authenticated user can get empty cart.
- [ ] Adding product creates cart item.
- [ ] Adding same product increments quantity.
- [ ] Updating item changes quantity.
- [ ] Removing item deletes only current user's item.
- [ ] Inactive product cannot be added.
- [ ] Deleted product cannot be added.
- [ ] Quantity above stock is rejected.

## Done Criteria

- [ ] Customer cart APIs work behind auth.
- [ ] Subtotals are returned as decimal-compatible strings.
- [ ] Cart mutation does not modify product stock.
- [ ] Future checkout implementation can load active cart without guessing ownership or quantity rules.
