# 01 Schema & Prisma

## Goal

Add ecommerce database structure with correct money handling, snapshots, soft delete, stock, and seed data.

## Implementation Intent

This file defines the database contract for the entire ecommerce MVP. Future sessions should not treat these models as rough suggestions: cart, checkout, admin APIs, cache invalidation, and tests all depend on this shape.

| Concept | Why It Exists | Used By |
| --- | --- | --- |
| `Product.price Decimal` | Money must not use floating point math. Decimal avoids rounding bugs in totals and snapshots. | Catalog, cart subtotal, checkout total, order item snapshot. |
| `Product.slug` | Product detail uses SEO-friendly stable URL keys instead of numeric ids. | `GET /products/:slug`, product detail cache key. |
| `Product.deletedAt` | Admin product delete is soft delete so historical order items can still reference the product. | Public catalog filtering, admin product delete, order history. |
| `Order.address` | Checkout stores the shipping address at purchase time so later user/address edits do not change historical orders. | Checkout, customer order detail, admin order list. |
| `OrderItem.productName` and `productPrice` | Order item data must stay historically correct if the product is renamed or repriced later. | Customer order history, admin order detail. |
| `CartStatus` | Checkout completes a cart instead of deleting it, preserving traceability. | Cart lookup, checkout transaction. |
| `UserRole` | Admin access is role-based, not email-based. | Auth tokens, `RolesGuard`, admin APIs. |

## Boundary Decisions

- [ ] Product stock is stored on `Product.stock`; do not create `ProductVariant` or SKU-level inventory in v1.
- [ ] Cart does not reserve stock; stock is only decremented in checkout.
- [ ] Orders do not have payment fields in v1.
- [ ] `Order.address` is a string snapshot in v1; do not create address tables unless a new plan says so.
- [ ] Keep existing `Post` model unless a separate cleanup task removes learning/demo data.

## Model Detail Matrix

| Model/Enum | Responsibility | Required Fields | Important Relations | Agent Notes |
| --- | --- | --- | --- | --- |
| `UserRole` | Distinguishes customer and admin behavior. | `CUSTOMER`, `ADMIN` | Used by `User.role`. | Do not add `STAFF`, `SELLER`, or `SUPER_ADMIN` in v1. |
| `ProductStatus` | Controls public product visibility without deleting data. | `ACTIVE`, `INACTIVE` | Used by `Product.status`. | Public catalog must only show `ACTIVE`. |
| `CartStatus` | Tracks cart lifecycle. | `ACTIVE`, `COMPLETED`, `ABANDONED` | Used by `Cart.status`. | Checkout sets cart to `COMPLETED`; do not delete cart after checkout. |
| `OrderStatus` | Tracks simple fulfillment lifecycle. | `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED` | Used by `Order.status`. | This is not payment status. |
| `Category` | Groups products for browsing/filtering. | `name`, `slug`, `createdAt`, `updatedAt` | `products Product[]` | Keep flat categories in v1; no parent/child tree. |
| `Product` | Sellable item with price and stock. | `name`, `slug`, `price`, `stock`, `status`, `categoryId`, timestamps | Category, images, cart items, order items | `deletedAt` is soft delete. Keep stock here, not variant-level. |
| `ProductImage` | Stores product image URLs. | `url`, `productId`, `createdAt` | Belongs to product | Do not implement file upload/storage in v1; store URL string only. |
| `Cart` | Active customer shopping cart. | `userId`, `status`, timestamps | User, cart items | One active cart per user in service logic; schema index supports lookup. |
| `CartItem` | Product quantity inside cart. | `cartId`, `productId`, `quantity` | Cart, product | Unique `[cartId, productId]` prevents duplicate lines for same product. |
| `Order` | Durable checkout record. | `userId`, `status`, `total`, `address`, timestamps | User, order items | Address is snapshot string. No payment/shipping fields. |
| `OrderItem` | Historical purchased item row. | `orderId`, `productId`, `productName`, `productPrice`, `quantity`, `subtotal` | Order, product | Display snapshot fields, not live product price/name. |

## Field-Level Rules

| Field | Rule | Reason |
| --- | --- | --- |
| `Product.price` | Use `Decimal @db.Decimal(10, 2)`. | Prevents money rounding bugs. |
| `Order.total` | Sum of `OrderItem.subtotal` values. | Keeps order total auditable. |
| `OrderItem.productPrice` | Copy from product at checkout time. | Product price can change later. |
| `OrderItem.productName` | Copy from product at checkout time. | Product name can change later. |
| `Product.deletedAt` | `null` means visible if active; non-null means hidden from public catalog. | Soft delete preserves order history. |
| `Product.stock` | Must never be negative. | Checkout uses conditional decrement. |
| `Category.slug` and `Product.slug` | Unique. | API detail/cache keys depend on uniqueness. |

## Migration Safety Notes

- [ ] Run baseline build before changing schema if this is a new implementation session.
- [ ] Create one migration for ecommerce schema instead of many partial migrations unless debugging requires smaller steps.
- [ ] If migration fails because existing data violates a new required field, add a safe default or data migration.
- [ ] Do not manually edit old migration files unless the database has not been shared and the user approves.
- [ ] After migration, run `npx prisma generate` before TypeScript build.

