# 10 AI Coding Task Breakdown

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` when available, or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give AI coding agents an exact backend implementation flow for the ecommerce MVP.

**Architecture:** Implement schema first, then shared contracts, then feature modules in dependency order. Each task should compile or test before the next task starts.

**Tech Stack:** NestJS 11, TypeScript, Prisma 7, PostgreSQL, Redis cache manager, JWT cookie auth, `class-validator`, Jest, Supertest.

---

## Critical Repo Facts

- The current app is modular NestJS under `src/`.
- `PrismaService` reads `DATABASE_URL` at runtime.
- `prisma.config.ts` uses `DIRECT_URL` for Prisma CLI migrations.
- `RedisService.set()` and `RedisService.getOrSet()` currently receive TTL values in milliseconds.
- Existing auth uses HTTP-only cookies named `access_token` and `refresh_token`.
- Existing global validation uses `whitelist`, `transform`, and `forbidNonWhitelisted`.
- Existing global exception filter should remain the response/error boundary.
- The worktree may already contain unrelated dirty files; do not revert them.

## How To Execute This File

This file is the step-by-step operational plan for AI coding sessions. It does not replace subsystem docs; it tells the agent what order to work in.

| Rule | Meaning |
| --- | --- |
| One task at a time | Finish a task, run its verification, then move to the next. |
| Schema first | Do not create services/controllers that depend on Prisma models before the models exist. |
| Shared contracts before features | Response helpers, pagination DTO, and cache constants must exist before catalog/cart/orders use them. |
| Auth roles before admin | Admin routes must not be built before role support exists. |
| Checkout after cart | Checkout depends on active cart behavior and item validation. |
| Tests last but not optional | Full verification must run before final completion. |

## Completion Standard For Every Task

- [ ] Files listed in the task are created or modified.
- [ ] Existing unrelated dirty files are not reverted.
- [ ] GitNexus impact analysis is run before editing existing symbols.
- [ ] The task-specific command passes, usually `npm run build` or targeted tests.
- [ ] Any intentional deviation from subsystem docs is written back into docs.
- [ ] Commit checkpoint is used only if the user wants commits in that session.

## Cross-Task Stop Conditions

- [ ] Stop if an implementation requires payment, shipping provider, coupons, variants, reviews, or frontend UI.
- [ ] Stop if `Decimal` money values are being converted into JS float arithmetic.
- [ ] Stop if stock is being decremented outside checkout.
- [ ] Stop if admin authorization is being implemented with hardcoded email checks.
- [ ] Stop if public catalog returns inactive or soft-deleted products.

## Task Dependency Detail

| Task | Depends On | Produces | Next Task Can Start When |
| --- | --- | --- | --- |
| Preflight | Existing repo only. | Baseline understanding and build status. | Env keys and baseline build are known. |
| Task 1 Schema | Preflight. | Prisma models, migration, seed data. | Prisma client generates and build passes. |
| Task 2 Shared API/cache | Task 1 recommended. | Response helpers, pagination DTO, cache constants. | Helpers compile and can be imported. |
| Task 3 Auth roles | Task 1 role enum. | JWT role payload and `RolesGuard`. | Admin guard pattern compiles. |
| Task 4 Catalog | Task 1, Task 2. | Public category/product APIs. | Public reads compile and cache keys are used. |
| Task 5 Cart | Task 1, Task 2, Task 3. | Authenticated cart APIs. | Cart can load/add/update/remove items. |
| Task 6 Orders | Task 1, Task 2, Task 3, Task 5. | Checkout and customer order APIs. | Checkout transaction compiles and build passes. |
| Task 7 Admin | Task 1, Task 2, Task 3, Task 4, Task 6. | Admin catalog/order APIs. | Admin routes are role-protected and compile. |
| Task 8 Rate/logging | Feature routes exist. | Throttle config and logs. | Build passes after dependency/config changes. |
| Task 9 Tests | Implemented features. | Unit/e2e coverage. | `npm test`, `npm run test:e2e`, and `npm run build` pass. |

## Per-Task Output Detail

| Task | Must Update Docs If |
| --- | --- |
| Schema | Model fields differ, enum values differ, or seed credentials differ from plan. |
| Shared API/cache | Response shape, cache TTL unit, or pagination defaults differ. |
| Auth roles | Token payload, role names, or guard pattern differs. |
| Catalog | Query params, public visibility rules, or cache behavior differs. |
| Cart | Quantity zero behavior, ownership behavior, or response shape differs. |
| Orders | Checkout input, order snapshots, stock decrement, or rollback behavior differs. |
| Admin | Endpoint paths, status lifecycle, or soft-delete behavior differs. |
| Rate/logging | Throttler is deferred or limits differ. |
| Tests | Test file layout or verification command differs. |

## Preflight Task

**Files:**
- Read only: `package.json`
- Read only: `prisma/schema.prisma`
- Read only: `src/app.module.ts`
- Read only: `src/auth/auth.service.ts`
- Read only: `src/auth/auth.guard.ts`
- Read only: `src/redis/redis.service.ts`
- Read only: `src/prisma/prisma.service.ts`

- [ ] **Step 1: Inspect current git status**

Run:

```bash
git status --short
```

Expected: output may show existing dirty files. Do not revert unrelated changes.

- [ ] **Step 2: Confirm package scripts**

Run:

```bash
npm pkg get scripts
```

Expected: scripts include `build`, `test`, `test:e2e`, `seed`, and `postinstall`.

- [ ] **Step 3: Confirm Prisma env keys**

Run:

```bash
grep -n "DATABASE_URL\|DIRECT_URL" .env
```

Expected: both keys exist. If one is missing, stop and ask for env setup before migration.

- [ ] **Step 4: Run baseline build**

Run:

```bash
npm run build
```

Expected: PASS. If it fails before ecommerce changes, record the failure and do not mix baseline fixes with ecommerce work unless approved.

## Task 1: Prisma Ecommerce Schema

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`
- Generated by Prisma: `prisma/migrations/*`

