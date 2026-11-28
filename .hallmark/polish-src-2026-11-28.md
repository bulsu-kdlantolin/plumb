# Plumb polish and visual sign-off

**Date:** 2026-11-28  
**Scope:** `src/` and the Vite workbench at `/`  
**Direction:** Preserve the Soot Black and Rust Red system and the existing planning flow.

## Work completed

- Removed horizontal overflow from the start screen and three-pane workbench. The center work area now grows into the space left between the rails, while the compiler and editor retain their own scrolling regions.
- Raised dark and light form-edge contrast, gave checkboxes a distinct square treatment, and made disabled selects communicate their unavailable state with fill, ink, border, and cursor changes.
- Replaced broad external Google Font requests and Geist Variable with locally bundled Latin subsets of Space Grotesk, IBM Plex Sans, and JetBrains Mono. Removed unused dialog shadow tokens and the raw soft dialog shadow. Kept only the intentional token-backed, hard offset surface shadows.
- Normalized spacing to the 4px grid; cleaned awkward sample copy, inert eyebrow text, punctuation, and broken character encoding. Corrected a compiler tab filename type mismatch found by the strict build.
- Documented the shared field-surface finish heuristic in the CSS stamp: the repeated treatment is intentional for consistency across the eight planning layers.

## Static audit

Hallmark `sloplint` result: **0 Floor failures, 0 Reflex findings, 0 warnings, 1 answered Finish finding** across 26 source files. The answered F7 finding is the shared form-field surface recipe.

## Browser render review

Puppeteer captured the sample workbench with the handoff/compiler panel open at all requested viewport sizes and both themes. All eight viewport measurements fit the viewport width; no browser console errors or failed requests were recorded. Each local font passed `document.fonts.check()` and the font set reached `loaded` status.

| Viewport | Dark | Light |
| --- | --- | --- |
| 1440 × 900 | `desktop-dark-compiler-open.png` | `desktop-light-compiler-open.png` |
| 1024 × 800 | `compact-desktop-dark-compiler-open.png` | `compact-desktop-light-compiler-open.png` |
| 768 × 1024 | `tablet-dark-compiler-open.png` | `tablet-light-compiler-open.png` |
| 375 × 812 | `mobile-dark-compiler-open.png` | `mobile-light-compiler-open.png` |

Captures and viewport/font metrics are in `.hallmark/final-renders/metrics.json`. Mobile captures include the full stacked page, including compiler output below the workbench editor.

Visual review found clear hierarchy at desktop sizes, an edge-to-edge editor canvas between the side rails, readable compiler output in light mode, and a usable single-column stack on tablet and mobile. The local fonts render without fallback or failed-resource warnings in this browser run.

Measured form-edge contrast exceeds the 3:1 non-text threshold in both themes: dark input edge **4.44:1**, dark checkbox edge **4.64:1**, light input edge **4.32:1**, and light checkbox edge **3.97:1**.

## Build

`npm run build` passed: strict TypeScript compilation and Vite production bundling completed without errors or CSS warnings. The production CSS bundle is 99.14 kB (17.41 kB gzip). `npm test` was not run because `package.json` has no test script.

The Hallmark CLI render wrapper did not finish its own browser attach before its 30-second timeout. The independent Puppeteer run above completed all eight requested renders, captured the console and failed-request lists, and supplied the screenshots used for visual review.

## Sign-off

**Signed off for this polish scope.** No viewport overflow, font loading failure, theme contrast defect, browser runtime error, or production build error remains in the reviewed states. Preserve the Rust/soot palette, compact drafting hierarchy, and full-width center workspace in future changes.
