# Project Priorities — st_blog (Xenon 3 NON-X)
> Reverse chronological order. Newest entries at top. Hook auto-moves ✅ completed items to Completed section.

---

## Current Priorities

### 2026-06-16 — Auth & Payments System
**Status:** 🔲 Planned — Session 4A up next
**Plan file:** `auth_payments_plan.md`

**Scope:**
- Full user auth (Supabase — email/password + Google OAuth, PKCE flow)
- One-time purchases via Stripe Checkout (hosted)
- Supabase Edge Function webhook → records purchases to PostgreSQL
- FloatingPalette UI wired to real purchase state (locked/unlocked per user)
- AWS Amplify deployment

**Monetization tiers:**
| Product | Price | `product_id` |
|---|---|---|
| Skin: NEON GHOST | $2.99 | `skin_neon_ghost` |
| Skin: TOXIC | $2.99 | `skin_toxic` |
| Skin: SOLAR FLARE | $2.99 | `skin_solar_flare` |
| Skin: IVORY STATIC | $2.99 | `skin_ivory_static` |
| Skin: BLOOD CODE | $2.99 | `skin_blood_code` |
| Skin: EMBER | $2.99 | `skin_ember` |
| Color Wheel (hue slider) | $7.99 | `color_wheel` |
| Rainbow Cycle + speed control | $9.99 | `rainbow_cycle` |

**Session breakdown:**
- [ ] **Session 4A** — Phase 1–3: Supabase setup + DB schema + auth modal
- [ ] **Session 4B** — Phase 4–6: Stripe products + Checkout + webhook Edge Function
- [ ] **Session 4C** — Phase 7–8: FloatingPalette wired to purchases + AWS Amplify deploy

**Security requirements (researched):**
- RLS on `purchases` table — `auth.uid() = user_id` policy
- `stripe_session_id` unique constraint — safe webhook retries, no duplicate unlocks
- Anon key only in browser bundle — service role key in Edge Function secrets only
- Stripe webhook HMAC signature verified on every request
- CSP headers on CloudFront/Amplify

**Files to create:**
- `src/lib/supabase.ts` — client singleton
- `src/lib/stripe.ts` — loadStripe singleton
- `src/lib/purchases.ts` — fetch user purchases as a Set
- `src/hooks/useAuth.ts` — auth state hook
- `src/hooks/usePurchases.ts` — purchases state hook
- `src/context/AuthContext.tsx` — app-wide auth provider
- `src/app/AuthModal.tsx` — login/signup modal
- `src/app/FloatingPalette.tsx` — color skin modal (Task Group 4, wired to purchases)
- `supabase/functions/stripe-webhook/index.ts` — Edge Function
- `supabase/migrations/001_purchases.sql` — schema + RLS policies

---

### 2026-06-16 — Phase 2: Page Modularity + Template System
**Status:** 🔲 Planned — approved, ready to implement
**Confirmed approach:** Templates as full layout skeletons with content slot

**Goal:** Adding a new page = one entry in `PAGE_CONFIG` + a content component. Every template is pre-tested — overlay, circuit visibility, header, title, content container all come for free.

---

**Architecture overview:**

```
PAGE_CONFIG entry
  └── template: 0–5 (or null for HOME)
        └── Template component (e.g. BlogTemplate)
              ├── Overlay div (transparency + blur)
              ├── GridOverlay
              ├── PageHeader (NODE://LABEL + icon)
              ├── PageTitle (h2)
              └── Content slot → <page.component /> (rows / cards / cells)

SectionShell (scroll snap + counter — same for every page)
  └── wraps Template + content
```

---

**6 Page Templates:**

| # | Name | Overlay | Circuit | Content Container | Best for |
|---|---|---|---|---|---|
| 0 | BLOG | `bg/20 backdrop-blur-xl` | visible | `border-t` list, rows | Articles, lists |
| 1 | GAMES | none (transparent) | fully visible | 2-col card grid | Cards, showcase |
| 2 | ANALYTICS | `bg/96` | hidden | 2-col border grid | Data, dense UI |
| 3 | MUSIC | `bg/60 backdrop-blur-sm` | partial | `border-t` list, dense rows | Tools, link lists |
| 4 | SHOP | `bg/96` | hidden | flex card row | Products, commerce |
| 5 | BLANK | none | fully visible | none — full freedom | Custom layouts |

