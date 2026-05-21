# 08 Rate Limit & Logging

## Goal

Add pragmatic operational protection and logs without overbuilding the MVP.

## Implementation Intent

This task adds basic production hygiene. Rate limiting protects public and mutation endpoints from accidental or simple abusive traffic. Logging creates enough traceability to debug checkout and admin changes without logging secrets.

| Area | Required In v1 | Not Required In v1 |
| --- | --- | --- |
| Rate limiting | Add `@nestjs/throttler` if the implementation chooses to include rate limit now. Apply simple route/global limits. | Per-user dynamic limits, distributed rate limit tuning, paid plan quotas. |
| Checkout logs | Log success/failure with user id, order id when available, and reason. | Full audit trail table. |
| Admin logs | Log product writes and order status changes. | Admin analytics dashboard. |
| Sensitive data | Never log passwords, tokens, cookies, or full auth headers. | Secret redaction library unless later needed. |

## Decision Contract

- [ ] If `@nestjs/throttler` is installed, update `package.json` and `package-lock.json`.
- [ ] If rate limiting is deferred, write that decision into this file and keep logging work.
- [ ] Do not hand-roll custom rate limiting when Nest throttler is available.
- [ ] Do not add Redis-backed distributed throttling unless a new scaling plan requires it.

## Detailed Rate Limit Plan

| Route Area | Suggested Limit | Reason |
| --- | --- | --- |
| Public category list | 100/minute | Public read endpoint, low risk, cacheable. |
| Public product list | 100/minute | Search/filter endpoint can be called frequently. |
| Public product detail | 200/minute | Detail pages are cacheable and common. |
| Cart mutations | 60/minute | Authenticated mutation; prevent accidental spam. |
| Checkout | 10/minute | Expensive and stock-sensitive operation. |
| Admin writes | 60/minute | Staff operations should be limited but not blocked during normal work. |

## Detailed Logging Plan

| Event | Level | Fields To Include | Fields To Exclude |
| --- | --- | --- | --- |
| Checkout success | `log` | `userId`, `orderId`, `total`, item count | Token, cookie, password. |
| Checkout failure | `warn` | `userId`, reason, product id if relevant | Token, cookie, password. |
| Admin product create | `log` | `adminUserId`, `productId`, `slug` | Request cookies. |
| Admin product update | `log` | `adminUserId`, `productId`, changed high-level fields if easy | Full before/after payload if sensitive. |
| Admin product soft delete | `log` | `adminUserId`, `productId`, `slug` | None needed beyond ids. |
| Admin order status update | `log` | `adminUserId`, `orderId`, `oldStatus`, `newStatus` | Customer private data. |
| Unauthorized admin attempt | `warn` | `userId` if available, route | Token/cookie values. |

## Deferral Format

If rate limiting is deferred, record it like this in this file:

```md
## Rate Limiting Status

- Decision: Deferred.
- Reason: <short reason>.
- Required before production: Add `@nestjs/throttler`, configure limits, and add route tests.
```

## Files To Touch

- `package.json` if adding `@nestjs/throttler`
- `src/app.module.ts`
- Catalog controllers if applying route-level throttling
- Cart/order/admin services for logging

## Rate Limiting Decision

`@nestjs/throttler` is not currently in `package.json`.

Implementation options:

- [ ] Add `@nestjs/throttler` and implement rate limiting in this MVP.
- [ ] Defer rate limiting and document it as production hardening.

Recommended v1 implementation:

- [ ] Install `@nestjs/throttler`.
- [ ] Configure global throttler module.
- [ ] Apply permissive public catalog limit first.
- [ ] Keep stricter auth/cart/order mutation limits as follow-up if needed.

## Suggested Limits

- [ ] Public catalog read: 100 requests per minute per client.
- [ ] Product detail read: 200 requests per minute per client.
- [ ] Checkout: 10 requests per minute per client.
- [ ] Admin writes: 60 requests per minute per client.

## Logging

Use Nest `Logger`.

Log these events:

- [ ] Checkout success: user id, order id, total.
- [ ] Checkout failure: user id, reason.
- [ ] Admin product create/update/delete: admin user id, product id.
- [ ] Admin order status change: admin user id, order id, old status, new status.
- [ ] Unauthorized admin access if guard-level logging is added.

Do not log:

- [ ] Passwords.
- [ ] Refresh tokens.
- [ ] Access tokens.
- [ ] Full cookie values.

## Error Messages

Keep user-facing errors clear:

- [ ] `Giỏ hàng trống`
- [ ] `Sản phẩm không tồn tại`
- [ ] `Sản phẩm không còn bán`
- [ ] `Sản phẩm không đủ hàng`
- [ ] `Bạn không có quyền thực hiện thao tác này`

## Tests

- [ ] Build passes after throttler config.
- [ ] Public catalog routes still respond normally.
- [ ] Checkout logs success in service-level test if logger is mocked.
- [ ] Admin status update logs status transition if logger is mocked.

## Done Criteria

- [ ] Rate limiting is either implemented or explicitly deferred in docs.
- [ ] Important write flows emit useful logs.
- [ ] Sensitive auth values are not logged.
- [ ] Future debugging sessions can identify checkout and admin write events from application logs.
