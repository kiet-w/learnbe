# GEMINI - NestJS Learning Dashboard

This project is a NestJS enterprise-grade starter repository serving as the foundation for building a **NestJS Learning Dashboard**. The dashboard is an interactive, standalone tool designed to guide developers through a production-ready NestJS roadmap.

## Project Overview

- **Purpose:** To transform a comprehensive Markdown roadmap into a functional, single-file HTML dashboard (`index.html`) that simplifies the process of learning NestJS for real-world enterprise applications.
- **Core Technology:** [NestJS](https://nestjs.com/) (Node.js framework) using TypeScript.
- **Dashboard Stack:** HTML5, CSS (Dark Mode), Vanilla JavaScript, and Browser `localStorage` for progress persistence.
- **Key Assets:**
    - `learn`: The source Markdown file containing the 12-week enterprise roadmap, mindset, and detailed lessons.
    - `docs/superpowers/plans/`: Contains the implementation plan for the dashboard.
    - `docs/superpowers/specs/`: Contains the design specification for the dashboard.

## RTK - Rust Token Killer

This workspace is optimized for token savings using `rtk`. All git and shell commands are automatically rewritten to use the `rtk` proxy.

```bash
rtk gain              # Show token savings analytics
rtk gain --history    # Show command usage history with savings
rtk discover          # Analyze agent history for missed opportunities
rtk proxy <cmd>       # Execute raw command without filtering (for debugging)
```

## Getting Started

### Installation
```bash
npm install
```

### Running the Project
```bash
npm run start:dev   # Development mode
npm run start:prod  # Production mode
```

### Testing & Quality
```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run lint        # Lint and fix
npm run format      # Prettier format
```

## Behavioral Guidelines (CLAUDE.md)

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.
- Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**
- Match existing style, even if you'd do it differently.
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- If you notice unrelated dead code, mention it - don't delete it.
- Remove imports/variables/functions that YOUR changes made unused.

### 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**
- Transform tasks into verifiable goals (e.g., "Write a test that reproduces the bug, then make it pass").
- For multi-step tasks, state a brief plan with verification steps.
- Strong success criteria let you loop independently.

---
*Every changed line should trace directly to the user's request.*

