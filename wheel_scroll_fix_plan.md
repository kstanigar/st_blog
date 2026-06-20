# Wheel Scroll Fix Plan — Vertical Scroll Navigates Horizontal Sections

**Status:** ⏸ Deferred — 3 attempts made, all reverted. Needs fresh approach.
**Session documented:** Session 7 (2026-06-19)
**Estimated scope:** Small — 2 targeted edits to App.tsx only

---

## Goal

Mouse wheel scroll down / trackpad swipe down → advance to next section (right)
Mouse wheel scroll up / trackpad swipe up → go to previous section (left)

---

## Try CSS First (Zero JS)

Before adding JS, test adding `scrollSnapStop: "always"` to the scroll container at **App.tsx line 719**:

```tsx
// App.tsx line 717–722 (scroll container style)
style={{
  scrollSnapType: "x mandatory",
  scrollSnapStop: "always",   // ← add this line
  ...
}}
```

Also add to each section shell at **App.tsx line 313**:
```tsx
style={{ width: "100vw", height: "100vh", scrollSnapAlign: "start", scrollSnapStop: "always" }}
```

**What this does:** Prevents trackpad flings from skipping sections. May be sufficient without any JS.

**If this works** — stop here, no JS needed.
**If sections still skip or vertical scroll doesn't redirect** — proceed with JS approach below.

---

## JS Approach (if CSS is not enough)

**2026 standard:** `wheel` event with `{ passive: false }` + `useRef` debounce at 400ms.

### Why 400ms debounce?
- 300ms double-fires on aggressive trackpads
- 800ms feels sluggish
- 400ms is the 2026 consensus for single-section-per-gesture feel

---

## Exact Code Changes (JS approach)

### 1. `src/app/App.tsx` — Add two refs after line 646

**Current (line 645–647):**
```ts
const containerRef = useRef<HTMLDivElement>(null);
const [active, setActive] = useState(0);
const navigate = useNavigate();
```

**Add after line 646:**
```ts
const isScrolling = useRef(false);
const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

---

### 2. `src/app/App.tsx` — Add wheel useEffect after line 657

Insert after the existing scroll listener `useEffect` (which ends at line 657):

```ts
useEffect(() => {
  const el = containerRef.current;
  if (!el) return;

  // Skip on touch-only devices (mobile) — they have native swipe
  if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;

  const handler = (e: WheelEvent) => {
    e.preventDefault();
    if (isScrolling.current) return;
    isScrolling.current = true;

    const next = e.deltaY > 0
      ? Math.min(active + 1, PAGE_CONFIG.length - 1)
      : Math.max(active - 1, 0);

    navigateTo(next);

    wheelTimerRef.current = setTimeout(() => {
      isScrolling.current = false;
    }, 400);
  };

  el.addEventListener("wheel", handler, { passive: false });

  return () => {
    el.removeEventListener("wheel", handler);
    if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
  };
}, [active]);
```

> **Dependency on `[active]`** — required because `active` is captured in the closure. The effect re-attaches the listener each time the active section changes. The timer cleanup in the return ensures no stale timers fire on re-attach.

> **`e.preventDefault()`** — required to stop the browser's native vertical scroll from firing. Only works with `{ passive: false }`.

> **Clamp to bounds** — `Math.min(..., PAGE_CONFIG.length - 1)` and `Math.max(..., 0)` prevent going out of range.

---

## Summary of All Changes

| File | Line(s) | Change |
|------|---------|--------|
| `src/app/App.tsx` | 313 | Add `scrollSnapStop: "always"` to SectionShell style (CSS test) |
| `src/app/App.tsx` | 719 | Add `scrollSnapStop: "always"` to scroll container style (CSS test) |
| `src/app/App.tsx` | after 646 | Add `isScrolling` and `wheelTimerRef` refs |
| `src/app/App.tsx` | after 657 | Add wheel `useEffect` with 400ms debounce |

**No changes to AccordionPage, templates, page files, or main.tsx.**

---

## Testing Plan

1. `pnpm dev`
2. On desktop — scroll mouse wheel down: should advance one section per gesture
3. Scroll mouse wheel up: should go back one section
4. Trackpad swipe down/up: same — should move one section per swipe, not skip
5. Test clamping: scroll down past SHOP (last section) — should stay on SHOP
6. Test clamping: scroll up past HOME (first section) — should stay on HOME
7. On mobile (or DevTools touch mode): swipe should use native horizontal swipe, not trigger wheel handler

---

## Potential Issues

- **`navigateTo` not in scope inside useEffect:** `navigateTo` is defined at line 659, after the effects. In React, functions defined in the component body are recreated each render and are in scope for effects declared in the same component — no issue.
- **Conflict with existing scroll listener:** Existing `useEffect` at line 649 listens to the `scroll` event (passive) to update `active` state. The new wheel effect listens to `wheel` (non-passive) to call `navigateTo`. These are different events — no conflict.
- **`passive: false` performance warning:** Browsers may warn in DevTools about non-passive wheel listeners blocking scroll. This is expected and acceptable — we're intentionally taking control of scroll behavior.

---

## Bug Diagnosis — Session 7 (2026-06-19)

Implemented the JS approach above. Worked for the first scroll only, then stopped responding. Console logs confirmed two root causes:

### Bug 1: `isScrolling` permanently locked after first navigation

**What happens:**
1. User swipes → `navigateTo(1)` fires, `isScrolling.current = true`, 400ms timer starts
2. `active` updates to 1 → effect cleanup runs → `clearTimeout(wheelTimerRef.current)` kills the reset timer
3. New handler attaches with `isScrolling.current` still `true`
4. All subsequent wheel events hit "debounced, skipping" forever

**Root cause:** Cleanup correctly removes the old listener but also kills the timer that would have reset the lock.

**Fix:** Reset `isScrolling.current = false` at the top of the effect on every re-run. Re-running means `active` just changed = a navigation completed = safe to accept next gesture.

```ts
useEffect(() => {
  const el = containerRef.current;
  isScrolling.current = false;  // ← add this line
  if (!el) return;
  // ...
}, [active]);
```

---

### Bug 2: Wrong axis — trackpad horizontal swipe uses `deltaX`, not `deltaY`

**What the logs showed:**
```
[wheel] event fired — deltaX: 45 deltaY: -0   // horizontal swipe
[wheel] navigating to section: 0               // Math.max(0-1, 0) = 0, no movement
```

Mac trackpad two-finger swipe left/right generates `deltaX`. The original handler only checked `e.deltaY > 0`, so all horizontal swipes were treated as backward scrolls from section 0 → clamped to 0 → no visible movement.

**Fix:** Use dominant axis:

```ts
const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
const next = delta > 0
  ? Math.min(active + 1, PAGE_CONFIG.length - 1)
  : Math.max(active - 1, 0);