HOME = `template: null` — renders its own full component, not slotted.

---

**New file structure:**

```
src/app/
├── templates/
│   ├── index.ts              — PAGE_TEMPLATES lookup + TemplateProps type export
│   ├── BlogTemplate.tsx      — Template 0
│   ├── GamesTemplate.tsx     — Template 1
│   ├── AnalyticsTemplate.tsx — Template 2
│   ├── MusicTemplate.tsx     — Template 3
│   ├── ShopTemplate.tsx      — Template 4
│   └── BlankTemplate.tsx     — Template 5
└── App.tsx                   — updated (section components stripped to content only)
```

---

**`TemplateProps` type (in `src/app/templates/index.ts`):**
```ts
export type TemplateProps = {
  label: string;                                        // page label e.g. "BLOG"
  icon: React.ComponentType<{ size?: number }>;         // Lucide icon
  onNavigate?: (i: number) => void;                    // passed through for any nav links in content
  children: React.ReactNode;                           // content slot — rows, cards, cells
};

// Lookup used by App.tsx scroll container
export const PAGE_TEMPLATES: Record<number, React.ComponentType<TemplateProps>> = {
  0: BlogTemplate,
  1: GamesTemplate,
  2: AnalyticsTemplate,
  3: MusicTemplate,
  4: ShopTemplate,
  5: BlankTemplate,
};
```

---

**Example template — BlogTemplate.tsx (Template 0):**
```tsx
// Template 0: BLOG
// Overlay: bg-background/20 + backdrop-blur-xl — circuit visible, airy feel
// Content container: border-t list, each child is a row
import { GridOverlay } from "../App";
import type { TemplateProps } from "./index";

export function BlogTemplate({ label, icon: Icon, children }: TemplateProps) {
  return (
    <div className="bg-background flex flex-col justify-center pl-16 lg:pl-24 h-full w-full">
      {/* Overlay at z=10 — circuit at z=11 paints above, content at z=20 paints above circuit */}
      <div className="absolute inset-0 bg-background/20 backdrop-blur-xl" style={{ zIndex: 10 }} />
      <GridOverlay />
      <div className="relative z-20">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.4em] text-primary mb-8">
          <Icon size={9} />
          NODE://{label}
        </div>
        <h2 className="font-display font-black uppercase tracking-tight text-foreground mb-12"
          style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}>
          {label}
        </h2>
        {/* Content slot — border-t list container */}
        <div className="max-w-xl border-t border-border">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

**Updated `PAGE_CONFIG` (replaces lines 763–764, moves near top of App.tsx):**
```ts
// Single source of truth. Add one entry here to register a new page everywhere:
// nav, scroll container, page counter, circuit width, and section counter all update automatically.
// template: pick 0–5 from PAGE_TEMPLATES. null = unique layout (HOME only).
type PageConfig = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  component: React.ComponentType<{ onNavigate?: (i: number) => void }>;
  template: number | null;
};

const PAGE_CONFIG: PageConfig[] = [
  { id: "home",      label: "HOME",      icon: Cpu,         component: HomeSection,  template: null },
  { id: "blog",      label: "BLOG",      icon: BookOpen,    component: BlogSection,  template: 0 },
  { id: "games",     label: "GAMES",     icon: Gamepad2,    component: GamesSection, template: 1 },
  { id: "analytics", label: "ANALYTICS", icon: Wrench,      component: ToolsSection, template: 2 },
  { id: "music",     label: "MUSIC",     icon: Music2,      component: MusicSection, template: 3 },
  { id: "shop",      label: "SHOP",      icon: ShoppingBag, component: ShopSection,  template: 4 },
];
```

---

**Exact line-by-line changes to App.tsx:**

**1. Lines 763–764** — remove `PAGES[]` + `PAGE_ICONS[]`, replace with `PAGE_CONFIG` array (moved to top of file, after imports).

**2. Line 17** — derive `NUM_SECTIONS` from config:
```ts
// Before: const NUM_SECTIONS = 6;
// After:  const NUM_SECTIONS = PAGE_CONFIG.length;
// Safe — section functions are hoisted (function declarations), PAGE_CONFIG can reference them from top of file
```

**3. Line 22** — `buildWaypoints` scale uses derived constant:
```ts
// Before: const scale = totalWidth / 6000;
// After:  const scale = totalWidth / (NUM_SECTIONS * 1000);
```

**4. Lines 287–309** — rename `Section` → `SectionShell`, remove `transparent`/`className` props, add `index`/`total`, render counter internally:
```tsx
// Handles scroll snap, overflow, and the side counter — nothing else.
// All layout (padding, overlay, header) lives inside the template.
function SectionShell({ children, index, total }: { children: React.ReactNode; index: number; total: number }) {
  return (
    <div className="relative flex-shrink-0 overflow-hidden"
      style={{ width: "100vw", height: "100vh", scrollSnapAlign: "start" }}>
      {children}
      <div className="absolute top-1/2 right-8 -translate-y-1/2 font-mono text-[9px] text-muted-foreground/40 tracking-widest"
        style={{ writingMode: "vertical-rl" }}>
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </div>
  );
}
```

**5. Lines 327–405 (HomeSection)** — remove outer `<Section>` wrapper + counter div (lines 400–403). HOME renders its own layout inside `SectionShell`. Overlay div (line 333) stays — HOME manages its own.

**6. Lines 408–461 (GamesSection)** — strip to content only:
- Remove `<Section>` wrapper
- Remove counter div (lines 456–459)
- Remove `NODE://GAMES` header div (lines 420–423) — template provides this
- Remove `<h2>GAMES</h2>` (lines 424–429) — template provides this
- Keep: card grid JSX only

