# Project Priorities — st_blog (Xenon 3 NON-X)
> Reverse chronological order. Newest entries at top.
> Detail plans live in separate files — see **Plan file** links below.

---

## Current Priorities

### 2026-06-16 — Auth & Payments System
**Status:** 🔲 Planned — Session 4A up next
**Plan file:** `auth_payments_plan.md`

- [ ] Session 4A — Supabase setup + DB schema + auth modal
- [ ] Session 4B — Stripe products + Checkout + webhook Edge Function
- [ ] Session 4C — FloatingPalette wired to purchases + AWS Amplify deploy

**Stack:** Supabase (PKCE auth + PostgreSQL + Edge Functions) + Stripe Checkout + AWS Amplify

---

### 2026-06-19 — Accordion Routing System
**Status:** ✅ Complete — Session 6
**Plan file:** `accordion_routing_plan.md`

- Cards/tiles navigate to dedicated routes — back button returns to originating section via `navigate(-1)`
- Note: Circuit z-index bleeds through Analytics/Shop cards on hover — left for future investigation

---

### 2026-06-19 — Phase 2: Page Modularity + Template System
**Status:** ✅ Complete — Session 6
**Plan file:** `phase2_page_templates_plan.md`

- 8 new files: `src/components/GridOverlay.tsx`, `src/app/templates/` (6 templates + index.ts)
- `PAGE_CONFIG` drives nav, counter, circuit, and section renders — adding a page = one entry + content component
- `SectionShell` replaces `Section` — handles scroll snap + counter for all pages

---

### 2026-06-16 — Task Group 4: Color Skin System (FloatingPalette UI)
**Status:** 🔲 Planned — NEXT UP
**Plan file:** `task_group4_floating_palette_plan.md`
**Dependencies:** Auth & Payments (for purchase gating)

- `src/app/FloatingPalette.tsx` — new file ~100 lines
- 6 named skins ($2.99 each), hue slider ($7.99), rainbow cycle ($9.99), master toggle
- `applyHue()` writes to `--primary` → color-mix cascade updates entire site
- MatrixBackground canvas sync via `primaryColor` prop

---

### 2026-06-15 — Theme Modularization & Circuit Responsive Fix
**Status:** ✅ Complete — Session 3

- Replaced all 28 hardcoded hex/rgba colors in App.tsx with CSS var references
- Added 6 alpha variant CSS vars to theme.css using color-mix() — glow effects auto-update when --primary changes
- Fixed circuit SVG — dynamic width scales to viewport (was hardcoded 6000px)
- Z-index hierarchy fixed: MatrixBackground(0) → overlays(10) → Circuit(11) → Content(20) → Nav(50)
- Page transparency variance: Blog (bg/20 + blur-xl), Games (bg/40 + blur-md), Music (bg/60 + blur-sm)

---

### 2026-06-15 — Page Reorder, Navigation & Circuit Line Redesign
**Status:** ✅ Complete — Session 3

- Reordered pages: HOME → BLOG → GAMES → ANALYTICS → MUSIC → SHOP
- Renamed TOOLS → ANALYTICS
- Updated nav links and PAGES/PAGE_ICONS arrays

---

## Completed Priorities

### 2026-06-15 — GitHub Pages Deployment Fix
**Status:** ✅ Complete

- Added `base: '/st_blog/'` to `vite.config.ts`
- Created `.github/workflows/deploy.yml` (Node 22 + pnpm 11 + Vite build)
- Removed GitHub's auto-generated `static.yml`
- Site live at `kstanigar.github.io/st_blog/`

---

### 2026-06-15 — Project Setup & Dependency Installation
**Status:** ✅ Complete — Session 1

- Confirmed CLAUDE.md rules active (9 principles)
- Installed pnpm + all 289 dependencies
- Dev server confirmed running at localhost:5173
- Tech stack: React 18 + TypeScript + Vite 6 + Tailwind CSS 4 + shadcn/ui
