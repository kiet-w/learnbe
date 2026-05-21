# Codebase Cleanup and Documentation Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up redundant files (scripts, logs) and organize all markdown documentation into the `docs/` directory.

**Architecture:** Surgical deletion of unnecessary files and relocation of documentation with path updates in project configuration and metadata files.

**Tech Stack:** Shell (rm, mv), Markdown.

---

### Task 1: Delete Redundant Files

**Files:**
- Delete: `app.log`
- Delete: `src_explanation.html`
- Delete: `restore_skill.py`
- Delete: `simplify_metadata.py`
- Delete: `update_metadata.py`
- Delete: `update_metadata_v2.py`

- [ ] **Step 1: Delete identified files**

Run: `rm app.log src_explanation.html restore_skill.py simplify_metadata.py update_metadata.py update_metadata_v2.py`

- [ ] **Step 2: Verify deletion**

Run: `ls app.log src_explanation.html restore_skill.py simplify_metadata.py update_metadata.py update_metadata_v2.py`
Expected: "No such file or directory" error for all files.

- [ ] **Step 3: Commit**

Run: `rtk git add . && rtk git commit -m "cleanup: remove redundant log and utility scripts"`

---

### Task 2: Move and Rename Markdown Files

**Files:**
- Move: `learn` -> `docs/LEARN.md`
- Move: `src_explanation.md` -> `docs/explanations/src_explanation.md`
- Move: `RTK.md` -> `docs/RTK.md`
- Move: `SUPABASE_PRISMA_GUIDE.md` -> `docs/SUPABASE_PRISMA_GUIDE.md`
- Move: `CODE_REVIEW_GRAPH.md` -> `docs/CODE_REVIEW_GRAPH.md`

- [ ] **Step 1: Create directories if missing**

Run: `mkdir -p docs/explanations`

- [ ] **Step 2: Move and rename files**

Run:
```bash
mv learn docs/LEARN.md
mv src_explanation.md docs/explanations/src_explanation.md
mv RTK.md docs/RTK.md
mv SUPABASE_PRISMA_GUIDE.md docs/SUPABASE_PRISMA_GUIDE.md
mv CODE_REVIEW_GRAPH.md docs/CODE_REVIEW_GRAPH.md
```

- [ ] **Step 3: Verify movement**

Run: `ls docs/LEARN.md docs/explanations/src_explanation.md docs/RTK.md docs/SUPABASE_PRISMA_GUIDE.md docs/CODE_REVIEW_GRAPH.md`
Expected: All files listed.

- [ ] **Step 4: Commit**

Run: `rtk git add . && rtk git commit -m "docs: organize root markdown files into docs folder"`

---

### Task 3: Update Internal References

**Files:**
- Modify: `GEMINI.md`
- Modify: `AGENTS.md`
- Modify: `docs/superpowers/plans/2026-05-12-nestjs-learning-dashboard.md`
- Modify: `docs/superpowers/specs/2026-05-12-nestjs-learning-dashboard-design.md`
- Modify: `docs/superpowers/specs/2026-05-20-cocoindex-codebase-analyzer-design.md`
- Modify: `docs/superpowers/plans/2026-05-20-cocoindex-codebase-analyzer.md`

- [ ] **Step 1: Update GEMINI.md**

Update `learn` to `docs/LEARN.md`.

```markdown
<<<<
    - `learn`: The source Markdown file containing the 12-week enterprise roadmap, mindset, and detailed lessons.
====
    - `docs/LEARN.md`: The source Markdown file containing the 12-week enterprise roadmap, mindset, and detailed lessons.
>>>>
```

- [ ] **Step 2: Update AGENTS.md**

Update `@RTK.md` to `@docs/RTK.md`.

```markdown
<<<<
@RTK.md
====
@docs/RTK.md
>>>>
```

- [ ] **Step 3: Update Learning Dashboard files**

Update all occurrences of `learn` to `docs/LEARN.md` in `docs/superpowers/plans/2026-05-12-nestjs-learning-dashboard.md` and `docs/superpowers/specs/2026-05-12-nestjs-learning-dashboard-design.md`.

- [ ] **Step 4: Update CocoIndex files**

Update `src_explanation.md` to `docs/explanations/src_explanation.md` in `docs/superpowers/specs/2026-05-20-cocoindex-codebase-analyzer-design.md` and `docs/superpowers/plans/2026-05-20-cocoindex-codebase-analyzer.md`.

- [ ] **Step 5: Commit**

Run: `rtk git add . && rtk git commit -m "docs: update internal references to reflect new file locations"`
