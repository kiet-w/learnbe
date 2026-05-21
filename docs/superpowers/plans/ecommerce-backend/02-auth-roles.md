# 02 Auth Roles

## Goal

Add role-based access control so admin routes are protected while customer routes keep using normal authentication.

## Implementation Intent

The project already has cookie-based JWT auth. This task extends that auth with role awareness so admin APIs can be protected consistently. Do not create a separate admin login flow; admin users are normal users with `role: ADMIN`.

| User Type | Can Do | Cannot Do |
| --- | --- | --- |
| Anonymous | Browse public catalog and categories. | Use cart, checkout, order history, or admin APIs. |
| `CUSTOMER` | Use cart, checkout, and own order history. | Create/update/delete products, manage categories, list all orders, update order status. |
| `ADMIN` | Use admin category/product/order APIs. | Bypass normal validation, skip auth cookies, or access without JWT. |

## Auth Flow Contract

- [ ] Login still validates email/password using existing auth logic.
- [ ] Token payload includes `userId`, `email`, and `role`.
- [ ] `AuthGuard` verifies `access_token` and attaches payload to `request.user`.
- [ ] `RolesGuard` checks route metadata after `AuthGuard` has populated `request.user`.
- [ ] Admin controllers use `@Roles('ADMIN')` and `@UseGuards(AuthGuard, RolesGuard)`.
- [ ] Customer-only routes use `AuthGuard` but do not require `RolesGuard`.

## What Not To Build

- [ ] Do not hardcode admin by email.
- [ ] Do not create a separate `Admin` table.
- [ ] Do not create admin-specific JWT secrets.
- [ ] Do not expose refresh token or cookie values in responses.
- [ ] Do not change cookie names unless all auth docs/tests are updated.

## Detailed Access Matrix

| Route Type | Anonymous | `CUSTOMER` | `ADMIN` | Guard Pattern |
| --- | --- | --- | --- | --- |
| Public catalog | Allowed | Allowed | Allowed | No auth guard required. |
| Customer cart | Blocked | Allowed for own cart | Allowed only as own customer account if used | `@UseGuards(AuthGuard)`. |
| Customer checkout | Blocked | Allowed for own cart | Allowed only as own customer account if used | `@UseGuards(AuthGuard)`. |
| Customer order history | Blocked | Own orders only | Own orders only on customer endpoint | `@UseGuards(AuthGuard)`. |
| Admin categories | Blocked | Blocked | Allowed | `@Roles('ADMIN')` + `AuthGuard` + `RolesGuard`. |
| Admin products | Blocked | Blocked | Allowed | `@Roles('ADMIN')` + `AuthGuard` + `RolesGuard`. |
| Admin orders | Blocked | Blocked | Allowed | `@Roles('ADMIN')` + `AuthGuard` + `RolesGuard`. |

## File Responsibility Detail

| File | Responsibility | Important Implementation Detail |
| --- | --- | --- |
| `src/auth/dto/jwt-payload.dto.ts` | Defines what `request.user` contains after auth. | Add `role: UserRole`; keep `userId` and `email`. |
| `src/auth/auth.service.ts` | Generates tokens and login responses. | Token generation must receive role from the found user. |
| `src/auth/auth.guard.ts` | Verifies `access_token` cookie and attaches payload. | Keep cookie-based behavior; do not switch to bearer-only auth. |
| `src/auth/dto/auth-response.dto.ts` | Shapes auth response user data. | Include role where user info is returned. |
| `src/common/decorators/roles.decorator.ts` | Stores required roles in metadata. | Export both `ROLES_KEY` and `Roles`. |
| `src/common/guards/roles.guard.ts` | Compares required roles to `request.user.role`. | Use Nest `Reflector`; allow routes without role metadata. |

## Failure Behavior Detail

| Case | Expected Behavior |
| --- | --- |
| Missing access token on admin route | Request is rejected by `AuthGuard`. |
| Valid customer token on admin route | Request is rejected by `RolesGuard`. |
| Valid admin token on admin route | Request continues to controller. |
| Route has no `@Roles` metadata | `RolesGuard`, if present, should allow by default. |
| JWT payload has no role due to old token | Treat as unauthorized/forbidden; user should log in again. |

## Files To Touch

- `src/auth/auth.guard.ts`
- `src/auth/auth.service.ts`
- `src/auth/dto/auth-response.dto.ts`
- `src/auth/dto/jwt-payload.dto.ts`
- `src/auth/auth.module.ts`
- Create `src/common/decorators/roles.decorator.ts`
- Create `src/common/guards/roles.guard.ts`

## Behavior

- [ ] Existing auth still works for register, login, refresh, logout, and `me`.
- [ ] JWT payload should include `userId`, `email`, and `role`.
- [ ] `AuthGuard` should attach payload with role to `request.user`.
- [ ] `RolesGuard` should allow only users with required role.
- [ ] Admin endpoints require both `AuthGuard` and `RolesGuard`.

## Role Decorator

Target API:

```ts
@Roles('ADMIN')
@UseGuards(AuthGuard, RolesGuard)
```

Decorator shape:

```ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

## Roles Guard

Rules:

- [ ] If route has no `Roles` metadata, allow request.
- [ ] If route has role metadata and `request.user` is missing, deny.
- [ ] If user role is not in allowed roles, deny.
- [ ] Throw standard Nest forbidden/unauthorized behavior.

## Auth Response

Include role where useful:

```json
{
  "success": true,
  "accessToken": "token",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin",
    "role": "ADMIN"
  }
}
```

## Tests

- [ ] Customer can access customer protected routes.
- [ ] Customer cannot access admin routes.
- [ ] Admin can access admin routes.
- [ ] Missing token cannot access admin routes.

## Done Criteria

- [ ] Existing auth tests still pass.
- [ ] Role metadata works.
- [ ] Admin route protection can be reused by catalog and order admin APIs.
- [ ] Future agents can protect a new admin route by copying one documented pattern.
