# Refactor Order Response DTO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `OrderResponse` type from `src/orders/orders.service.ts` to a dedicated DTO file `src/orders/dto/order-response.dto.ts` as classes.

**Architecture:** Create `OrderResponseDto` and `OrderItemResponseDto` classes to standardize the response format for order-related operations.

**Tech Stack:** NestJS, TypeScript, Prisma (for `OrderStatus`).

---

### Task 1: Create Order Response DTO

**Files:**
- Create: `src/orders/dto/order-response.dto.ts`

- [ ] **Step 1: Create the DTO file**

```typescript
import { OrderStatus } from '@prisma/client';

export class OrderItemResponseDto {
  id: number;
  productId: number;
  productName: string;
  productPrice: string;
  quantity: number;
  subtotal: string;
}

export class OrderResponseDto {
  id: number;
  status: OrderStatus;
  total: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemResponseDto[];
}
```

- [ ] **Step 2: Commit**

```bash
rtk git add src/orders/dto/order-response.dto.ts
rtk git commit -m "dto(orders): create OrderResponseDto"
```

### Task 2: Refactor OrdersService

**Files:**
- Modify: `src/orders/orders.service.ts`

- [ ] **Step 1: Update imports and remove local type**
- Remove `OrderResponse` type definition.
- Import `OrderResponseDto` from `./dto/order-response.dto`.

- [ ] **Step 2: Update method signatures and return types**
- Update `checkout`, `findOrders`, `findOrderById`, and `serializeOrder` to use `OrderResponseDto`.

- [ ] **Step 3: Commit**

```bash
rtk git add src/orders/orders.service.ts
rtk git commit -m "refactor(orders): use OrderResponseDto in OrdersService"
```

### Task 3: Refactor OrdersController

**Files:**
- Modify: `src/orders/orders.controller.ts`

- [ ] **Step 1: Update imports if necessary**
- (Check if `OrderResponseDto` needs explicit usage or if it's inferred).

- [ ] **Step 2: Commit**

```bash
rtk git add src/orders/orders.controller.ts
rtk git commit -m "refactor(orders): update OrdersController for OrderResponseDto"
```

### Task 4: Verification

- [ ] **Step 1: Run build**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 2: Final Commit (if needed)**
- (Usually covered by previous tasks, but ensure everything is clean).
