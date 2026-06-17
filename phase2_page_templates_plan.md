# Phase 2: Page Modularity + Template System
> Standing Tiger Blog — Horizontal Scroll Refactor
> Created: 2026-06-16 | Status: Planning — Approved, ready to implement

---

## Goal

Adding a new page = one entry in `PAGE_CONFIG` + a content component.
Every template is pre-tested — overlay, circuit visibility, header, title, content container all come for free.

---

## Architecture Overview

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

## 6 Page Templates

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

## New File Structure

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

## TemplateProps Type — `src/app/templates/index.ts`

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

## Example Template — BlogTemplate.tsx (Template 0)

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

## Updated PAGE_CONFIG — replaces lines 763–764 in App.tsx

```ts
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

Move to top of App.tsx, after imports. Safe — section functions are hoisted (function declarations).

---

## App.tsx — Exact Line-by-Line Changes (13 edits)

### Edit 1 — Line 17: Derive NUM_SECTIONS from config
```ts
// Before: const NUM_SECTIONS = 6;
// After:
const NUM_SECTIONS = PAGE_CONFIG.length;
```

### Edit 2 — Line 22: Scale buildWaypoints from config length
```ts
// Before: const scale = totalWidth / 6000;
// After:
const scale = totalWidth / (NUM_SECTIONS * 1000);
```

### Edit 3 — Lines 287–309: Replace Section with SectionShell
```tsx
// Rename Section → SectionShell
// Remove transparent + className props
// Add index + total props
// Render counter internally (was hardcoded per section)
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

### Edit 4 — Lines 327–405 (HomeSection): Update wrapper
- Replace `<Section className="...">` with `<div className="...h-full w-full">` (SectionShell wraps it now)
- Remove counter div (lines 400–403) — SectionShell renders it
- Keep overlay div (line 333) — HOME manages its own overlay

### Edit 5 — Lines 408–461 (GamesSection): Strip to content only
- Remove `<Section transparent ...>` wrapper
- Remove counter div (lines 456–459)
- Remove `NODE://GAMES` header div (lines 420–423) — template provides
- Remove `<h2>GAMES</h2>` (lines 424–429) — template provides
- Keep: card grid JSX only

### Edit 6 — Lines 464–527 (MusicSection): Strip to content only
- Remove `<Section ...>` wrapper
- Remove overlay div (line 476) — template provides
- Remove counter div (lines 522–525)
- Remove `NODE://MUSIC` header + h2 — template provides
- Keep: list rows JSX only

### Edit 7 — Lines 530–603 (ToolsSection): Strip to content only
- Remove `<Section ...>` wrapper
- Remove overlay div (line 543) — template provides
- Remove counter div (lines 598–601)
- Remove `NODE://ANALYTICS` header + h2 — template provides
- Keep: grid cells JSX only

### Edit 8 — Lines 606–667 (BlogSection): Strip to content only
- Remove `<Section ...>` wrapper
- Remove overlay div (line 618) — template provides
- Remove counter div (lines 662–665)
- Remove `NODE://BLOG` header + h2 — template provides
- Remove `<div className="max-w-xl border-t border-border">` — template provides
- Keep: post row JSX only

### Edit 9 — Lines 670–759 (ShopSection): Strip to content only
- Remove `<Section ...>` wrapper
- Remove overlay div (line 701) — template provides
- Remove counter div (lines 754–757)
- Remove `NODE://SHOP` header + h2 — template provides
- Keep: product card JSX only

### Edit 10 — Lines 763–764: Remove PAGES[] + PAGE_ICONS[], add PAGE_CONFIG import
```ts
// Delete: const PAGES = [...]; const PAGE_ICONS = [...];
// PAGE_CONFIG is defined at top of file
```

### Edit 11 — Lines 814–829 (nav map): Update to PAGE_CONFIG
```tsx
// Before: {PAGES.map((page, i) => { const Icon = PAGE_ICONS[i]; ... {page} })}
// After:
{PAGE_CONFIG.map((page, i) => {
  const Icon = page.icon;
  return (
    <button key={page.id} onClick={() => navigateTo(i)} ...>
      {active === i && <span ...>▸</span>}
      {page.label}
    </button>
  );
})}
```

### Edit 12 — Line 834 (counter total): Dynamic
```tsx
// Before: {" / 06"}
// After:
{` / ${String(PAGE_CONFIG.length).padStart(2, "0")}`}
```

### Edit 13 — Lines 848–853 (scroll container): Render from config
```tsx
{PAGE_CONFIG.map((page, i) => {
  const Template = page.template !== null ? PAGE_TEMPLATES[page.template] : null;
  return (
    <SectionShell key={page.id} index={i} total={PAGE_CONFIG.length}>
      {Template
        ? <Template label={page.label} icon={page.icon} onNavigate={navigateTo}>
            <page.component onNavigate={navigateTo} />
          </Template>
        : <page.component onNavigate={navigateTo} />
      }
    </SectionShell>
  );
})}
```

---

## Adding a New Page After This Refactor

```ts
// 1. Create src/app/sections/VideosSection.tsx — content rows only (~30 lines)
// 2. Add one line to PAGE_CONFIG:
{ id: "videos", label: "VIDEOS", icon: Play, component: VideosSection, template: 0 }
// Done. Nav, counter, circuit, overlay, header, title — all automatic.
```

---

## Task List

- [ ] Create `src/app/templates/index.ts` — TemplateProps type + PAGE_TEMPLATES lookup
- [ ] Create `src/app/templates/BlogTemplate.tsx` — Template 0
- [ ] Create `src/app/templates/GamesTemplate.tsx` — Template 1
- [ ] Create `src/app/templates/AnalyticsTemplate.tsx` — Template 2
- [ ] Create `src/app/templates/MusicTemplate.tsx` — Template 3
- [ ] Create `src/app/templates/ShopTemplate.tsx` — Template 4
- [ ] Create `src/app/templates/BlankTemplate.tsx` — Template 5
- [ ] Edit `src/app/App.tsx` — 13 targeted edits (no logic changes, pure restructuring)

---

## Decisions

- `color-mix(in srgb, ...)` for alpha variants — broader browser support than `oklch(from ...)` relative color syntax
- `PAGE_CONFIG` defined before `buildWaypoints` in file — safe because section functions are hoisted
- `NUM_SECTIONS` derived from `PAGE_CONFIG.length` — stays correct automatically as pages are added/removed
- Templates as full layout skeletons (not just visual treatment) — prevents aesthetic drift when adding new pages
- HOME = `template: null` — unique hero layout doesn't fit any template; renders full layout inside SectionShell

---

*Last updated: 2026-06-16*
