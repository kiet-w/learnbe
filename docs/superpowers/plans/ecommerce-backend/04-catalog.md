# 04 Catalog

## Goal

Implement public catalog APIs and admin-backed catalog persistence.

## Implementation Intent

Catalog is the public read surface for products and categories. It must be safe for anonymous access, cacheable, and consistent with product lifecycle rules. Admin writes may live in `admin`, but public reads live here.

| Endpoint | Audience | Main Data Source | Cache | Important Exclusions |
| --- | --- | --- | --- | --- |
| `GET /categories` | Anonymous/public | `Category` | Yes | No nested tree in v1. |
| `GET /products` | Anonymous/public | `Product` + category/images as needed | Yes | No inactive, soft-deleted, variant, review, or discount data. |
| `GET /products/:slug` | Anonymous/public | Single `Product` by slug | Yes | No numeric-id detail route required in v1. |

## Query Behavior Contract

| Query Param | Meaning | Default | Validation |
| --- | --- | --- | --- |
| `page` | 1-based page number. | `1` | Positive integer. |
| `limit` | Number of items per page. | `10` | Positive integer, max `100`. |
| `category` | Category id filter. | none | Positive integer. |
| `search` | Keyword search over product name/description. | none | Non-empty string when present. |
| `minPrice` | Lowest product price. | none | Decimal-compatible string. |
| `maxPrice` | Highest product price. | none | Decimal-compatible string. |
| `sort` | Product ordering. | `created_desc` | One of `price_asc`, `price_desc`, `created_asc`, `created_desc`. |

## What Not To Build

- [ ] Do not add product variants.
- [ ] Do not add ratings/reviews.
- [ ] Do not add discount display.
- [ ] Do not expose inactive products publicly.
- [ ] Do not expose soft-deleted products publicly.
- [ ] Do not implement frontend SEO pages; only provide API data.

## Endpoint Detail

| Endpoint | Request Inputs | Success Response | Error Response | Cache Behavior |
| --- | --- | --- | --- | --- |
| `GET /categories` | No required params. | `{ success, data: Category[] }`. | Usually none unless DB/cache fails. | Read through `CACHE_KEYS.CATEGORIES`. |
| `GET /products` | `page`, `limit`, `category`, `search`, `minPrice`, `maxPrice`, `sort`. | Paginated product array with meta. | Validation errors for bad query params. | Cache key must include normalized query params. |
| `GET /products/:slug` | URL slug. | `{ success, data: ProductDetail }`. | 404 for missing, inactive, or deleted product. | Read through `CACHE_KEYS.PRODUCT(slug)`. |

## Product List Response Fields

| Field | Source | Notes |
| --- | --- | --- |
| `id` | `Product.id` | Keep for cart add payloads. |
| `name` | `Product.name` | Public display name. |
| `slug` | `Product.slug` | Used for detail route. |
| `description` | `Product.description` | Can be null. |
| `price` | `Product.price` | Return as string/Decimal-safe value. |
| `stock` | `Product.stock` | Public can see stock in v1; if later hidden, update docs/tests. |
| `category` | `Product.category` | Include id/name/slug. |
| `images` | `Product.images` | URL strings only; no upload flow. |

## Service Method Detail

| Method | Responsibility | Must Validate |
| --- | --- | --- |
| `findCategories()` | Return public categories ordered by name. | Nothing from user input. |
| `findProducts(query)` | Build Prisma `where`, `orderBy`, `skip`, `take`, and return paginated result. | Query DTO already validates, but service still handles missing optional filters. |
| `findProductBySlug(slug)` | Return one public product detail. | Product exists, active, not soft deleted. |
| `invalidateCatalogCache()` or equivalents | Clear list/detail/category keys after admin writes. | Must include old slug when product slug changes. |

## Files To Touch

- Create `src/catalog/catalog.module.ts`
- Create `src/catalog/catalog.controller.ts`
- Create `src/catalog/catalog.service.ts`
- Create `src/catalog/dto/create-category.dto.ts`
- Create `src/catalog/dto/update-category.dto.ts`
- Create `src/catalog/dto/create-product.dto.ts`
- Create `src/catalog/dto/update-product.dto.ts`
- Create `src/catalog/dto/product-query.dto.ts`
- Modify `src/app.module.ts`

## Public APIs

- [ ] `GET /categories`
- [ ] `GET /products?page=1&limit=10&category=1&search=iphone&minPrice=100&maxPrice=1000&sort=price_asc`
- [ ] `GET /products/:slug`

## Product List Rules

- [ ] Return only `status: ACTIVE`.
- [ ] Return only `deletedAt: null`.
- [ ] Filter by `categoryId` when `category` is present.
- [ ] Search in product `name` and `description`.
- [ ] Filter by `minPrice` and `maxPrice`.
- [ ] Sort by `price_asc`, `price_desc`, `created_asc`, or `created_desc`.
- [ ] Use `skip` and `take` for pagination.
- [ ] Return response wrapper with pagination meta.

## Product Detail Rules

- [ ] Look up by `slug`.
- [ ] Return 404 when missing, inactive, or soft deleted.
- [ ] Include category and images.
- [ ] Cache by `CACHE_KEYS.PRODUCT(slug)`.

## Category Rules

- [ ] Public category list returns categories ordered by name.
- [ ] Cache with `CACHE_KEYS.CATEGORIES`.
- [ ] Category slug is unique.

## Cache Rules

- [ ] Cache product list with `CACHE_KEYS.PRODUCTS`.
- [ ] Cache product detail with `CACHE_KEYS.PRODUCT(slug)`.
- [ ] Cache categories with `CACHE_KEYS.CATEGORIES`.
- [ ] Include query params in product list cache key if one base key is not enough.
- [ ] Invalidate cache on admin catalog writes.

## DTO Requirements

Create product:

```json
{
  "name": "iPhone 15",
  "slug": "iphone-15",
  "description": "Apple smartphone",
  "price": "999.00",
  "stock": 20,
  "categoryId": 1,
  "status": "ACTIVE",
  "images": [
    {
      "url": "https://example.com/iphone.jpg",
      "alt": "iPhone 15"
    }
  ]
}
```

Validation:

- [ ] `name` is required string.
- [ ] `slug` is required string.
- [ ] `price` is required decimal-compatible string.
- [ ] `stock` is integer and cannot be negative.
- [ ] `categoryId` is positive integer.
- [ ] `status` is optional enum.
- [ ] `images` is optional array.

## Tests

- [ ] Product list excludes inactive products.
- [ ] Product list excludes soft deleted products.
- [ ] Product list filters by category.
- [ ] Product list searches by keyword.
- [ ] Product list sorts by price.
- [ ] Product detail returns by slug.
- [ ] Product detail returns 404 for deleted product.
- [ ] Cache invalidates after admin update.

## Done Criteria

- [ ] Public catalog APIs work.
- [ ] Catalog output uses response wrapper.
- [ ] Catalog queries are covered by unit or e2e tests.
- [ ] A future frontend can browse products using only documented query params and response metadata.
