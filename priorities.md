# Project Priorities — st_blog (Xenon 3 NON-X)
> Reverse chronological order. Newest entries at top.
> Detail plans live in separate files — see **Plan file** links below.

---

## Current Priorities

### 2026-06-21 — Shared Card Component (Deferred Discussion)
**Status:** 🔲 To revisit
**Context:** Templates (`BlogTemplate`, `GamesTemplate`, etc.) are layout shells only — card hover styles (border, glow, bg tint) live in section components inside `App.tsx` and are NOT inherited by new pages using the templates. If more pages are added, consider extracting a shared `<Card />` component with standard hover/glow styles baked in so new pages don't have to hand-write card styles from scratch.

---

### 2026-06-19 — Wheel Scroll Navigation
**Status:** ⏸ Deferred — reverted, needs fresh approach
**Plan file:** `wheel_scroll_fix_plan.md`

- CSS fix (`scrollSnapStop: always`) kept — prevents section-skipping on fast flings
- JS wheel handler attempted 3 times, all reverted:
  - Attempt 1: `isScrolling` permanently locked → skipped all pages
  - Attempt 2: `[active]` deps + reset at top of effect → skipped 4 pages
  - Attempt 3: `activeRef` + empty deps + 800ms debounce → skipped 2 pages
- Arrow key navigation still works
- Deferred — revisit in a future session with a fresh approach

---

### 2026-06-20 — Auth & Payments System
**Status:** 🟡 In Progress — Session 4C remaining
**Plan file:** `auth_payments_plan.md`

- [x] Session 4A — Supabase setup + DB schema + auth modal
- [x] Session 4B — Stripe products + Checkout + webhook Edge Function
- [x] Phase 8 — Deploy strategy: AWS Amplify for both `dev` (staging) and `main` (prod); `amplify.yml` added; `build-check.yml` CI added
- [x] GitHub Pages dev deploy — `deploy-dev.yml` + SPA routing fix; site live at `kstanigar.github.io/st_blog/`
- [ ] Session 4C — Wire `usePurchases()` into FloatingPalette to gate paid skins/slider/rainbow
- [ ] Amplify console setup — connect repo, set env vars per branch, add SPA rewrite rule

**Stack:** Supabase (email/password auth + PostgreSQL + Edge Functions) + Stripe Checkout + AWS Amplify

---


### 2026-06-16 — Task Group 4: Color Skin System (FloatingPalette UI)
**Status:** 🔲 Planned — after Auth & Payments
**Plan file:** `task_group4_floating_palette_plan.md`
**Dependencies:** Auth & Payments (for purchase gating)

- `src/app/FloatingPalette.tsx` — new file ~100 lines
- 6 named skins ($2.99 each), hue slider ($7.99), rainbow cycle ($9.99), master toggle
- `applyHue()` writes to `--primary` → color-mix cascade updates entire site
- MatrixBackground canvas sync via `primaryColor` prop

---

## Completed Priorities

### 2026-06-19 — PostHog Analytics
**Status:** ✅ Session A complete — B/C/D embedded in future sessions
**Plan file:** `posthog_analytics_plan.md`

- [x] Session A: Install, init in `main.tsx`, all events wired, build verified, events confirmed in PostHog dashboard
- [x] Session B: `identify()` wired to Supabase auth (during Auth session 4A)
- [ ] Session C: `skin selected` event (during FloatingPalette)
- [ ] Session D: `purchase initiated` + `purchase completed` (during Stripe session 4B)
- No cookie banner needed — uses `localStorage` persistence, not cookies
- Events: `section navigated`, `card clicked`, `accordion expanded`, `product viewed`, `back to home clicked`

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

### 2026-06-19 — Back Button Fix (Restore Originating Section)
**Status:** ✅ Complete — Session 8
**Plan file:** `archives/back_button_fix_plan.md`

- Back button now returns to originating section
- Fix: `sessionStorage` — write section index before navigate, read and clear on App mount
- Note: `location.state` approach failed — state attaches to destination route, not source

---

### 2026-06-19 — Accordion Routing System
**Status:** ✅ Complete — Session 6
**Plan file:** `archives/accordion_routing_plan.md`

- Cards/tiles navigate to dedicated routes — back button returns to originating section via `navigate(-1)`
- Note: Circuit z-index bleeds through Analytics/Shop cards on hover — left for future investigation

---

### 2026-06-19 — Phase 2: Page Modularity + Template System
**Status:** ✅ Complete — Session 6
**Plan file:** `archives/phase2_page_templates_plan.md`

- 8 new files: `src/components/GridOverlay.tsx`, `src/app/templates/` (6 templates + index.ts)
- `PAGE_CONFIG` drives nav, counter, circuit, and section renders — adding a page = one entry + content component
- `SectionShell` replaces `Section` — handles scroll snap + counter for all pages

---

### 2026-06-15 — GitHub Pages Deployment (Superseded)
**Status:** ✅ Replaced by AWS Amplify (Session 18)

- Originally deployed to `kstanigar.github.io/st_blog/` via `deploy.yml`
- Replaced with AWS Amplify (both staging + prod) — `deploy.yml` deleted, `amplify.yml` added
- `build-check.yml` retained as PR build-check CI

---

### 2026-06-15 — Project Setup & Dependency Installation
**Status:** ✅ Complete — Session 1

- Confirmed CLAUDE.md rules active (9 principles)
- Installed pnpm + all 289 dependencies
- Dev server confirmed running at localhost:5173
- Tech stack: React 18 + TypeScript + Vite 6 + Tailwind CSS 4 + shadcn/ui
