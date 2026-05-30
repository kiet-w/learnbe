# Frontend Implementation Plan - Secondary Brain

> **For agentic workers:** FOCUS EXCLUSIVELY on `frontend/`. Follow `PLAN_INTEGRATION.md`.

**Goal:** Build a responsive, real-time Notion-style dashboard.

---

### Task 1: Foundation & Navigation
- [ ] **Step 1: Global Layout**
    - Modify `frontend/src/app/layout.tsx`. Set background and base fonts.
- [ ] **Step 2: Sidebar Component**
    - Create `frontend/src/components/Sidebar.tsx`.
    - Include links for All, Cooking, Tech, etc.
- [ ] **Step 3: Commit**

### Task 2: Data Fetching & State
- [ ] **Step 1: API Client Setup**
    - Create `frontend/src/utils/api.ts` with base URL and fetch wrappers.
- [ ] **Step 2: Initial Fetch**
    - Implement `GET /notes` in the main page.
- [ ] **Step 3: Commit**

### Task 3: Capture & Optimistic UI
- [ ] **Step 1: NoteInput Component**
    - Create `frontend/src/components/NoteInput.tsx`.
- [ ] **Step 2: Optimistic UI Logic**
    - On Submit: Call `POST /notes` -> Get ID -> Add "Skeleton" note to local state.
- [ ] **Step 3: Commit**

### Task 4: SSE Real-time Updates
- [ ] **Step 1: useSSE Hook**
    - Create `frontend/src/hooks/useSSE.ts`.
    - Connect to `GET /notes/events`.
- [ ] **Step 2: ID-Bound Update Logic**
    - Listen for `note-updated`. Match by `id` and update local state.
- [ ] **Step 3: Commit**

### Task 5: Note Components (States)
- [ ] **Step 1: Skeleton Card**
    - Create `NoteCard` sub-component for `PROCESSING` status (Shimmer effect).
- [ ] **Step 2: Final Note Card**
    - Implement `COMPLETED` state: Show AI Title, Category Icon, Summary, and Bullets.
- [ ] **Step 3: Error State**
    - Implement `FAILED` state with a retry/error indicator.
- [ ] **Step 4: Commit**

### Task 6: Filtering & Polish
- [ ] **Step 1: Category Filtering**
    - Filter the feed based on the active sidebar selection.
- [ ] **Step 2: Final Styling**
    - Polish margins, colors, and transitions to match Notion aesthetics.
- [ ] **Step 3: Commit**