## Repo Facts

- Prisma schema path is configured in `prisma.config.ts` as `prisma/schema.prisma`.
- Prisma CLI datasource URL comes from `DIRECT_URL`.
- Runtime `PrismaService` reads `DATABASE_URL`.
- Before running migrations, make sure both `DIRECT_URL` and `DATABASE_URL` exist in `.env` or the local shell.
- `PrismaService` uses the PostgreSQL driver adapter through `@prisma/adapter-pg`.

## Files To Touch

- `prisma/schema.prisma`
- `prisma/seed.ts`
- New Prisma migration under `prisma/migrations/`

## Enums

Add:

```prisma
enum UserRole {
  CUSTOMER
  ADMIN
}

enum ProductStatus {
  ACTIVE
  INACTIVE
}

enum CartStatus {
  ACTIVE
  COMPLETED
  ABANDONED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}
```

## User Changes

- [ ] Add `role UserRole @default(CUSTOMER)`.
- [ ] Add relation fields for carts and orders.

Expected shape:

```prisma
model User {
  id           Int       @id @default(autoincrement())
  email        String    @unique
  name         String?
  password     String
  refreshToken String?
  role         UserRole  @default(CUSTOMER)
  posts        Post[]
  carts        Cart[]
  orders       Order[]
}
```

## Ecommerce Models

Use this model shape as the implementation target:

```prisma
model Category {
  id          Int       @id @default(autoincrement())
  name        String
  slug        String    @unique
  description String?
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  id          Int           @id @default(autoincrement())
  name        String
  slug        String        @unique
  description String?
  price       Decimal       @db.Decimal(10, 2)
  stock       Int           @default(0)
  status      ProductStatus @default(ACTIVE)
  deletedAt   DateTime?
  categoryId  Int
  category    Category      @relation(fields: [categoryId], references: [id])
  images      ProductImage[]
  cartItems   CartItem[]
  orderItems  OrderItem[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model ProductImage {
  id        Int      @id @default(autoincrement())
  url       String
  alt       String?
  productId Int
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model Cart {
  id        Int        @id @default(autoincrement())
  userId    Int
  user      User       @relation(fields: [userId], references: [id])
  status    CartStatus @default(ACTIVE)
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([userId, status])
}

model CartItem {
  id        Int      @id @default(autoincrement())
  cartId    Int
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId Int
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([cartId, productId])
}

model Order {
  id        Int         @id @default(autoincrement())
  userId    Int
  user      User        @relation(fields: [userId], references: [id])
  status    OrderStatus @default(PENDING)
  total     Decimal     @db.Decimal(10, 2)
  address   String
  items     OrderItem[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  @@index([userId, status])
}

model OrderItem {
  id           Int     @id @default(autoincrement())
  orderId      Int
  order        Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId    Int
  product      Product @relation(fields: [productId], references: [id])
  productName  String
  productPrice Decimal @db.Decimal(10, 2)
  quantity     Int
  subtotal     Decimal @db.Decimal(10, 2)
}
```

## Seed Requirements

- [ ] Seed one admin user with `role: ADMIN`.
- [ ] Seed one customer user with `role: CUSTOMER`.
- [ ] Seed at least three categories.
- [ ] Seed at least ten active products.
- [ ] Seed each product with a unique slug.
- [ ] Use `new Prisma.Decimal('199.99')` or string values for prices.

## Seed Data Contract

| Seed Record | Required Values | Purpose |
| --- | --- | --- |
| Admin user | Known email, hashed password, `role: ADMIN` | E2E admin flow can log in and manage catalog/orders. |
| Customer user | Known email, hashed password, `role: CUSTOMER` | E2E customer flow can log in, add cart item, and checkout. |
| Categories | At least 3 unique slugs | Product list filter and category list tests have meaningful data. |
| Products | At least 10 active products with stock > 0 | Pagination/filter/sort/cart/checkout tests have enough records. |
| Product images | Optional but recommended for some products | Public catalog can demonstrate image shape without requiring upload service. |

Do not seed real secrets. Use local/dev credentials and document them in seed comments if needed.

## Commands

- [ ] Confirm env values exist:

```bash
grep -n "DATABASE_URL\|DIRECT_URL" .env
```

Expected: both keys exist. If one is missing, add it before running Prisma CLI commands.

- [ ] Run migration:

```bash
npx prisma migrate dev --name ecommerce_mvp_schema
```

- [ ] Generate client:

```bash
npx prisma generate
```

- [ ] Seed database:

```bash
npm run seed
```

## Tests

- [ ] Verify Prisma client exposes ecommerce models.
- [ ] Verify seed creates admin and customer users.
- [ ] Verify product prices are Decimal-compatible values.

## Done Criteria

- [ ] Migration succeeds.
- [ ] Seed succeeds.
- [ ] Generated client compiles.
- [ ] `npm run build` does not fail because of Prisma type errors.
- [ ] Future docs can refer to these model names without needing schema interpretation.
- [ ] A later agent can understand why each field exists from this file alone.