**7. Lines 464–527 (MusicSection)** — strip to content only:
- Remove `<Section>` wrapper
- Remove overlay div (line 476)
- Remove counter div (lines 522–525)
- Remove `NODE://MUSIC` header + h2 — template provides
- Keep: list rows JSX only

**8. Lines 530–603 (ToolsSection)** — strip to content only:
- Remove `<Section>` wrapper
- Remove overlay div (line 543)
- Remove counter div (lines 598–601)
- Remove `NODE://ANALYTICS` header + h2 — template provides
- Keep: grid cells JSX only

**9. Lines 606–667 (BlogSection)** — strip to content only:
- Remove `<Section>` wrapper
- Remove overlay div (line 618)
- Remove counter div (lines 662–665)
- Remove `NODE://BLOG` header + h2 — template provides
- Remove `<div className="max-w-xl border-t border-border">` container — template provides
- Keep: post row JSX only

**10. Lines 670–759 (ShopSection)** — strip to content only:
- Remove `<Section>` wrapper
- Remove overlay div (line 701)
- Remove counter div (lines 754–757)
- Remove `NODE://SHOP` header + h2 — template provides
- Keep: product card JSX only

**11. Lines 814–829 (nav map)** — update to `PAGE_CONFIG`:
```tsx
// Before: {PAGES.map((page, i) => { const Icon = PAGE_ICONS[i]; ... {page} })}
// After:  {PAGE_CONFIG.map((page, i) => { ... {page.label} })}
```

**12. Line 834 (counter total)** — dynamic:
```tsx
// Before: {" / 06"}
// After:  {` / ${String(PAGE_CONFIG.length).padStart(2, "0")}`}
```

**13. Lines 848–853 (scroll container)** — render from config:
```tsx
{PAGE_CONFIG.map((page, i) => {
  const Template = page.template !== null ? PAGE_TEMPLATES[page.template] : null;
  return (
    <SectionShell key={page.id} index={i} total={PAGE_CONFIG.length}>
      {Template
        ? <Template label={page.label} icon={page.icon} onNavigate={navigateTo}>
            <page.component onNavigate={navigateTo} />
          </Template>
        : <page.component onNavigate={navigateTo} />  // HOME: renders its own full layout
      }
    </SectionShell>
  );
})}
```

---

**New files to create (7 files):**
- `src/app/templates/index.ts` — `TemplateProps` type + `PAGE_TEMPLATES` lookup
- `src/app/templates/BlogTemplate.tsx` — Template 0
- `src/app/templates/GamesTemplate.tsx` — Template 1
- `src/app/templates/AnalyticsTemplate.tsx` — Template 2
- `src/app/templates/MusicTemplate.tsx` — Template 3
- `src/app/templates/ShopTemplate.tsx` — Template 4
- `src/app/templates/BlankTemplate.tsx` — Template 5

**App.tsx changes:** 13 targeted edits — no logic changes, pure restructuring

---

