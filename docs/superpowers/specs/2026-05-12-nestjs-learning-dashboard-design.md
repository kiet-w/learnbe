# NestJS Learning Dashboard Design

## Goal

Create a single-file `index.html` learning dashboard from the user's task-based NestJS roadmap plus the existing `learn` content. The page should help a beginner follow tiny tasks, understand exactly which files to create, paste focused code, read plain-language explanations, inspect backend flow for each task, debug common failures, and track progress.

## Output Format

- One standalone `index.html`.
- No external build tooling.
- CSS and JavaScript embedded in the same file.
- Dark UI for long reading sessions.
- Content based on the local `learn` file, with added learning structure where useful.
- Replace the previous section-card-heavy dashboard with a task-first dashboard.

## Information Architecture

The page will include:

- Hero section: course title, 12-week promise, recommended study flow, and production-backend framing.
- Fixed/sticky navigation: Phần 0 through Phần 10 plus production checklist.
- Timeline: week-by-week learning path.
- Priority system:
  - `P0`: must learn first, blocks later topics.
  - `P1`: important production skill, learn after the foundation.
  - `P2`: advanced or conditional, learn when the project needs it.
- Section cards for each part:
  - What this section teaches.
  - Prerequisites.
  - Why it matters in real systems.
- Tiny ordered tasks, each intended to take 5-30 minutes.
- Every task card:
  - Goal.
  - Command, when relevant.
  - Exact file/folder path.
  - Code snippet.
  - Plain-language explanation.
  - Backend flow diagram for that task.
  - Common bug and debug steps.
  - Checklist.
- Backend flow diagram:
  - Client -> Nginx/Load Balancer -> NestJS Controller -> Guard/Auth -> Service -> Cache/DB/Queue -> Logs/Metrics -> Response.
- Production checklist grouped by security, database, performance, reliability, scalability, and deployment.
- Debug handbook grouped by real backend symptoms:
  - App cannot start.
  - Dependency injection/provider not found.
  - Validation not working or unsafe payload accepted.
  - Database connection timeout or pool exhaustion.
  - Migration failed or production schema drift.
  - JWT invalid/expired/refresh token bugs.
  - RBAC allows the wrong user or blocks the right user.
  - Redis cache stale data or cache stampede.
  - Queue job stuck, duplicated, or retried forever.
  - Nginx/load balancer routes traffic incorrectly.
  - Docker container exits, health check fails, or graceful shutdown hangs.
  - Logs/metrics missing the data needed to diagnose incidents.
  - SQL injection/XSS/security header misconfiguration.
  - Microservice message lost, duplicated, or processed out of order.
  - WebSocket scaling issues across multiple instances.

## Content Scope

The page will preserve the main ideas from `learn` and incorporate the user's Markdown roadmap style. Long examples will be split into small task cards instead of large uninterrupted sections.

The learning order will prioritize dependencies:

1. Mindset, NestJS core, DI, module/controller/service.
2. DTO validation and database basics.
3. TypeORM, connection pool, migrations.
4. Auth, JWT, guards, decorators, RBAC.
5. Rate limiting, Redis cache, queue, overload handling.
6. Scaling with Nginx, Docker Compose, health checks.
7. Observability and centralized error handling.
8. Security hardening.
9. Microservices only after monolith boundaries are clear.
10. CI/CD, graceful shutdown, CQRS, read replica, WebSocket scaling.

Each learning section will include a practical debugging layer:

- Symptoms: what the bug looks like from the outside.
- Likely causes: the most probable implementation mistakes.
- Where to inspect first: file, log, metric, request, database, Redis, queue, or container.
- Debug steps: ordered checks the learner can follow.
- Fix direction: what kind of code/config change usually resolves it.
- Prevention: test, monitoring, validation, or operational guardrail to avoid repeat incidents.

## Visual Design

Use an intentional dark learning interface:

- Background: deep navy/graphite gradients with subtle grid glow.
- Accent colors: amber for priority, cyan for infrastructure, green for completion, red for risk.
- Typography: system-safe but styled with strong hierarchy because this is a standalone offline file.
- Cards: glass-like panels with clear borders and readable spacing.
- Layout: desktop two-column with sticky sidebar; mobile collapses into a single-column page.
- Interactions:
  - Filter by priority, phase, and task type.
  - Progress checklist stored in `localStorage`.
  - Toggle between `Overview`, `Code`, `Flow`, and `Debug` views.
  - Quick reset progress button.

## Acceptance Criteria

- Opening `index.html` in a browser works without installing dependencies.
- The page contains the task-based beginner roadmap from mindset through production deployment, plus supplemental advanced topics so the original 10-part path remains covered.
- Each task clearly shows what to do first, what file to touch, what code to write, why it works, and how request/data flows.
- Backend flow is visible per task as HTML/CSS diagram-like nodes, not images.
- Tasks are small enough for a beginner to execute in 5-30 minutes.
- Common bugs and debugging steps are included for most major topics, especially database, auth, overload handling, scaling, observability, security, CI/CD, and WebSocket scaling.
- The UI is readable on desktop and mobile.
- Progress checkboxes persist after page refresh.

## Out of Scope

- Multi-page site.
- Framework setup such as React, Vite, or Next.js.
- External packages, CDN assets, or backend server.
- Full Markdown parser for the source `learn` file.