- [ ] **Step 1: Add enums**

Add `UserRole`, `ProductStatus`, `CartStatus`, and `OrderStatus` exactly as defined in [01 Schema & Prisma](./01-schema-prisma.md).

- [ ] **Step 2: Extend `User`**

Add `role`, `carts`, and `orders` to `User`. Keep existing `posts` relation unless a separate cleanup task removes it.

- [ ] **Step 3: Add ecommerce models**

Add `Category`, `Product`, `ProductImage`, `Cart`, `CartItem`, `Order`, and `OrderItem`.

Required money fields:

```prisma
price        Decimal @db.Decimal(10, 2)
total        Decimal @db.Decimal(10, 2)
productPrice Decimal @db.Decimal(10, 2)
subtotal     Decimal @db.Decimal(10, 2)
```

- [ ] **Step 4: Add indexes and uniqueness**

Required:

```prisma
@@index([userId, status])
@@unique([cartId, productId])
```

Also keep `Product.slug` and `Category.slug` unique.

- [ ] **Step 5: Format Prisma schema**

Run:

```bash
npx prisma format
```

Expected: schema formats without error.

- [ ] **Step 6: Create migration**

Run:

```bash
npx prisma migrate dev --name ecommerce_mvp_schema
```

Expected: migration is created and database applies successfully.

- [ ] **Step 7: Update seed**

Seed one admin user, one customer user, three categories, and ten products. Use string or `Prisma.Decimal` values for money.

- [ ] **Step 8: Run seed**

Run:

```bash
npm run seed
```

Expected: seed completes without unique constraint errors.

- [ ] **Step 9: Verify build**

Run:

```bash
npm run build
```

Expected: PASS.

Commit checkpoint:

```bash
git add prisma/schema.prisma prisma/seed.ts prisma/migrations
git commit -m "feat: add ecommerce prisma schema"
```

