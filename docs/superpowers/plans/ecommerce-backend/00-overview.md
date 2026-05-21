# 00 Overview

## Goal

Build a backend ecommerce MVP on top of the current NestJS project.

The project already has:

- NestJS application modules.
- Prisma service and PostgreSQL setup.
- Redis service/cache setup.
- JWT cookie auth with register, login, refresh, logout, and `me`.
- Global validation pipe.
- Global exception filter.
- Jest and e2e test setup.

## MVP Scope

These items are included in v1. Later sessions should treat this as the contract for what must be built before calling the ecommerce MVP complete.

| Item | What It Means | Not Included In This Item | Done When |
| --- | --- | --- | --- |
| Public product catalog | Anonymous users can list products and view product detail by slug. The list supports pagination, category filter, keyword search, price range filter, and sorting. Only `ACTIVE` and non-deleted products are visible. | Product variants, reviews, wishlists, recommendations, frontend pages. | `GET /products` and `GET /products/:slug` work, return consistent response shape, and exclude inactive/soft-deleted products. |
| Public category list | Anonymous users can fetch categories used for product browsing. Categories have `name`, `slug`, optional `description`, timestamps, and product relation. | Nested category tree, category images, category SEO metadata beyond slug. | `GET /categories` returns ordered categories and uses catalog cache. |
| Customer cart for logged-in users | Authenticated customers can create/read/update/clear an active cart. One user has one active cart. Adding the same product increments quantity. Cart validates stock/status/deleted state before accepting items. | Guest cart, cart merge after login, saved-for-later list, stock reservation. | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, and `DELETE /cart` work behind `AuthGuard`. |
| Checkout from cart into order | Authenticated customer submits shipping address and turns active cart into an order. Checkout runs in a Prisma transaction, snapshots product name/price/address, decrements stock, and marks cart completed. | Payment collection, shipping labels, tax calculation, discount calculation, email confirmation. | `POST /orders/checkout` creates order/items, prevents overselling with conditional stock decrement, and clears/completes the cart. |
| Customer order history | Authenticated customers can list their own orders and inspect one order with item snapshots. Users cannot access other users' orders. | Order cancellation by customer, returns/refunds, invoice PDF. | `GET /orders` and `GET /orders/:id` only return orders owned by `request.user.userId`. |
| Admin product/category management | Admin users can create/update categories, create/update products, and soft-delete products. Admin writes invalidate Redis catalog cache. | Admin dashboard UI, bulk import/export, image upload storage service, inventory audit log. | Admin CRUD APIs work with `User.role = ADMIN`, non-admins are blocked, and deleted products disappear from public catalog. |
| Admin order status management | Admin users can list orders and update order status through the allowed lifecycle: `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`. | Payment status, shipping provider status sync, customer notification service. | Admin can filter/list orders and update status; invalid status is rejected; status changes are logged. |
| Redis cache for catalog reads | Public category/product reads use Redis/cache-manager to reduce database reads. Cache keys and TTL are centralized in `src/common/constants/cache.constants.ts`. | Redis as source of truth, distributed locks, queueing, cache warming jobs. | Category list, product list, and product detail use cache; admin catalog writes invalidate affected keys. |
| Consistent response wrapper and pagination metadata | API responses use `{ success, data }`; paginated lists include `{ total, page, limit, totalPages }`. Shared helpers generate this shape. | Full API versioning, OpenAPI/Swagger generation, frontend client SDK. | Catalog/cart/order/admin responses follow the shared shape unless an existing auth endpoint intentionally keeps its current DTO. |

## Out Of Scope

These items must not be built in v1 unless the plan is intentionally changed. They are excluded to keep the backend small, testable, and shippable.