**Adding a new page after this refactor:**
```ts
// 1. Create src/app/sections/VideosSection.tsx — content rows only (~30 lines)
// 2. Add one line to PAGE_CONFIG:
{ id: "videos", label: "VIDEOS", icon: Play, component: VideosSection, template: 0 }
// Done. Nav, counter, circuit, overlay, header, title — all automatic.
```

---

### 2026-06-16 — Task Group 4: Color Skin System (FloatingPalette UI)
**Status:** 🔲 Planned — implement UI first, wire to auth in Session 4C
**Dependencies:** Auth & Payments system above

**Scope:** FloatingPalette modal with named skins, hue slider, rainbow cycle, master toggle
- Fixed bottom-right `[CUSTOMIZE]` button opens modal
- Top section: 6 named skin swatches (radio buttons, locked until purchased)
- Middle section: hue slider (full spectrum, locked behind `color_wheel` purchase)
- Bottom section: rainbow cycle toggle + speed control (locked behind `rainbow_cycle`)
- Master toggle: on/off reverts to default cyan without losing chosen skin
- `applyHue(hue)` writes to `--primary` on `:root` — entire site recolors via color-mix cascade
- `localStorage` persists chosen skin across sessions (works before auth too for free cyan skin)
- Canvas sync: `MatrixBackground` accepts `primaryColor` prop, re-reads on skin change

---

### 2026-06-15 — Theme Modularization & Circuit Responsive Fix
**Status:** ✅ Complete

**Scope:**
- Replace all hardcoded hex colors in `App.tsx` with CSS custom property references
- Add alpha variant CSS vars to `theme.css` so glow effects also update when color changes
- Fix circuit SVG — hardcoded `width: 6000` breaks on viewports wider than ~1000px
- Result: changing `--primary` in `theme.css` updates the entire site; color slider becomes a one-liner

**Why this matters:**
- `theme.css` already has a full CSS var system (`--primary`, `--background`, etc.) wired to Tailwind utilities
- `App.tsx` ignores it entirely — 28 hardcoded inline color values bypass the theme
- Circuit assumes 6 pages × 1000px = 6000px; on 1440px screens the circuit disappears before section 5

---

**TASK LIST:**

**Task Group 1 — theme.css changes ✅**
- [x] Add `--primary-glow-xs` alpha variant — used for dim base circuit trace (0.07 opacity)
- [x] Add `--primary-glow-sm` alpha variant — used for dot halo fill, junction stroke (0.12–0.25 opacity)
- [x] Add `--primary-glow-md` alpha variant — used for text shadows, glow effects (0.40–0.60 opacity)
- [x] Add `--primary-glow-lg` alpha variant — used for bright halos, hairline glow (0.70–0.80 opacity)
- [x] Add `--primary-glow-border` — nav bottom border (0.08 opacity)
- [x] Add `--bg-nav` — nav backdrop (background at 85% opacity)
- [x] Used `color-mix(in srgb, var(--primary) X%, transparent)` — all alpha vars auto-update when primary changes

**Task Group 2 — App.tsx color replacements ✅**
- [x] Lines 44–53 — matrix rain bright chars: read `--primary` via `getComputedStyle` on mount; dim trailing chars noted for Task Group 4 canvas sync
- [x] Line 190 — circuit base trace stroke → `var(--primary-glow-xs)`
- [x] Line 199 — circuit lit trail stroke → `var(--primary)`
- [x] Line 215 — junction pad fill → `var(--background)`
- [x] Line 216 — junction pad stroke → `var(--primary-glow-sm)`
- [x] Lines 224, 225, 226 — resistor lines + rect → `var(--primary-glow-sm)` / `var(--background)`
- [x] Line 236 — dot glow halo fill → `var(--primary-glow-sm)`
- [x] Line 246 — signal dot fill → `var(--primary)`
- [x] Line 287 — grid overlay gradient → `var(--primary-glow-md)`
- [x] Line 306 — home Zap drop-shadow → `var(--primary)`
- [x] Lines 321–322 — NODE heading color + textShadow → `var(--primary)` / `var(--primary-glow-md)` / `var(--primary-glow-xs)`
- [x] Lines 332–333 — hairline background + boxShadow → `var(--primary)` / `var(--primary-glow-lg)`
- [x] Line 416 — games card progress bar boxShadow → `var(--primary-glow-md)`
- [x] Lines 544–555 — analytics score color, textShadow, bar background, boxShadow → `var(--primary)` / `var(--primary-glow-sm)` / `var(--primary-glow-md)`
- [x] Line 707 — shop price color → `var(--primary)`
- [x] Lines 767–768 — nav borderBottom + background → `var(--primary-glow-border)` / `var(--bg-nav)`
- [x] Lines 775–777 — nav logo color, textShadow, Zap drop-shadow → `var(--primary)` / `var(--primary-glow-md)`
- [x] Lines 789–792 — nav active page color + arrow → `var(--primary)` / `var(--muted-foreground)`
- [x] Lines 800–801 — nav counter inactive + active → `var(--muted-foreground)` / `var(--primary)`

