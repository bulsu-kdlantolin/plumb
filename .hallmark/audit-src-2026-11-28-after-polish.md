# Hallmark audit: Plumb after polish

**Date:** 2026-11-28  
**Scope:** `src/`, served at `/` by Vite  
**Mode:** read-only; this audit changed no application files.  
**Design authority:** `DESIGN.md` → `.impeccable/design-full.md`; Rust/soot tokens in `src/index.css`.

## Pre-flight

- **Purpose:** Plumb helps developers plan a software system and export a context bundle for their coding agent.
- **Works and stays:** The four-phase workflow, local-first project storage, diagram canvas, and compiler output give the app a clear engineering-tool identity.
- **Generated tells:** Static audit found no open Floor or Reflex tells. The shared field style is intentionally consistent and recorded as an answered Finish check.
- **Broken:** No source defect was confirmed. Hallmark's browser wrapper timed out in this environment; see render evidence below.

## Route inventory

| Route | Entry | Kind |
| --- | --- | --- |
| `/` | `src/main.tsx` → `src/App.tsx` → `src/app/App.tsx` | Single-page workbench |

No additional routes were found under `src/`.

## Static audit

`sloplint src --genre modern-minimal --scope app --json` scanned 26 files:

- **Floor:** 0 FAIL
- **Reflex:** 0 open findings
- **Finish:** 1 answered finding
- **Other:** 0 warnings, 0 rejected waivers

The answered finding is **F7** at `src/index.css:109`: input controls share a consistent field-surface recipe. Its stamp records the reason: predictable editing across the eight planning layers.

## Visual read

The previous full Puppeteer pass in `.hallmark/final-renders/` captured the workbench with the compiler open at 1440×900, 1024×800, 768×1024, and 375×812 in dark and light themes. All eight document widths matched their viewport widths, all three local font checks passed, and the capture recorded no browser console errors or failed requests. The light compiler output remained readable; the responsive layout stacks the workbench panes on tablet and mobile. Mobile captures are full-page so the compiler below the editor is included.

This invocation also requested Hallmark's own `--render` tier, but its browser wrapper timed out after 30 seconds and returned `render: not run`. The existing Puppeteer matrix is the current visual evidence; the only later source change is the disabled-select opacity removal, which is not visible in those seeded-project captures. The prior audit at `.hallmark/audit-src-2026-11-28.md` is the pre-polish baseline and is superseded for current source findings.

## Ergonomic observations

These are review notes, not static Hallmark failures:

1. At phone width, `src/index.css:518` hides the project identity in the top bar. The Plans control remains, but the active project name is no longer visible while editing.
2. The phase navigation precedes a long stacked editor on mobile, so switching phases after scrolling requires returning to the top. A compact sticky phase control could reduce that travel if mobile use is a priority.

Both are appropriate for a small polish pass; neither requires a structural redesign.

## Report files

- Render metrics: `.hallmark/final-renders/metrics.json`
- Screenshot matrix: `.hallmark/final-renders/`
- Before polish: `.hallmark/audit-src-2026-11-28.md`

**Preserve:** the Rust/soot palette, compact drafting hierarchy, full-width center workspace, and the four-phase planning-to-handoff flow.
