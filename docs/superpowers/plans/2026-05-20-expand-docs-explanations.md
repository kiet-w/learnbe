# Expanded Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform all documentation in `docs/explanations/` into deep technical guides that explain the "why", "when", and "specific purpose" of every code element (decorators, types, logic steps).

**Architecture:** Systematic review of each source module followed by a rewrite of the corresponding markdown explanation file. Each explanation will use a "Code Block -> Bulleted Deep Dive" format.

**Tech Stack:** Markdown, NestJS, TypeScript, Prisma.

---

### Task 1: Research Remaining Modules

**Files:**
- Research: `src/cart/`, `src/catalog/`, `src/orders/`, `src/prisma/`, `src/redis/`, `src/user/`
- Docs: `docs/explanations/*.md`

- [ ] **Step 1: Read source code for Cart and Catalog modules**
- [ ] **Step 2: Read source code for Orders and User modules**
- [ ] **Step 3: Read source code for Prisma and Redis service modules**

### Task 2: Update Admin and Auth Explanations

**Files:**
- Modify: `docs/explanations/admin.md`
- Modify: `docs/explanations/auth.md`

- [ ] **Step 1: Rewrite `admin.md` with deep dives**
  - Explain `@Controller('admin')`: Decorator defining the routing prefix, centralizing administration logic under a single URL namespace for better organization and security enforcement.
  - Explain `@UseGuards(AuthGuard, RolesGuard)`: Sequential guard execution. `AuthGuard` (Authentication) must pass before `RolesGuard` (Authorization) is even checked.
  - Explain `@Roles(UserRole.ADMIN)`: Custom metadata decorator. Allows declarative access control that `RolesGuard` reads via `Reflector`.
  - Explain `@Post('products')`, `@Patch('products/:id')`, etc.: RESTful method decorators mapping HTTP verbs to controller methods.
  - Explain `@Req() request: Request & { user: JwtPayloadDto }`: Accessing the request object to retrieve the user identity injected by `AuthGuard`.
  - Explain `PrismaService` & `RedisService` injection: Dependency Injection (DI) for database access and caching.
  - Explain Cache Invalidation logic: Why we delete specific keys or reset the cache after mutations to ensure data consistency for clients.
- [ ] **Step 2: Rewrite `auth.md` with deep dives**
  - Explain `@SerializeOptions({ type: AuthResponseDto })`: Integration with `ClassSerializerInterceptor` to filter sensitive fields (like passwords) based on DTO decorators.
  - Explain `@Res({ passthrough: true })`: Allows injecting the Express response object to set Cookies while still letting NestJS handle the return value as the response body.
  - Explain `bcrypt.hash` & `bcrypt.compare`: Why salted hashing is required for security and how comparison works without decrypting.
  - Explain JWT Token generation: The purpose of `AccessToken` (identity) vs `RefreshToken` (session longevity).
  - Explain Cookie configuration: `httpOnly` (prevents XSS), `secure` (enforces HTTPS), `sameSite` (prevents CSRF).
  - Explain `AuthGuard` mechanics: Extracting token from cookie, validating signature/expiry, and attaching payload to Request.
- [ ] **Step 3: Commit updates**

```bash
rtk proxy git add docs/explanations/admin.md docs/explanations/auth.md
rtk proxy git commit -m "docs: expand admin and auth explanations with deep technical details"
```

### Task 3: Update Cart, Catalog, and Orders Explanations

**Files:**
- Modify: `docs/explanations/cart.md`
- Modify: `docs/explanations/catalog.md`
- Modify: `docs/explanations/orders.md`

- [ ] **Step 1: Rewrite `cart.md`**
  - Focus on Redis-backed cart persistence: Why Redis is better for volatile data like carts.
  - Explain TTL (Time To Live) management: Ensuring carts eventually expire to save memory.
  - Explain DTO validation for cart items: `@IsInt`, `@Min(1)` to prevent invalid quantities.
- [ ] **Step 2: Rewrite `catalog.md`**
  - Focus on public-facing APIs: Why these don't require `AuthGuard`.
  - Explain Redis caching strategy for high-read performance: Intercepting DB calls to serve from RAM.
  - Explain slug-based lookup: Improving SEO and user-friendly URLs.
- [ ] **Step 3: Rewrite `orders.md`**
  - Focus on checkout logic: Validating stock before creating orders.
  - Explain Prisma transactions: Why we need `$transaction` to ensure order creation and stock decrement happen atomically.
  - Explain order status transitions: Validating allowed state changes (e.g., PENDING -> SHIPPED).
- [ ] **Step 4: Commit updates**

```bash
rtk proxy git add docs/explanations/cart.md docs/explanations/catalog.md docs/explanations/orders.md
rtk proxy git commit -m "docs: expand cart, catalog, and orders explanations"
```

### Task 4: Update Common, Prisma, Redis, and User Explanations

**Files:**
- Modify: `docs/explanations/common.md`
- Modify: `docs/explanations/prisma.md`
- Modify: `docs/explanations/redis.md`
- Modify: `docs/explanations/user.md`

- [ ] **Step 1: Rewrite `common.md`**
  - Explain `@Catch()`, `ExceptionFilter`: Global error handling to hide stack traces from users while logging them for devs.
  - Explain `Reflector`: The utility used by Guards to read custom metadata (like `@Roles`).
  - Explain standardization of API responses: Why a consistent `{ success, data, message }` structure is vital for frontend developers.
- [ ] **Step 2: Rewrite `prisma.md` and `redis.md`**
  - Explain lifecycle hooks (`onModuleInit`): Ensuring connections are established when the app starts.
  - Explain client instantiation and singleton pattern in NestJS providers.
- [ ] **Step 3: Rewrite `user.md`**
  - Focus on profile management: How users see their own data safely.
- [ ] **Step 4: Commit updates**

```bash
rtk proxy git add docs/explanations/common.md docs/explanations/prisma.md docs/explanations/redis.md docs/explanations/user.md
rtk proxy git commit -m "docs: expand common, prisma, redis, and user explanations"
```