**App.tsx circuit responsive fix**
- [ ] Lines 16–27 — replace static `WAYPOINTS` array with a `buildWaypoints(totalWidth)` function that scales all x-coordinates proportionally: `x * (totalWidth / 6000)`
- [ ] Add `useState` for `totalWidth` initialized to `window.innerWidth * 6` (num sections)
- [ ] Add `useEffect` with `resize` listener that updates `totalWidth` on viewport change — triggers waypoint recalculation
- [ ] Line 156 — `width: 6000` → `width: totalWidth` (SVG container div)
- [ ] Line 164 — `width={6000}` → `width={totalWidth}` (SVG element)
- [ ] Line 166 — `viewBox="0 0 6000 900"` → `viewBox={\`0 0 ${totalWidth} 900\`}` (SVG viewBox)
- [ ] Resistor positions (line 222) — currently `[500, 1350, 2250, 3100, 3970, 4900]` (hardcoded for 6000px) → compute as evenly spaced fractions of `totalWidth`
- [ ] Note: `pathRef.current.getTotalLength()` recalculates automatically when path `d` changes — no extra work needed there

**App.tsx circuit z-index fix ✅**
- [x] Final z-index hierarchy: MatrixBackground(0) → Section bg overlays(10) → CircuitOverlay(11) → Content wrappers(20) → Nav(50)
- [x] Section bg overlays raised to z=10 so circuit at z=11 paints above them and stays visible
- [x] Music rows: `bg-background/60 backdrop-blur-sm` — less transparent, less blur, denser feel
- [x] Blog rows: `bg-background/20 backdrop-blur-xl` — more transparent, more blur, airy feel
- [x] Games cards unchanged (`bg-background/40 backdrop-blur-md`) — midpoint reference
- [x] Each page now has distinct visual weight: Blog (lightest) → Games (middle) → Music (heaviest)

---

**Code to be added to `theme.css` (after existing `:root` block, ~10 lines):**
```css
/* ── Glow alpha variants ───────────────────────────────────────────────────
   Derived from --primary using color-mix so they update automatically
   when --primary changes (e.g. via a color slider).
   Opacity levels: xs=7%, sm=20%, md=45%, lg=80% */
--primary-glow-xs:     color-mix(in srgb, var(--primary)  7%, transparent);
--primary-glow-sm:     color-mix(in srgb, var(--primary) 20%, transparent);
--primary-glow-md:     color-mix(in srgb, var(--primary) 45%, transparent);
--primary-glow-lg:     color-mix(in srgb, var(--primary) 80%, transparent);
--primary-glow-border: color-mix(in srgb, var(--primary)  8%, transparent);
/* Nav uses background at 85% opacity — matches --background token */
--bg-nav: color-mix(in srgb, var(--background) 85%, transparent);
```

**buildWaypoints function to replace static WAYPOINTS (lines 16–27):**
```ts
// Generates circuit path waypoints scaled to the actual total scroll width.
// Called on mount and on window resize so the circuit always covers all sections.
function buildWaypoints(totalWidth: number): [number, number][] {
  // Scale factor: original waypoints were designed for 6000px (6 sections × ~1000px)
  const scale = totalWidth / 6000;
  const raw: [number, number][] = [
    [0, 720], [120, 720], [120, 640], [300, 640], [300, 760], [480, 760], [480, 680],
    [800, 680], [800, 580], [1000, 580], [1000, 720], [1200, 720], [1200, 640],
    [1520, 640], [1520, 760], [1720, 760], [1720, 620], [1940, 620], [1940, 700],
    [2140, 700], [2140, 560], [2360, 560], [2360, 680], [2580, 680], [2580, 760],
    [2780, 760], [2780, 620], [3000, 620], [3000, 700], [3200, 700], [3200, 560],
    [3440, 560], [3440, 720], [3680, 720], [3680, 640], [3900, 640], [3900, 760],
    [4120, 760], [4120, 600], [4340, 600], [4340, 720], [4580, 720], [4580, 640],
    [4820, 640], [4820, 760], [5040, 760], [5040, 620], [5280, 620], [5280, 700],
    [5520, 700], [5520, 640], [5720, 640], [5720, 760], [5900, 760], [5900, 680],
    [6000, 680],
  ];
  // Multiply only the x coordinate — y values (vertical rhythm) stay the same
  return raw.map(([x, y]) => [Math.round(x * scale), y]);
}
```