## Task 2: Shared API Contracts And Cache Constants

**Files:**
- Create: `src/common/dto/pagination-query.dto.ts`
- Create: `src/common/interfaces/api-response.interface.ts`
- Create: `src/common/utils/api-response.util.ts`
- Create: `src/common/constants/cache.constants.ts`

- [ ] **Step 1: Create response interfaces**

Implement `ApiResponse<T>`, `PaginatedMeta`, and `PaginatedApiResponse<T>`.

- [ ] **Step 2: Create response helpers**

Implement:

```ts
export function success<T>(data: T): ApiResponse<T>;
export function paginated<T>(data: T[], total: number, page: number, limit: number): PaginatedApiResponse<T>;
```

- [ ] **Step 3: Create pagination DTO**

Support `page`, `limit`, `search`, `category`, `minPrice`, `maxPrice`, and `sort`. Transform numeric values with `class-transformer`.

- [ ] **Step 4: Create cache constants**

Use keys and millisecond TTL values from [03 Shared API & Cache](./03-shared-api-cache.md).

- [ ] **Step 5: Add focused unit tests if test folder pattern exists**

Place tests beside the implementation using `*.spec.ts`.

- [ ] **Step 6: Run tests and build**

Run:

```bash
npm test -- api-response
npm run build
```

Expected: targeted tests pass if created; build passes.

Commit checkpoint:

```bash
git add src/common
git commit -m "feat: add shared ecommerce api utilities"
```

## Task 3: Auth Role Support

**Files:**
- Modify: `src/auth/auth.service.ts`
- Modify: `src/auth/auth.guard.ts`
- Modify: `src/auth/dto/jwt-payload.dto.ts`
- Modify: `src/auth/dto/auth-response.dto.ts`
- Create: `src/common/decorators/roles.decorator.ts`
- Create: `src/common/guards/roles.guard.ts`

- [ ] **Step 1: Run GitNexus impact before auth edits**

Run impact analysis for `AuthService`, `AuthGuard`, and `AuthResponseDto` before editing those symbols.

- [ ] **Step 2: Add role to JWT payload DTO**

Payload should contain:

```ts
userId: number;
email: string;
role: UserRole;
```

- [ ] **Step 3: Update token generation**

When generating tokens, include `role` from the database user.

- [ ] **Step 4: Update login response**

Return `role` in the response user object.

- [ ] **Step 5: Create `Roles` decorator**

Use `SetMetadata` with `ROLES_KEY = 'roles'`.

- [ ] **Step 6: Create `RolesGuard`**

Use `Reflector` to read allowed roles and compare with `request.user.role`.

- [ ] **Step 7: Run auth tests/build**

Run:

```bash
npm test -- auth
npm run build
```

Expected: existing auth still compiles and tests pass if present.

Commit checkpoint:

```bash
git add src/auth src/common/decorators src/common/guards
git commit -m "feat: add role based auth guard"
```

## Task 4: Catalog Module Public Reads

**Files:**
- Create: `src/catalog/catalog.module.ts`
- Create: `src/catalog/catalog.controller.ts`
- Create: `src/catalog/catalog.service.ts`
- Create: `src/catalog/dto/product-query.dto.ts`
- Modify: `src/app.module.ts`

- [ ] **Step 1: Run GitNexus impact before `AppModule` edit**

Run impact analysis for `AppModule`.

- [ ] **Step 2: Create catalog module/service/controller**

Wire `CatalogModule` into `AppModule`.

- [ ] **Step 3: Implement `GET /categories`**

Return active category list ordered by name and wrapped with `success(data)`.

- [ ] **Step 4: Implement `GET /products`**

Use Prisma `findMany` and `count` with shared query rules:

```ts
where: {
  status: 'ACTIVE',
  deletedAt: null,
  categoryId: query.category,
  OR: search ? [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }] : undefined,
}
```

Apply price filters only when values exist.

- [ ] **Step 5: Implement `GET /products/:slug`**

