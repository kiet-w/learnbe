# 09 Testing

## Goal

Verify ecommerce backend behavior with focused unit tests and user-flow e2e tests.

## Implementation Intent

Tests should protect the business rules that are easy to break: product visibility, role authorization, cart ownership, checkout transactions, stock decrement, and order snapshots. Do not rely only on manual API testing.

| Test Layer | Purpose | Examples |
| --- | --- | --- |
| Unit tests | Verify service/guard logic with controlled dependencies. | Cart quantity validation, role guard decisions, checkout failure paths. |
| E2E tests | Verify real HTTP flow, cookies, guards, validation pipe, and module wiring. | Customer login to checkout, admin create product, non-admin blocked. |
| Build | Verify TypeScript, Prisma client types, and module imports. | `npm run build`. |

## Testing Boundaries

- [ ] Do not make tests depend on Redis cache state for correctness.
- [ ] Use unique product/category slugs in tests to avoid collisions.
- [ ] Prefer seeded admin/customer users for e2e login.
- [ ] Keep payment/shipping/coupon/variant/review tests out of v1.
- [ ] Test failure paths before calling a feature complete.

## Minimum Completion Matrix

| Feature | Must Have Happy Path | Must Have Failure Path |
| --- | --- | --- |
| Catalog | List products, detail by slug. | Inactive/deleted product hidden or 404. |
| Cart | Add/update/remove item. | Product inactive/deleted/insufficient stock rejected. |
| Checkout | Cart becomes order, stock decrements, snapshots persist. | Empty cart, insufficient stock, concurrent decrement failure. |
| Orders | User lists and reads own orders. | User cannot read another user's order. |
| Admin | Admin creates/updates/deletes product and changes order status. | Customer/missing token blocked; invalid status rejected. |

## Detailed Test File Plan

| Test File | Focus | Mocking Strategy |
| --- | --- | --- |
| `src/common/utils/api-response.util.spec.ts` | Response helper and pagination metadata. | No Nest module needed. |
| `src/common/dto/pagination-query.dto.spec.ts` | DTO transform/validation. | Use `class-transformer` and `class-validator`. |
| `src/common/guards/roles.guard.spec.ts` | Role allow/block behavior. | Mock `Reflector` and execution context. |
| `src/catalog/catalog.service.spec.ts` | Product/category filtering and cache invalidation. | Mock `PrismaService` and `RedisService`. |
| `src/cart/cart.service.spec.ts` | Cart ownership, quantity, stock validation. | Mock `PrismaService` and `RedisService`. |
| `src/orders/orders.service.spec.ts` | Checkout transaction, snapshots, stock decrement. | Mock Prisma transaction client carefully. |
| `src/admin/admin.service.spec.ts` | Admin writes, soft delete, status update. | Mock catalog/order dependencies or Prisma. |
| `test/ecommerce.e2e-spec.ts` | Full customer/admin HTTP flows. | Use app module, seeded users, Supertest agent for cookies. |

## Fixture/Data Detail

| Fixture | Required Shape | Used By |
| --- | --- | --- |
| Active product | `ACTIVE`, `deletedAt: null`, stock > 0, price Decimal. | Catalog list, cart add, checkout. |
| Inactive product | `INACTIVE`, stock > 0. | Catalog exclusion, cart rejection, checkout rejection. |
| Deleted product | `deletedAt` set. | Catalog exclusion, cart rejection, checkout rejection. |
| Low-stock product | stock `1`. | Insufficient stock and concurrent checkout tests. |
| Admin user | role `ADMIN`, valid password. | Admin e2e flow. |
| Customer user | role `CUSTOMER`, valid password. | Customer e2e flow. |

## Verification Interpretation

- [ ] If unit tests pass but e2e fails, inspect module wiring, guards, cookies, validation pipe, and seeded data.
- [ ] If e2e passes but unit tests are missing failure paths, the feature is not complete.
- [ ] If build fails after Prisma schema changes, run `npx prisma generate` and inspect generated types.
- [ ] If Redis causes flaky tests, mock Redis for unit tests and avoid asserting cache internals in e2e tests.

## Test Commands

- [ ] Unit tests:

```bash
npm test
```

- [ ] E2E tests:

```bash
npm run test:e2e
```

- [ ] Build:

```bash
npm run build
```

## Unit Test Coverage

Catalog:

- [ ] Product list excludes inactive products.
- [ ] Product list excludes soft deleted products.
- [ ] Product list filters by category.
- [ ] Product list filters by price range.
- [ ] Product list searches by keyword.
- [ ] Product list sorts by price ascending.
- [ ] Product list sorts by price descending.
- [ ] Product detail returns by slug.
- [ ] Product detail rejects inactive/deleted product.
- [ ] Cache invalidates after admin product update.

Cart:

- [ ] Empty cart response works.
- [ ] Add item creates active cart if missing.
- [ ] Add same product increments quantity.
- [ ] Update item quantity works.
- [ ] Remove item works.
- [ ] Inactive product cannot be added.
- [ ] Deleted product cannot be added.
- [ ] Insufficient stock is rejected.

Checkout:

- [ ] Empty cart is rejected.
- [ ] Checkout creates order.
- [ ] Checkout creates product name and price snapshots.
- [ ] Checkout creates address snapshot.
- [ ] Checkout decrements stock.
- [ ] Checkout completes cart.
- [ ] Concurrent checkout cannot oversell stock.

Auth and admin:

- [ ] Customer cannot access admin route.
- [ ] Admin can access admin route.
- [ ] Missing token cannot access admin route.
- [ ] Invalid role is rejected.

## E2E Flow Tests

Customer flow:

- [ ] Register or seed customer.
- [ ] Login customer.
- [ ] `GET /products`.
- [ ] `GET /products/:slug`.
- [ ] `POST /cart/items`.
- [ ] `GET /cart`.
- [ ] `POST /orders/checkout`.
- [ ] `GET /orders`.
- [ ] `GET /orders/:id`.

Admin flow:

- [ ] Login admin.
- [ ] Create category.
- [ ] Create product.
- [ ] Update product stock/price/status.
- [ ] Soft delete product.
- [ ] Confirm soft deleted product is absent from public product list.
- [ ] List orders.
- [ ] Update order status.

Failure flows:

- [ ] Non-admin cannot create product.
- [ ] Checkout fails with empty cart.
- [ ] Checkout fails with insufficient stock.
- [ ] Checkout fails when product becomes inactive after being added to cart.
- [ ] User cannot read another user's order.

## Test Data Strategy

- [ ] Use seed data for stable admin/customer accounts.
- [ ] Use unique slugs in tests to avoid collisions.
- [ ] Reset database state between e2e tests if possible.
- [ ] Avoid depending on Redis cache state for core correctness tests.

## Done Criteria

- [ ] `npm test` passes.
- [ ] `npm run test:e2e` passes.
- [ ] `npm run build` passes.
- [ ] Tests cover the main happy path and the important failure paths.
- [ ] Future sessions can identify missing test coverage by comparing implementation to the matrix above.