---

**Decisions:**
- `color-mix(in srgb, ...)` chosen over `oklch(from ...)` relative color syntax — broader browser support in 2026, clearer intent for future devs reading the code
- Canvas (MatrixBackground) can't read CSS vars directly — use `getComputedStyle(document.documentElement).getPropertyValue('--primary')` on mount to pull the hex for canvas drawing
- Waypoints scale only on the x-axis — y values control vertical rhythm and look best at a fixed height regardless of viewport width
- Resistor positions computed as `[1/12, 3/12, 5/12, 7/12, 9/12, 11/12]` of `totalWidth` — evenly spaced through the circuit

---

**Task Group 4 — Color Skin System (FloatingPalette component)**
- [ ] Create `src/app/FloatingPalette.tsx` — new file, ~60 lines
- [ ] Define `SKINS` config array — each skin is `{ id, label, hue }` where hue is an oklch hue angle (0–360)
  ```ts
  // Named color skins — hue angle in oklch color space
  // oklch keeps perceived brightness consistent across hues (unlike hsl)
  const SKINS = [
    { id: "cyan",    label: "CYAN",    hue: 200 }, // default — free
    { id: "purple",  label: "PURPLE",  hue: 290 },
    { id: "gold",    label: "GOLD",    hue: 80  },
    { id: "crimson", label: "CRIMSON", hue: 20  },
    { id: "green",   label: "GREEN",   hue: 140 },
  ];
  ```
- [ ] `applyHue(hue: number)` function — single call that updates `--primary` on `:root`
  ```ts
  // Updates the site-wide primary color by writing to the CSS custom property.
  // color-mix vars in theme.css automatically derive from this — no other changes needed.
  function applyHue(hue: number) {
    document.documentElement.style.setProperty(
      '--primary',
      `oklch(0.7 0.22 ${hue})`  // 0.7 lightness + 0.22 chroma matches original cyan energy
    );
  }
  ```
- [ ] `syncCanvas(hue: number)` callback prop — passed to `MatrixBackground` so canvas re-reads color on skin change
  - Canvas draws at 60fps and can't read CSS vars mid-loop — store resolved color in a ref, update it when skin changes
  - `MatrixBackground` accepts optional `primaryColor` prop (hex string), falls back to `#00d4ff` if not provided
- [ ] `FloatingPalette` component — fixed position button (bottom-right corner, above circuit at z=30)
  - Collapsed state: small `[COLOR]` button in monospace style matching site aesthetic
  - Expanded state: row of skin swatches, each a small colored square with label beneath
  - Active skin gets a border highlight
  - Hue slider below swatches — `<input type="range" min={0} max={360}>` for full spectrum control
  - Free skin (cyan) always available; other skins show `[LOCKED]` label (placeholder for future auth gating)
- [ ] Persist chosen skin to `localStorage` under key `st_skin` — read on mount so choice survives page refresh
- [ ] Wire `FloatingPalette` into `App.tsx` — rendered after `<CircuitOverlay />`, before nav
- [ ] Pass `onColorChange` callback from `App` → `FloatingPalette` → `MatrixBackground` to keep canvas in sync

