# Folder-Based Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the SVG flow and component descriptions in `@nestjs_flow_explain.html` to reflect the physical `src/` folder structure (auth, redis, prisma/supabase, orders, etc.) using the VS Code Dark theme.

**Architecture:** We will surgically update the HTML content: the grid cards, the SVG diagram elements (nodes, text, paths), and the step detail text to match the new spec.

**Tech Stack:** HTML5, CSS3, SVG, Vanilla JS.

---

### Task 1: Update Component Cards (The Departments)

**Files:**
- Modify: `nestjs_flow_explain.html` (The `.components-grid` section)

- [ ] **Step 1: Update Card 1 (main.ts)**
Update title and description.
*Change "Tòa Nhà Nhà Hàng" to "src/main.ts & app.module.ts"*

- [ ] **Step 2: Update Card 2 (auth/common)**
Update title to "src/auth/ & src/common/".
Mention JWT, RolesGuard, ValidationPipe.

- [ ] **Step 3: Update Card 3 (Feature Modules)**
Update title to "src/catalog, src/cart, src/user".
Mention Waitstaff / Context of viewing menu, cart.

- [ ] **Step 4: Update Card 4 (Orders)**
Update title to "src/orders/".
Mention Head Chef, Controller + Service business logic.

- [ ] **Step 5: Update Card 5 (Redis)**
Update title to "src/redis/".
Mention waiting line fridge, rate limiting, session cache.

- [ ] **Step 6: Update Card 6 (Prisma/Supabase)**
Update title to "src/prisma/ (Supabase)".
Mention Main Freezer, PostgreSQL.

### Task 2: Redraw SVG Pipeline Diagram

**Files:**
- Modify: `nestjs_flow_explain.html` (The `<svg>` element)

- [ ] **Step 1: Update Lane Labels**
Replace "CLIENT", "GUARD", "CONTROLLER", "SERVICE", "DATA", "RESPONSE" with folder paths: "ENTRY", "AUTH/COMMON", "REDIS", "ORDERS", "PRISMA", "RESPONSE".

- [ ] **Step 2: Redraw Nodes**
We need to reposition the rects and texts to represent:
  - Node 1: `Client` -> `src/main.ts` (Entry)
  - Node 2: `src/auth/` (Guard) + `src/common/` (Pipe)
  - Node 3: `src/redis/` (Cache Check) -> branch to fast return or continue.
  - Node 4: `src/orders/` (Controller + Service)
  - Node 5: `src/prisma/` (Supabase DB)
  - Node 6: `$transaction` inside prisma.

- [ ] **Step 3: Reroute Pipes**
Update the `<line>` and `<path>` coordinates (`d`, `x1`, `y1`, etc.) to connect the new nodes seamlessly.

### Task 3: Update Step Details Text

**Files:**
- Modify: `nestjs_flow_explain.html` (The `#stepDetails` div)

- [ ] **Step 1: Rewrite Steps 0 to 8**
Update the `<p class="step-name">` and `<p class="step-desc">` to explicitly mention the folders `src/main.ts`, `src/auth/`, `src/redis/`, `src/orders/`, `src/prisma/`.

### Task 4: Verify Functionality

- [ ] **Step 1: Open in browser**
Verify that clicking the nodes still highlights the correct step below.
Verify the SVG animations (pipes pulsing) look correct and connected.