| Item | Why Excluded From v1 | Future Version Direction | Do Not Accidentally Build |
| --- | --- | --- | --- |
| Real payment gateway | Payment adds external provider state, security concerns, webhook idempotency, failure recovery, and reconciliation. It would make checkout much larger than the current MVP. | Add `Payment`, `PaymentProvider`, `PaymentStatus`, hosted checkout/session creation, and webhook verification in a dedicated payment plan. | Do not call Stripe/PayPal/Momo/VNPay APIs. Do not store card data. Do not mark orders paid. |
| Payment webhook | Webhooks require signature verification, idempotency keys, retry behavior, and mapping provider events to internal state. | Add after real payment provider is selected. Implement webhook endpoint and event table. | Do not create `/webhooks/payment` in v1. Do not add fake webhook state machines. |
| Shipping provider integration | Provider integration needs address normalization, shipping rates, labels, tracking numbers, and carrier callbacks. | Add `Shipment`, `TrackingEvent`, provider adapter, and admin fulfillment flow. | Do not call GHN/GHTK/Viettel Post/FedEx APIs. Store only the submitted address snapshot string. |
| Frontend ecommerce website | Current project is backend-only NestJS. Frontend would require separate UI framework decisions and asset/design work. | Build separate frontend app after backend APIs are stable. | Do not add React/Next/Vite pages to this backend plan. |
| Multi-vendor marketplace | Marketplace requires seller accounts, seller products, commissions, payouts, per-seller order splitting, and moderation. | Add seller domain and payout model in a separate marketplace plan. | Do not add `Seller`, commission, payout, or split-order logic. |
| Coupons, discounts, and promotions | Discounts affect price calculation, order total rules, validation, and abuse prevention. The v1 price is simply `productPrice * quantity`. | Add `Coupon`, `Promotion`, discount rules, and order discount snapshots later. | Do not add coupon code fields, promo tables, or discount math in checkout. |
| Product variants such as size/color | Variants change inventory from product-level stock to variant-level stock and complicate cart/order item identity. | Add `ProductVariant` with SKU, option values, price override, and stock. | Do not add size/color/SKU tables. Use one `Product.stock` field in v1. |
| Reviews and ratings | Reviews require moderation, ownership checks, purchase verification, rating aggregates, and public display rules. | Add `Review` and aggregate rating fields after order flow is stable. | Do not add review endpoints, rating columns, or average rating calculations. |

## Scope Guardrails For Future Sessions

- [ ] If a requested change touches an out-of-scope item, create a new plan before implementing it.
- [ ] If a feature needs new external service credentials, it is out of this MVP unless explicitly approved.
- [ ] If a feature changes checkout total calculation beyond item subtotal sum, it is out of this MVP unless explicitly approved.
- [ ] If a feature requires frontend UI decisions, keep it outside this backend plan.
- [ ] If a feature requires product-level stock to become variant-level stock, stop and redesign schema first.

## Module Boundaries

- `catalog`: public category/product reads and admin catalog writes.
- `cart`: logged-in customer cart state and cart item validation.
- `orders`: checkout transaction and customer order reads.
- `admin`: admin-only route grouping for catalog/order management.
- `common`: response wrapper, pagination helpers, role decorator, cache constants.
- `auth`: existing authentication plus role data.
- `prisma`: database access.
- `redis`: cache access.

## Core Rules

- [ ] Database is the source of truth.
- [ ] Redis cache is an optimization only.
- [ ] Checkout must run inside a Prisma transaction.
- [ ] Money uses Prisma `Decimal`, not JavaScript `Float`.
- [ ] Product deletion is soft delete through `deletedAt`.
- [ ] Product detail route uses `slug`.
- [ ] Customer checkout requires login.
- [ ] Admin access requires `User.role = ADMIN`.

## Response Shape

Single item response:

```json
{
  "success": true,
  "data": {
    "id": 1
  }
}
```

Paginated response:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## Done Criteria

- [ ] All child docs have been implemented.
- [ ] `npm run build` passes.
- [ ] `npm test` passes.
- [ ] `npm run test:e2e` passes.
- [ ] Manual API flow works from login to checkout.
