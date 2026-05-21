# Design Spec: Folder-Based Request Lifecycle (VS Code Dark)

Replace the generic layer-based SVG diagram with a detailed, physical-folder-mapped Request Lifecycle diagram for the NestJS Restaurant Dashboard.

## Core Concept
Map the actual `src/` folder structure to the restaurant metaphor, maintaining the VS Code Dark Modern theme. The SVG diagram will show a request entering the system and physically traversing the folders.

## Folder Mapping & Metaphors
1. **`src/main.ts` & `src/app.module.ts` (Entry Point)**
   - *Metaphor:* Restaurant Entrance / Host Desk.
   - *Action:* Opens Port 3000, bootstraps the app.
2. **`src/auth/` & `src/common/` (Security & Validation)**
   - *Metaphor:* Security Checkpoint & VIP Verification.
   - *Action:* Validates JWT (`AuthGuard`), checks roles (`RolesGuard`), filters DTOs (`ValidationPipe`).
3. **`src/redis/` (Caching & Rate Limiting)**
   - *Metaphor:* Front-of-house Fridge / Fast-track Lane.
   - *Action:* Checks if the data is cached or if the user is spamming. Fast return if cached.
4. **`src/orders/`, `src/cart/`, `src/catalog/`, `src/admin/`, `src/user/` (Feature Modules)**
   - *Metaphor:* Kitchen Stations / Waitstaff.
   - *Action:* `Controller` takes the order, `Service` executes business logic (the Chef).
5. **`src/prisma/` (Database)**
   - *Metaphor:* Main Freezer / Warehouse (Supabase).
   - *Action:* Persistent storage for orders, users, etc. via PostgreSQL/Supabase.

## SVG Layout Design
The SVG will be restructured into a vertical or snake-like flow:
- **Top:** Client sending request.
- **Node 1:** `src/main.ts` (Entry).
- **Node 2:** `src/auth/` + `src/common/` (Guards/Pipes).
- **Node 3:** `src/redis/` (Cache check - with a fast-return path).
- **Node 4:** Feature Modules (`src/orders/` highlighted as the primary path).
- **Node 5:** `src/prisma/` (Supabase DB).
- **Bottom/End:** Response 200 OK.

## Component Updates
- **Components Grid:** Update the text in the "Các Phòng Ban" section to clearly reference these specific folders instead of general layers.
- **SVG Diagram:** Completely redraw the `<svg>` to match the new nodes.
- **Step Details:** Rewrite the 8 steps below the SVG to narrate this specific folder journey.

## Success Criteria
- [ ] Diagram explicitly uses folder names (`src/auth`, `src/redis`, etc.).
- [ ] Metaphor remains intact.
- [ ] Theme remains VS Code Dark Modern.
- [ ] SVG animation (pipes) flows logically through the new nodes.