Return product by slug including category and images. Return 404 if missing, inactive, or deleted.

- [ ] **Step 6: Add Redis cache**

Use `RedisService.getOrSet()` for category list, product list, and product detail. Product list cache key must include query params, not only `products:list`.

- [ ] **Step 7: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

Commit checkpoint:

```bash
git add src/catalog src/app.module.ts
git commit -m "feat: add public catalog api"
```

## Task 5: Cart Module

**Files:**
- Create: `src/cart/cart.module.ts`
- Create: `src/cart/cart.controller.ts`
- Create: `src/cart/cart.service.ts`
- Create: `src/cart/dto/add-cart-item.dto.ts`
- Create: `src/cart/dto/update-cart-item.dto.ts`
- Modify: `src/app.module.ts`

- [ ] **Step 1: Run GitNexus impact before `AppModule` edit**

Run impact analysis for `AppModule`.

- [ ] **Step 2: Create DTOs**

`AddCartItemDto` requires `productId` and positive `quantity`.

`UpdateCartItemDto` requires positive `quantity`. Reject `0` in v1 to keep behavior simple.

- [ ] **Step 3: Create active cart helper**

Implement `getOrCreateActiveCart(userId)`.

- [ ] **Step 4: Implement product validation helper**

Validate product exists, `status === ACTIVE`, `deletedAt === null`, and `stock >= requestedQuantity`.

- [ ] **Step 5: Implement `GET /cart`**

Return cart items, total item count, and subtotal.

- [ ] **Step 6: Implement `POST /cart/items`**

If item exists, increment quantity. Validate final quantity against stock.

- [ ] **Step 7: Implement `PATCH /cart/items/:id`**

Update only the current user's cart item.

- [ ] **Step 8: Implement `DELETE /cart/items/:id`**

Delete only the current user's cart item.

- [ ] **Step 9: Implement `DELETE /cart`**

Clear all items in the current user's active cart.

- [ ] **Step 10: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

Commit checkpoint:

```bash
git add src/cart src/app.module.ts
git commit -m "feat: add customer cart api"
```

## Task 6: Orders And Checkout

**Files:**
- Create: `src/orders/orders.module.ts`
- Create: `src/orders/orders.controller.ts`
- Create: `src/orders/orders.service.ts`
- Create: `src/orders/dto/checkout.dto.ts`
- Modify: `src/app.module.ts`

- [ ] **Step 1: Run GitNexus impact before `AppModule` edit**

Run impact analysis for `AppModule`.

- [ ] **Step 2: Create checkout DTO**

Require `address` as a non-empty string with minimum length.

- [ ] **Step 3: Implement transaction checkout**

Use `this.prisma.$transaction(async (tx) => { ... })`.

- [ ] **Step 4: Load active cart with products**

Include items and products. Reject missing or empty cart.

- [ ] **Step 5: Validate every product**

Reject inactive, deleted, or insufficient-stock products.

- [ ] **Step 6: Calculate Decimal totals**

Avoid native float math for money. Use Prisma Decimal-compatible operations or string conversion.

- [ ] **Step 7: Create order and item snapshots**

Snapshot `address`, `productName`, `productPrice`, `quantity`, and `subtotal`.

- [ ] **Step 8: Decrement stock conditionally**

Use `updateMany` with `stock: { gte: item.quantity }`, `status: ACTIVE`, and `deletedAt: null`.

- [ ] **Step 9: Complete cart**

Set cart status to `COMPLETED` after successful order creation and stock decrement.

- [ ] **Step 10: Implement user order reads**

`GET /orders` and `GET /orders/:id` must only return current user's orders.

- [ ] **Step 11: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

Commit checkpoint:

```bash
git add src/orders src/app.module.ts
git commit -m "feat: add checkout and customer orders"
```

## Task 7: Admin APIs

**Files:**
- Create: `src/admin/admin.module.ts`
- Create: `src/admin/admin.controller.ts`
- Create: `src/admin/admin.service.ts`
- Modify: `src/app.module.ts`