```

---

## Corrected useEffect (with both fixes applied) — SUPERSEDED

> This version was applied but caused a new bug: scrolling 4 pages per gesture.
> Root cause: `[active]` dependency re-runs the effect on every navigation, resetting `isScrolling.current = false` immediately mid-gesture.
> See "Bug 3" below for the researched fix.

---

## Bug 3: Multi-section scroll per gesture (4 pages at once)

**What happens:**
1. User swipes → `navigateTo(1)` fires, `isScrolling.current = true`, 800ms timer starts
2. `active` updates to 1 → effect re-runs (because `[active]` dependency) → `isScrolling.current = false` resets immediately
3. Next wheel event fires before gesture ends → navigates again → repeat × 4

**Root cause:** `[active]` dependency causes effect to re-run on every navigation. Resetting `isScrolling` at the top of the re-run clears the lock mid-gesture.

**Researched fix (2026 standard):** `activeRef` pattern with empty deps `[]`
- Mirror `active` state into a `useRef` — handler reads from ref (always fresh), never captures stale closure
- Effect uses `[]` empty deps — attaches once on mount, never re-runs mid-gesture
- No re-run = no accidental lock reset
- Debounce increased to **800ms** (trackpad momentum fires for 600–800ms after finger lift; 400ms is too short)

**Source:** React docs "ref to the latest value" pattern — canonical fix for long-lived event listeners (wheel, keydown, resize) with stale closure problem.

---

## Final Fix — Exact Code Changes

### Change 1: `src/app/App.tsx` — Add `activeRef` after line 649

**Current (lines 648–649):**
```ts
const isScrolling = useRef(false);
const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

**Change to:**
```ts
const isScrolling = useRef(false);
const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const activeRef = useRef(active);
```

---

### Change 2: `src/app/App.tsx` — Add sync effect after line 659 (after scroll listener effect)

**Insert after line 659** (`}, []);` — the closing of the scroll listener effect):
```ts
useEffect(() => {
  activeRef.current = active;
}, [active]);
```

---

### Change 3: `src/app/App.tsx` — Replace wheel useEffect (lines 661–692)

**Current (lines 661–692):**
```ts
useEffect(() => {
  const el = containerRef.current;
  isScrolling.current = false;
  if (!el) return;

  const isTouchOnly = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (isTouchOnly) return;

  const handler = (e: WheelEvent) => {
    e.preventDefault();
    if (isScrolling.current) return;
    isScrolling.current = true;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const next = delta > 0
      ? Math.min(active + 1, PAGE_CONFIG.length - 1)
      : Math.max(active - 1, 0);

    navigateTo(next);

    wheelTimerRef.current = setTimeout(() => {
      isScrolling.current = false;
    }, 400);
  };

  el.addEventListener("wheel", handler, { passive: false });

  return () => {
    el.removeEventListener("wheel", handler);
    if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
  };
}, [active]);
```

**Replace with:**
```ts
useEffect(() => {
  const el = containerRef.current;
  if (!el) return;

  if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;

  const handler = (e: WheelEvent) => {
    e.preventDefault();
    if (isScrolling.current) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const next = delta > 0
      ? Math.min(activeRef.current + 1, PAGE_CONFIG.length - 1)
      : Math.max(activeRef.current - 1, 0);

    if (next === activeRef.current) return;

    isScrolling.current = true;
    navigateTo(next);

    wheelTimerRef.current = setTimeout(() => {
      isScrolling.current = false;
    }, 800);
  };

  el.addEventListener("wheel", handler, { passive: false });

  return () => {
    el.removeEventListener("wheel", handler);
    if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
  };
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

---

## Summary of All Changes (Final)

| File | Line(s) | Change |
|------|---------|--------|
| `src/app/App.tsx` | 650 | Add `const activeRef = useRef(active);` |
| `src/app/App.tsx` | after 659 | Add sync effect `useEffect(() => { activeRef.current = active; }, [active])` |
| `src/app/App.tsx` | 661–692 | Replace wheel useEffect — empty deps, `activeRef.current`, 800ms debounce, `if (next === current) return` guard |

**Key changes from previous attempt:**
- `[active]` → `[]` deps (no more mid-gesture re-runs)
- `active` → `activeRef.current` in handler (no stale closure)
- 400ms → 800ms debounce (covers trackpad momentum tail)
- Added `if (next === activeRef.current) return` guard (no-op at boundaries)
