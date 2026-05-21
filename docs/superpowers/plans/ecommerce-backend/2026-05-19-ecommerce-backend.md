# Ecommerce Backend MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` when available, or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an ecommerce backend MVP on the existing NestJS backend.

**Architecture:** Extend the current modular NestJS app with schema-first ecommerce domains: catalog, cart, orders, admin, and shared API/cache utilities. PostgreSQL remains the source of truth through Prisma; Redis is used only for cache acceleration.

**Tech Stack:** NestJS 11, TypeScript, Prisma 7, PostgreSQL, Redis, JWT cookie auth, `class-validator`, Jest, Supertest.

---

## Docs Index

- [00 Overview](./00-overview.md)
- [01 Schema & Prisma](./01-schema-prisma.md)
- [02 Auth Roles](./02-auth-roles.md)
- [03 Shared API & Cache](./03-shared-api-cache.md)
- [04 Catalog](./04-catalog.md)
- [05 Cart](./05-cart.md)
- [06 Orders & Checkout](./06-orders-checkout.md)
- [07 Admin](./07-admin.md)
- [08 Rate Limit & Logging](./08-rate-limit-logging.md)
- [09 Testing](./09-testing.md)
- [10 AI Coding Task Breakdown](./10-ai-coding-task-breakdown.md)

## How Future Sessions Should Use These Docs

| Situation | Read First | Then Read | What To Avoid |
| --- | --- | --- | --- |
| Starting implementation from zero | [00 Overview](./00-overview.md) | [10 AI Coding Task Breakdown](./10-ai-coding-task-breakdown.md) | Do not jump into feature modules before schema and shared contracts exist. |
| Changing database shape | [01 Schema & Prisma](./01-schema-prisma.md) | Related feature doc and [09 Testing](./09-testing.md) | Do not change money fields to `Float`; do not remove snapshot fields. |
| Building admin access | [02 Auth Roles](./02-auth-roles.md) | [07 Admin](./07-admin.md) | Do not protect admin routes with email checks or hardcoded users. |
| Building product browsing | [03 Shared API & Cache](./03-shared-api-cache.md) | [04 Catalog](./04-catalog.md) | Do not expose inactive or soft-deleted products. |
| Building cart/checkout | [05 Cart](./05-cart.md) | [06 Orders & Checkout](./06-orders-checkout.md) | Do not reserve stock in cart; stock changes only during checkout. |
| Verifying final work | [09 Testing](./09-testing.md) | [10 AI Coding Task Breakdown](./10-ai-coding-task-breakdown.md) | Do not call work complete without build, unit, and e2e verification. |

## Agent Operating Contract

- [ ] Treat [00 Overview](./00-overview.md) as the product contract.
- [ ] Treat [10 AI Coding Task Breakdown](./10-ai-coding-task-breakdown.md) as the execution contract.
- [ ] Treat files `01` through `09` as subsystem contracts.
- [ ] If docs disagree, follow this priority: `00-overview.md`, then `10-ai-coding-task-breakdown.md`, then the subsystem doc.
- [ ] If implementation must deviate from docs, update the relevant doc in the same change.
- [ ] Do not implement out-of-scope features from [00 Overview](./00-overview.md) without writing a new plan first.

## Execution Order

- [ ] Read [00 Overview](./00-overview.md) to confirm scope and module boundaries.
- [ ] Implement [01 Schema & Prisma](./01-schema-prisma.md).
- [ ] Implement [02 Auth Roles](./02-auth-roles.md).
- [ ] Implement [03 Shared API & Cache](./03-shared-api-cache.md).
- [ ] Implement [04 Catalog](./04-catalog.md).
- [ ] Implement [05 Cart](./05-cart.md).
- [ ] Implement [06 Orders & Checkout](./06-orders-checkout.md).
- [ ] Implement [07 Admin](./07-admin.md).
- [ ] Implement [08 Rate Limit & Logging](./08-rate-limit-logging.md).
- [ ] Implement [09 Testing](./09-testing.md).
- [ ] Follow [10 AI Coding Task Breakdown](./10-ai-coding-task-breakdown.md) for the exact agent execution flow.

## Definition Of Done

- [ ] `npm run build` passes.
- [ ] `npm test` passes.
- [ ] `npm run test:e2e` passes.
- [ ] Public catalog supports category list, product list, filtering, sorting, pagination, and product detail by slug.
- [ ] Authenticated customers can manage cart, checkout, and view their orders.
- [ ] Admin users can manage categories, products, and order status.
- [ ] Product money fields use Prisma `Decimal`, not `Float`.
- [ ] Checkout prevents overselling through transaction and conditional stock decrement.
- [ ] Deleted products are soft deleted through `deletedAt`.
- [ ] Cache keys and TTL values are centralized.

## Project Safety Rules

- [ ] Before editing any existing function, class, or method, run GitNexus impact analysis for that symbol as required by `AGENTS.md`.
- [ ] Before committing, run GitNexus detect changes to verify the affected scope.
- [ ] Do not modify unrelated dirty files already present in the worktree.
- [ ] Keep each implementation step small enough to test independently.
- [ ] Treat [10 AI Coding Task Breakdown](./10-ai-coding-task-breakdown.md) as the operational checklist for AI coding agents.

## Stop Conditions

- [ ] Stop if `.env` is missing `DATABASE_URL` or `DIRECT_URL` before Prisma migration.
- [ ] Stop if baseline `npm run build` fails before ecommerce edits.
- [ ] Stop if GitNexus impact analysis reports HIGH or CRITICAL risk for a symbol being edited; report blast radius before continuing.
- [ ] Stop if checkout math would require discounts, taxes, or payment state; those are out of v1.
- [ ] Stop if a requested feature requires product variants; the schema must be redesigned before that.
