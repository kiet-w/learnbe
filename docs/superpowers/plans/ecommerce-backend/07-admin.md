# 07 Admin

## Goal

Add admin-only ecommerce management APIs for categories, products, and order status.

## Implementation Intent

Admin APIs are operational controls for store staff. They should reuse catalog/order services where possible but must stay behind role-based auth. Admin writes are the only source of catalog mutation in v1.

| Admin Area | Purpose | Public Side Effect |
| --- | --- | --- |
| Category create/update | Maintain browsing taxonomy. | Category cache invalidates; product list cache may invalidate. |
| Product create/update | Maintain product content, price, stock, status, and images. | Public product list/detail changes after cache invalidation. |
| Product soft delete | Remove product from public browsing without breaking historical order references. | Product disappears from public catalog. |
| Order list/status update | Let staff process orders through basic lifecycle. | Customer order status changes. |

## Admin Boundary

- [ ] Admin role is `User.role = ADMIN`.
- [ ] Do not use hardcoded admin emails.
- [ ] Do not add separate admin authentication.
- [ ] Do not bypass DTO validation for admin users.
- [ ] Do not permanently delete products in v1.
- [ ] Do not allow admin status values outside the documented enum.

## Cache Invalidation Contract

- [ ] Category create/update invalidates `categories:list`.
- [ ] Category update invalidates product list cache when product output includes category.
- [ ] Product create invalidates product list cache.
- [ ] Product update invalidates product list cache and old/new detail cache when slug can change.
- [ ] Product soft delete invalidates product list cache and detail cache.

## Endpoint Detail

| Endpoint | Input | Behavior | Cache/Log |
| --- | --- | --- | --- |
| `POST /admin/categories` | `{ name, slug, description? }` | Create category after unique slug validation. | Invalidate categories; log admin action. |
| `PATCH /admin/categories/:id` | Partial category fields. | Update existing category. | Invalidate categories and product lists; log admin action. |
| `POST /admin/products` | Product create DTO. | Create product/images after category and slug validation. | Invalidate product lists; log admin action. |
| `PATCH /admin/products/:id` | Partial product fields. | Update product, category, status, price, stock, images as supported. | Invalidate product list and detail keys; log admin action. |
| `DELETE /admin/products/:id` | Product id. | Set `deletedAt` instead of deleting row. | Invalidate product list/detail; log admin action. |
| `GET /admin/orders` | Pagination and optional status. | List all orders for staff. | No catalog cache impact. |
| `PATCH /admin/orders/:id/status` | `{ status }` | Update order status to allowed enum value. | Log old/new status. |

## Admin DTO Detail

| DTO | Required Fields | Optional Fields | Validation Notes |
| --- | --- | --- | --- |
| `CreateCategoryDto` | `name`, `slug` | `description` | Slug string must be unique. |
| `UpdateCategoryDto` | none | `name`, `slug`, `description` | If slug changes, validate uniqueness. |
| `CreateProductDto` | `name`, `slug`, `price`, `stock`, `categoryId` | `description`, `status`, `images` | Price is decimal string; stock cannot be negative. |
| `UpdateProductDto` | none | Any product field allowed in v1 | Validate category when category changes; validate slug uniqueness when slug changes. |
| `UpdateOrderStatusDto` | `status` | none | Status must be one of documented `OrderStatus` values. |

## Admin Read/Write Boundary

- [ ] Admin product writes can change stock manually.
- [ ] Customer cart never changes stock.
- [ ] Checkout changes stock through conditional decrement.
- [ ] Admin order status update does not change stock in v1.
- [ ] Cancelling an order does not auto-restock in v1 unless a new plan defines that behavior.

## Files To Touch

- Create `src/admin/admin.module.ts`
- Create `src/admin/admin.controller.ts`
- Create `src/admin/admin.service.ts`
- Modify `src/app.module.ts`
- Reuse catalog DTOs and services where possible.
- Reuse order service where possible.

## Access Control

All admin routes require:

```ts
@Roles('ADMIN')
@UseGuards(AuthGuard, RolesGuard)
```

Rules:

- [ ] Customer users are blocked.
- [ ] Missing token is blocked.
- [ ] Admin users are allowed.

## Category APIs

- [ ] `POST /admin/categories`
- [ ] `PATCH /admin/categories/:id`

Category create:

```json
{
  "name": "Phones",
  "slug": "phones",
  "description": "Smartphones and mobile devices"
}
```

Rules:

- [ ] Slug must be unique.
- [ ] Updating category invalidates category cache.
- [ ] Updating category invalidates product list cache if product output includes category data.

## Product APIs

- [ ] `POST /admin/products`
- [ ] `PATCH /admin/products/:id`
- [ ] `DELETE /admin/products/:id`

Rules:

- [ ] Create validates category exists.
- [ ] Create validates slug uniqueness.
- [ ] Update validates category exists when category changes.
- [ ] Update invalidates product detail and product list cache.
- [ ] Delete is soft delete by setting `deletedAt`.
- [ ] Soft delete invalidates product detail and product list cache.

## Admin Order APIs

- [ ] `GET /admin/orders`
- [ ] `PATCH /admin/orders/:id/status`

Supported status values:

```ts
PENDING
CONFIRMED
SHIPPED
DELIVERED
CANCELLED
```

Rules:

- [ ] Admin order list supports pagination.
- [ ] Admin order list supports status filter.
- [ ] Status update rejects invalid status.
- [ ] Status update logs old status and new status.

## Tests

- [ ] Non-admin cannot create category.
- [ ] Admin can create category.
- [ ] Admin can create product.
- [ ] Admin can update product.
- [ ] Admin soft deletes product.
- [ ] Soft deleted product disappears from public catalog.
- [ ] Admin can list orders.
- [ ] Admin can update order status.
- [ ] Invalid order status is rejected.

## Done Criteria

- [ ] Admin APIs are protected by role.
- [ ] Admin catalog writes invalidate cache.
- [ ] Admin order status management works.
- [ ] Future sessions can add admin endpoints by following the documented guard/cache/logging pattern.
