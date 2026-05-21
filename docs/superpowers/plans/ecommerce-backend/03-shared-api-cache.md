# 03 Shared API & Cache

## Goal

Create shared response, pagination, and cache conventions before feature modules use them.

## Implementation Intent

This file prevents every feature module from inventing its own response, pagination, and Redis key style. Future sessions should import these helpers/constants instead of hardcoding shapes inside controllers/services.

| Shared Piece | Why It Exists | Used By |
| --- | --- | --- |
| `ApiResponse<T>` | Keeps non-list API responses predictable. | Product detail, cart, checkout, order detail, admin writes. |
| `PaginatedApiResponse<T>` | Makes list responses predictable for frontend/API clients. | Product list, customer orders, admin orders. |
| `PaginationQueryDto` | Centralizes `page`, `limit`, search/filter/sort validation. | Catalog and admin list endpoints. |
| `CACHE_KEYS` | Prevents typo-prone string keys across modules. | Catalog cache, optional cart cache. |
| `CACHE_TTL` | Makes cache duration visible and easy to tune. | Redis service calls. |

## Response Contract

- [ ] Controllers should return wrapped responses directly or through helpers.
- [ ] Service methods can return raw domain data when it keeps testing simpler; controllers can wrap the response.
- [ ] Paginated endpoints must include `total`, `page`, `limit`, and `totalPages`.
- [ ] Errors should still flow through the existing global exception filter.
- [ ] Existing auth DTOs may keep their current structure if changing them would break established behavior.

## Cache Boundary

- [ ] Redis is read optimization only.
- [ ] Database remains source of truth.
- [ ] Cache misses must fetch from Prisma and repopulate Redis.
- [ ] Admin writes must invalidate affected catalog cache before returning success.
- [ ] Do not cache authorization decisions.
- [ ] Do not cache raw tokens, passwords, refresh tokens, or cookies.

## Detailed Utility Contracts

| Utility | Input | Output | Edge Cases |
| --- | --- | --- | --- |
| `success<T>(data)` | Any serializable data object/array. | `{ success: true, data }`. | `data` may be `null` only if caller intentionally returns nullable data. |
| `paginated<T>(data, total, page, limit)` | List, total count, normalized page, normalized limit. | `{ success: true, data, meta }`. | `totalPages` is `0` when total is `0`, otherwise `Math.ceil(total / limit)`. |
| `PaginationQueryDto` | Query params as strings from HTTP. | Validated/transformed object. | Invalid `sort`, negative numbers, zero page, and over-limit values are rejected. |
| `CACHE_KEYS.PRODUCT(slug)` | Product slug. | `products:${slug}`. | Slug must already be normalized by caller. |
| `CACHE_KEYS.CART(userId)` | Authenticated user id. | `cart:${userId}`. | Do not use request body user id. |

## Pagination Normalization Detail

| Param | Missing Behavior | Invalid Behavior | Service Usage |
| --- | --- | --- | --- |
| `page` | Use `1`. | Reject values below `1`. | `skip = (page - 1) * limit`. |
| `limit` | Use `10`. | Reject values below `1`; cap or reject above `100`. | `take = limit`. |
| `category` | No category filter. | Reject non-positive integer. | `where.categoryId = category`. |
| `search` | No search filter. | Empty string should behave as missing after trim. | Search `name` and `description`. |
| `minPrice` | No min filter. | Reject non-decimal string. | `where.price.gte`. |
| `maxPrice` | No max filter. | Reject non-decimal string. | `where.price.lte`. |
| `sort` | `created_desc`. | Reject unknown value. | Map to Prisma `orderBy`. |

## Cache Invalidation Matrix

| Mutation | Keys To Invalidate | Why |
| --- | --- | --- |
| Create category | `categories:list`, product list keys | Category list changes; product filter data can change. |
| Update category | `categories:list`, product list keys | Product responses may include category fields. |
| Create product | Product list keys | New product can appear in public list. |
| Update product without slug change | Product list keys, `products:${slug}` | List/detail content may be stale. |
| Update product with slug change | Product list keys, old `products:${oldSlug}`, new `products:${newSlug}` | Old detail key must not serve stale product. |
| Soft delete product | Product list keys, `products:${slug}` | Deleted product must disappear from public reads. |
| Cart mutation | `cart:${userId}` if cart cache is used | Cart response must reflect latest items. |

## Files To Touch

- Create `src/common/dto/pagination-query.dto.ts`
- Create `src/common/interfaces/api-response.interface.ts`
- Create `src/common/utils/api-response.util.ts`
- Create `src/common/constants/cache.constants.ts`

## Response Wrapper

Single response:

```ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
```

Paginated response:

```ts
export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

Helper behavior:

- [ ] `success(data)` returns `{ success: true, data }`.
- [ ] `paginated(data, total, page, limit)` returns data and meta.
- [ ] `totalPages` uses `Math.ceil(total / limit)`.

## Pagination Query

Support:

```ts
page?: number;
limit?: number;
search?: string;
category?: number;
minPrice?: string;
maxPrice?: string;
sort?: 'price_asc' | 'price_desc' | 'created_asc' | 'created_desc';
```

Rules:

- [ ] Default `page = 1`.
- [ ] Default `limit = 10`.
- [ ] Max `limit = 100`.
- [ ] Use `class-transformer` to transform numeric query values.
- [ ] Use `class-validator` for positive numbers and allowed sort values.

## Cache Constants

Use centralized constants:

```ts
export const CACHE_KEYS = {
  PRODUCTS: 'products:list',
  PRODUCT: (slug: string) => `products:${slug}`,
  CATEGORIES: 'categories:list',
  CART: (userId: number) => `cart:${userId}`,
} as const;

export const CACHE_TTL = {
  PRODUCTS: 5 * 60 * 1000,
  PRODUCT: 10 * 60 * 1000,
  CATEGORIES: 60 * 60 * 1000,
  CART: 10 * 60 * 1000,
} as const;
```

Current `RedisService` and `CacheModule` usage pass TTL values as milliseconds. Keep these constants in milliseconds unless the Redis wrapper is intentionally changed and tested.

## Invalidation Rules

- [ ] Product create/update/delete invalidates `products:list`.
- [ ] Product update/delete invalidates `products:{slug}`.
- [ ] Category create/update invalidates `categories:list`.
- [ ] Category update that affects product output invalidates `products:list`.
- [ ] Cart mutation invalidates `cart:{userId}` if cart cache is used.

## Tests

- [ ] Pagination DTO accepts valid query params.
- [ ] Pagination DTO rejects invalid sort values.
- [ ] Response helper returns expected meta.
- [ ] Cache constants generate stable keys.

## Done Criteria

- [ ] Feature modules can import shared response helpers.
- [ ] Feature modules can import cache key/TTL constants.
- [ ] No feature module hardcodes cache key strings.
- [ ] Future agents know when to wrap data in controllers versus services.