**Task Group 4 — Code outline for `FloatingPalette.tsx`:**
```tsx
// FloatingPalette.tsx
// Fixed bottom-right color skin selector.
// Free tier: cyan only. Paid tier: full palette + hue slider (gating not yet wired).
// Reads/writes localStorage key 'st_skin' so the chosen color persists across sessions.

import { useState, useEffect } from "react";

const SKINS = [
  { id: "cyan",    label: "CYAN",    hue: 200 },
  { id: "purple",  label: "PURPLE",  hue: 290 },
  { id: "gold",    label: "GOLD",    hue: 80  },
  { id: "crimson", label: "CRIMSON", hue: 20  },
  { id: "green",   label: "GREEN",   hue: 140 },
];

// Writes the chosen hue to --primary; color-mix vars in theme.css cascade automatically
function applyHue(hue: number) {
  document.documentElement.style.setProperty('--primary', `oklch(0.7 0.22 ${hue})`);
}

export function FloatingPalette({ onColorChange }: { onColorChange?: (hue: number) => void }) {
  const [open, setOpen] = useState(false);
  const [activeSkin, setActiveSkin] = useState("cyan");
  const [hue, setHue] = useState(200);

  // Restore saved skin on first load
  useEffect(() => {
    const saved = localStorage.getItem('st_skin');
    const skin = SKINS.find(s => s.id === saved) ?? SKINS[0];
    setActiveSkin(skin.id);
    setHue(skin.hue);
    applyHue(skin.hue);
    onColorChange?.(skin.hue);
  }, []);

  function selectSkin(skin: typeof SKINS[0]) {
    setActiveSkin(skin.id);
    setHue(skin.hue);
    applyHue(skin.hue);
    onColorChange?.(skin.hue);
    localStorage.setItem('st_skin', skin.id);
  }

  function onSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const h = Number(e.target.value);
    setHue(h);
    applyHue(h);
    onColorChange?.(h);
    // Slider choice doesn't map to a named skin — clear active preset
    setActiveSkin("");
  }

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 30 }}>
      {/* Collapsed toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="font-mono text-[9px] tracking-widest border px-2 py-1"
        style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
      >
        [COLOR]
      </button>

      {open && (
        <div
          className="absolute bottom-8 right-0 border p-3 flex flex-col gap-3"
          style={{ background: "var(--background)", borderColor: "var(--primary-glow-sm)", minWidth: 160 }}
        >
          {/* Named skin swatches */}
          <div className="flex gap-2">
            {SKINS.map(skin => (
              <button key={skin.id} onClick={() => selectSkin(skin)} className="flex flex-col items-center gap-1">
                <div
                  style={{
                    width: 16, height: 16,
                    background: `oklch(0.7 0.22 ${skin.hue})`,
                    outline: activeSkin === skin.id ? "1px solid var(--primary)" : "none",
                    outlineOffset: 2,
                  }}
                />
                <span className="font-mono text-[8px]" style={{ color: "var(--muted-foreground)" }}>
                  {skin.label}
                </span>
              </button>
            ))}
          </div>

          {/* Full hue slider */}
          <input type="range" min={0} max={360} value={hue} onChange={onSlider}
            style={{ accentColor: "var(--primary)", width: "100%" }} />
          <span className="font-mono text-[8px]" style={{ color: "var(--muted-foreground)" }}>
            HUE {hue}°
          </span>
        </div>
      )}
    </div>
  );
}
```

**Task Group 4 — MatrixBackground canvas sync (~5 line change):**
```tsx
// MatrixBackground accepts an optional primaryColor so the canvas
// re-reads the correct hex whenever the user switches skins.
// Without this, the matrix stays cyan even after a color change
// because canvas can't read CSS vars during the draw loop.
function MatrixBackground({ primaryColor = "#00d4ff" }: { primaryColor?: string }) {
  // ...existing canvas setup...
  // Replace hardcoded "#00ffee" and rgba(0,212,255,...) with primaryColor
}
```

**Task Group 4 — Files affected:**
- `src/app/FloatingPalette.tsx` — new file, ~65 lines
- `src/app/App.tsx` — wire FloatingPalette + pass primaryColor to MatrixBackground (~10 lines)
- `src/app/App.tsx` — MatrixBackground signature update (~5 lines)

---

**Files Affected:**
- `src/styles/theme.css` — 10 lines added to `:root`
- `src/app/App.tsx` — 28 color replacements, circuit refactor (~15 line change, no new files)
- `src/app/FloatingPalette.tsx` — new file ~65 lines (Task Group 4)

---

### 2026-06-15 — Page Reorder, Navigation & Circuit Line Redesign
**Status:** ✅ Complete — Session 3

**Completed:**
- [x] Reordered pages: HOME → BLOG → GAMES → ANALYTICS → MUSIC → SHOP
- [x] Renamed TOOLS → ANALYTICS
- [x] Updated nav links and PAGES/PAGE_ICONS arrays to match new order
- [x] Circuit SVG responsive fix — dynamic width scales to viewport

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
