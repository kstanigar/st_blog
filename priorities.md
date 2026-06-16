# Project Priorities — st_blog (Xenon 3 NON-X)
> Reverse chronological order. Newest entries at top. Hook auto-moves ✅ completed items to Completed section.

---

## Current Priorities

### 2026-06-15 — Page Reorder, Navigation & Circuit Line Redesign
**Status:** 🔲 Up Next (Session 3)

**Scope:**
- Reorder the 6 horizontal scroll pages (HOME, GAMES, MUSIC, TOOLS, BLOG, SHOP)
- Update navigation to match new page order
- Redesign/modify the SVG circuit animation line that follows scroll progress

**Tasks:**
- [ ] Review current page order and define new order with user
- [ ] Reorder page components in `App.tsx`
- [ ] Update nav links to reflect new order
- [ ] Inspect circuit line SVG animation in `App.tsx`
- [ ] Plan circuit line design changes with user
- [ ] Implement circuit line changes

**Files Likely Affected:**
- `src/app/App.tsx` — page order, nav links, circuit SVG animation

---

### 2026-06-15 — GitHub Pages Deployment Fix
**Status:** ✅ Complete

**Problem:** Site at `kstanigar.github.io/st_blog/` returns 404 on `main.tsx` — Vite project needs to be built before deploying; raw source files cannot be served directly.

**Task List:**
- [x] Document plan in priorities.md
- [ ] Add `base: '/st_blog/'` to `vite.config.ts`
- [ ] Create `.github/workflows/deploy.yml` GitHub Actions workflow
- [ ] Run `pnpm run build` locally to verify no build errors
- [ ] Commit and push
- [ ] Change GitHub Pages source to **GitHub Actions** (manual — in repo Settings → Pages)
- [x] Verify site loads at `kstanigar.github.io/st_blog/`

**Code Changes:**
- `vite.config.ts:19` — Add `base: '/st_blog/'` to `defineConfig()` so Vite generates correct asset paths for GitHub Pages subdirectory
- `.github/workflows/deploy.yml` — New file, ~30 lines — GitHub Actions workflow that installs pnpm, builds with Vite, uploads `dist/` as Pages artifact, deploys on every push to `main`

**Potential Errors (Researched):**
- Assets still 404 after deploy → base path not set correctly, confirm `base: '/st_blog/'` matches repo name exactly
- Build fails in Actions → Node/pnpm version mismatch, using Node 20 + pnpm 11 to match local
- Pages still shows old deploy → GitHub Actions source not selected in Pages settings

**Decisions:**
- GitHub Actions over manual `dist` branch deploy — auto-deploys on every push, no manual steps
- pnpm version pinned to 11 in workflow to match local environment

---

## Completed Priorities

### 2026-06-15 — Project Setup & Dependency Installation
**Status:** ✅ Complete
**Session:** June 15, 2026

**Tasks Completed:**
- [x] Read and confirmed CLAUDE.md rules (9 core principles)
- [x] Used haiku agent to analyze full tech stack from project files
- [x] Installed pnpm globally via `npm install -g pnpm`
- [x] Ran `pnpm install` — 289 packages installed
- [x] Approved build scripts for `@tailwindcss/oxide` and `esbuild` via `pnpm approve-builds`
- [x] Confirmed dev server runs at `http://localhost:5173/`

**Tech Stack Identified:**
- React 18 + TypeScript + Vite 6
- Tailwind CSS 4 + shadcn/ui (20+ Radix UI components)
- MUI 7, Lucide React, Motion, Recharts, Sonner, Vaul
- react-hook-form, react-router 7, react-dnd, Embla Carousel

**Decisions:**
- Used `pnpm` (project uses pnpm-workspace.yaml)
- Approved native build scripts for Tailwind oxide engine and esbuild (required for Vite/Tailwind to function)

---
