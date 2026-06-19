# Back Button Fix Plan — Restore Originating Section on Navigate Back

**Status:** ✅ Complete — Session 8 (2026-06-19)
**Session documented:** Session 7 (2026-06-19), updated Session 8 (2026-06-19)
**Estimated scope:** Small — 3 targeted edits to App.tsx only

---

## Problem

When a user scrolls to BLOG section and clicks a card → navigates to `/blog` → presses back, they land on HOME (section 0) instead of BLOG.

**Root cause:** The horizontal scroll container tracks active section via `scrollLeft` state (`active` in App.tsx). This state is lost when the route changes to `/blog`. `navigate(-1)` returns to `/` correctly, but App remounts at section 0 with no memory of where the user came from.

---

## Attempt 1 — `location.state` (FAILED)

**Why it failed:** `navigate('/blog', { state: { from: i } })` attaches state to the `/blog` history entry — not to `/`. When the user presses back, they return to the `/` entry, whose state is `null` (set on initial load). The `{ from: i }` state never travels back.

---

## Solution — Attempt 2: `sessionStorage`

Write the section index to `sessionStorage` before navigating away. Read and clear it on App mount. Reliable — no dependency on history state behavior.

- No extra dependencies
- Cleared on tab close (correct behavior)
- Works with existing `<BrowserRouter>` — no router changes needed

---

## Exact Code Changes (Attempt 2)

### 1. `src/app/App.tsx` — Revert `useLocation` import (line 14)
```ts
// Change back to:
import { useNavigate } from "react-router";
```

### 2. `src/app/App.tsx` — Remove `const location = useLocation();` (line 648)
Delete this line entirely.

### 3. `src/app/App.tsx` — Replace restore `useEffect` (lines 650–655)
**Replace with:**
```ts
useEffect(() => {
  const from = sessionStorage.getItem("returnToSection");
  if (from !== null) {
    sessionStorage.removeItem("returnToSection");
    containerRef.current?.scrollTo({ left: parseInt(from, 10) * window.innerWidth, behavior: "instant" });
  }
}, []);
```

### 4. `src/app/App.tsx` — Update card click handler
**Replace:**
```tsx
onCardClick={(path) => navigate(path, { state: { from: i } })}
```
**With:**
```tsx
onCardClick={(path) => { sessionStorage.setItem("returnToSection", String(i)); navigate(path); }}
```

---

## Summary of All Changes (Attempt 2)

| File | Line(s) | Change |
|------|---------|--------|
| `src/app/App.tsx` | 14 | Revert import — remove `useLocation` |
| `src/app/App.tsx` | 648 | Remove `const location = useLocation();` |
| `src/app/App.tsx` | 650–655 | Replace restore useEffect — use `sessionStorage` |
| `src/app/App.tsx` | 730, 732 | Update onCardClick — write to `sessionStorage` before navigate |

---

## Testing Plan

1. `pnpm dev`
2. Scroll to BLOG → click a card → press back → should return to BLOG (not HOME)
3. Repeat for GAMES, ANALYTICS, MUSIC, SHOP
4. Direct URL `/blog` → back → should go HOME (no sessionStorage key = section 0)
5. Card click → refresh page → back → should go HOME (tab close clears sessionStorage)

---

## Potential Issues

- **`containerRef.current` null on mount:** Guarded by `?.scrollTo`
- **`parseInt` NaN:** `sessionStorage.setItem("returnToSection", String(i))` — `i` is always a number, `String(i)` is always parseable
