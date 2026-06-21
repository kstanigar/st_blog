# Mobile Responsiveness Plan
> Standing Tiger Blog — All-page mobile audit
> Created: 2026-06-21 | Status: Planning

---

## Breakpoint

**768px = Tailwind `md`** — all responsive changes use the `md:` prefix.

---

## Issue 1: Nav → Hamburger Menu

**File:** `src/app/App.tsx`
**Lines:** ~717–776 (entire `<nav>` block)

**Problem:**
- 6 page links + STANDING TIGER logo + LOGIN always visible in one row
- Overflows/squishes on screens < ~900px

**Fix:**
- Add `menuOpen: boolean` state to `AppContent`
- Below `md`: hide page links div, show `☰` / `✕` icon button
- At `md+`: show page links, hide hamburger
- Clicking hamburger: show full-screen or dropdown overlay with vertical page link list
- Close menu after: nav item clicked, or hamburger toggled closed
- LOGIN button stays visible at all sizes (right side of nav)

**Tailwind classes involved:**
- `hidden md:flex` on the page links container
- `flex md:hidden` on the hamburger button
- Dropdown: `absolute top-full left-0 right-0 flex flex-col` (only visible when `menuOpen`)

---

## Issue 2: Shop Cards — Not Responsive

**Files:**
- `src/app/templates/ShopTemplate.tsx` — Line 20: `<div className="flex gap-3">`
- `src/app/App.tsx` — Line 612: `className="border border-border bg-card p-5 w-44 flex flex-col ..."`  + `style={{ minWidth: 176 }}`

**Problem:**
- Template uses `flex gap-3` with no wrapping
- 4 cards × 176px = ~720px → overflows 375px mobile screen

**Fix (ShopTemplate.tsx:20):**
- Change `flex gap-3` → `grid grid-cols-1 sm:grid-cols-2 gap-3`

**Fix (App.tsx ShopSection card):**
- Remove `w-44` class and `style={{ minWidth: 176 }}`
- Cards become full-width inside the grid cells

---

## Issue 3: Games Grid — No Mobile Breakpoint

**File:** `src/app/templates/GamesTemplate.tsx`
**Line:** 17: `<div className="grid grid-cols-2 gap-3 max-w-2xl">`

**Problem:**
- `grid-cols-2` always → 2 cramped columns on 375px screen

**Fix:**
- Change `grid-cols-2` → `grid-cols-1 md:grid-cols-2`

---

## Issue 4: Analytics Grid — No Mobile Breakpoint

**File:** `src/app/templates/AnalyticsTemplate.tsx`
**Line:** 20: `<div className="grid grid-cols-2 max-w-2xl border-l border-t border-border" ...>`

**Problem:**
- `grid-cols-2` always → same as Games issue

**Fix:**
- Change `grid-cols-2` → `grid-cols-1 md:grid-cols-2`

---

## Issue 5: Left Padding — All Templates + HomeSection

**Files:**
- `src/app/templates/BlogTemplate.tsx` — Line 6
- `src/app/templates/GamesTemplate.tsx` — Line 5
- `src/app/templates/AnalyticsTemplate.tsx` — Line 5
- `src/app/templates/MusicTemplate.tsx` — Line 6
- `src/app/templates/ShopTemplate.tsx` — Line 6
- `src/app/App.tsx` — Line 333 (HomeSection)

**Problem:**
- All use `pl-16 lg:pl-24` — 64px left padding on mobile is too wide for 375px screens

**Fix:**
- Change `pl-16 lg:pl-24` → `pl-8 md:pl-16 lg:pl-24`

---

## Summary of Files Changed

| File | Lines | Change |
|---|---|---|
| `src/app/App.tsx` | ~717–776 | Nav hamburger logic + state |
| `src/app/App.tsx` | ~333 | HomeSection left padding |
| `src/app/App.tsx` | ~612 | Shop card: remove `w-44` + `minWidth` |
| `src/app/templates/ShopTemplate.tsx` | 20 | `flex gap-3` → `grid grid-cols-1 sm:grid-cols-2 gap-3` |
| `src/app/templates/GamesTemplate.tsx` | 17 | `grid-cols-2` → `grid-cols-1 md:grid-cols-2` |
| `src/app/templates/AnalyticsTemplate.tsx` | 20 | `grid-cols-2` → `grid-cols-1 md:grid-cols-2` |
| `src/app/templates/BlogTemplate.tsx` | 6 | `pl-16` → `pl-8 md:pl-16` |
| `src/app/templates/GamesTemplate.tsx` | 5 | `pl-16` → `pl-8 md:pl-16` |
| `src/app/templates/AnalyticsTemplate.tsx` | 5 | `pl-16` → `pl-8 md:pl-16` |
| `src/app/templates/MusicTemplate.tsx` | 6 | `pl-16` → `pl-8 md:pl-16` |
| `src/app/templates/ShopTemplate.tsx` | 6 | `pl-16` → `pl-8 md:pl-16` |

---

## Task List

- [x] Implement nav hamburger (App.tsx nav block)
- [x] Fix Shop cards (ShopTemplate.tsx + App.tsx ShopSection)
- [ ] Fix Games grid (GamesTemplate.tsx)
- [ ] Fix Analytics grid (AnalyticsTemplate.tsx)
- [ ] Fix left padding — all templates + HomeSection

---

## Notes

- 768px (`md`) is the only breakpoint used — consistent across all fixes
- `sm:grid-cols-2` for Shop (640px) — 2 columns appear earlier since shop cards are wide enough at 640px
- Nav hamburger should NOT show on desktop (`hidden md:flex` for the links, `flex md:hidden` for hamburger)
- LOGIN button always visible — mobile users need auth access
- STANDING TIGER logo always visible — brand identity

---

*Last updated: 2026-06-21*