- [ ] **Step 1: Run GitNexus impact before `AppModule` edit**

Run impact analysis for `AppModule`.

- [ ] **Step 2: Create admin module**

Apply `@Roles('ADMIN')` and `@UseGuards(AuthGuard, RolesGuard)` to admin routes or controller.

- [ ] **Step 3: Implement category create/update**

Validate unique slug and invalidate category/product list caches.

- [ ] **Step 4: Implement product create/update**

Validate category exists and slug uniqueness. Invalidate product list and product detail caches.

- [ ] **Step 5: Implement product soft delete**

Set `deletedAt = new Date()` instead of deleting row. Invalidate caches.

- [ ] **Step 6: Implement admin order list**

Support pagination and optional status filter.

- [ ] **Step 7: Implement admin order status update**

Allow only `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, and `CANCELLED`.

- [ ] **Step 8: Add logs for admin writes**

Log admin product writes and order status changes.

- [ ] **Step 9: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

Commit checkpoint:

```bash
git add src/admin src/app.module.ts
git commit -m "feat: add ecommerce admin api"
```

## Task 8: Rate Limiting And Operational Logs

**Files:**
- Modify: `package.json`
- Modify: `src/app.module.ts`
- Modify: `src/catalog/catalog.controller.ts`
- Modify: `src/orders/orders.controller.ts`

- [ ] **Step 1: Decide dependency install**

If implementing rate limit now, install:

```bash
npm install @nestjs/throttler
```

Expected: `package.json` and `package-lock.json` update.

- [ ] **Step 2: Configure throttler**

Add `ThrottlerModule.forRoot()` to `AppModule`.

- [ ] **Step 3: Apply route throttles**

Suggested:

```ts
@Throttle({ default: { limit: 100, ttl: 60000 } })
```

Use stricter limits for checkout if desired:

```ts
@Throttle({ default: { limit: 10, ttl: 60000 } })
```

- [ ] **Step 4: Verify build**

Run:

```bash
npm run build
```

Expected: PASS.

Commit checkpoint:

```bash
git add package.json package-lock.json src/app.module.ts src/catalog src/orders
git commit -m "feat: add ecommerce rate limiting"
```

## Task 9: Tests

**Files:**
- Create or modify `*.spec.ts` files beside services.
- Modify or create e2e tests under `test/`.

- [ ] **Step 1: Add catalog unit tests**

Cover filtering, sorting, soft delete exclusion, and cache invalidation.

- [ ] **Step 2: Add cart unit tests**

Cover add, increment, update, remove, inactive product rejection, deleted product rejection, and insufficient stock rejection.

- [ ] **Step 3: Add checkout unit tests**

Cover empty cart, snapshot creation, stock decrement, completed cart, inactive/deleted product, insufficient stock, and conditional `updateMany` failure.

- [ ] **Step 4: Add role guard unit tests**

Cover admin allowed, customer blocked, and missing user blocked.

- [ ] **Step 5: Add e2e customer flow**

Flow: login customer, list products, get product detail, add cart item, checkout, list orders, get order detail.

- [ ] **Step 6: Add e2e admin flow**

Flow: login admin, create category, create product, update product, soft delete product, list orders, update order status.

- [ ] **Step 7: Run full verification**

Run:

```bash
npm test
npm run test:e2e
npm run build
```

Expected: all pass.

Commit checkpoint:

```bash
git add src test
git commit -m "test: cover ecommerce backend flows"
```

## Final Review Task

- [ ] Run GitNexus detect changes before commit if committing is part of the session.
- [ ] Run `git status --short` and confirm only expected files changed.
- [ ] Run `npm run build`.
- [ ] Run `npm test`.
- [ ] Run `npm run test:e2e`.
- [ ] Update docs if implementation intentionally differs from this plan.
- [ ] Summarize completed tasks, skipped tasks, and verification output.
