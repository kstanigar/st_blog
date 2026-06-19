# Accordion Routing Plan
> Standing Tiger Blog — Card-to-Accordion Route Navigation
> Created: 2026-06-16 | Status: Planning

---

## Overview

Clicking any card/tile on the horizontal scroll site navigates to a dedicated route (`/blog`, `/games`, etc.).
Each route renders a full-page vertical accordion list. The clicked item auto-opens via URL hash.
Back button returns to `/` (the horizontal scroll site).

## User Flow

```
1. User scrolls to BLOG section → sees 5 post preview rows
2. Clicks "ECS vs OOP" row → browser navigates to /blog#ecs-vs-oop
3. BlogPage loads — vertical list of 5 accordion items
4. "ECS vs OOP" item auto-opens (hash match on defaultValue)
5. User reads, clicks ← STANDING TIGER → returns to /
```

---

## Dependencies (both already installed — no new packages)

- `react-router-dom` v7 — already in `package.json`
- `@radix-ui/react-accordion` v1.2.3 — already in `package.json`

---

## File Structure

**New files (8):**
```
src/
├── lib/
│   └── utils.ts                  — slug() utility function
├── components/
│   ├── SiteAccordion.tsx         — Radix-based styled accordion (monospace aesthetic)
│   └── AccordionPage.tsx         — shared page layout: nav bar + MatrixBackground + accordion list
└── pages/
    ├── BlogPage.tsx              — /blog route
    ├── GamesPage.tsx             — /games route
    ├── AnalyticsPage.tsx         — /analytics route
    ├── MusicPage.tsx             — /music route
    └── ShopPage.tsx              — /shop route
```

**Modified files (2):**
```
src/main.tsx        — add BrowserRouter + Routes (full replacement, 6 lines → ~22 lines)
src/app/App.tsx     — add onClick to cards + useNavigate (14 targeted edits)
```

---

## Accordion Item Visual Design

```
01  WEBGPU COMPUTE PIPELINES IN REAL GAMES                   [+]
─────────────────────────────────────────────────────────────────
02  ECS VS OOP: A 500K ENTITY BENCHMARK                      [−]
─────────────────────────────────────────────────────────────────
    2026-06-07  ·  ARCH  ·  8 min read

    Full article content here. Paragraphs, code blocks,
    images, links — whatever the post contains.

    [READ MORE →]
─────────────────────────────────────────────────────────────────
03  DUCKDB FOR REAL-TIME GAME ANALYTICS                      [+]
─────────────────────────────────────────────────────────────────
```

Accordion page nav bar:
```
← STANDING TIGER    NODE://BLOG    05 ITEMS
```

---

## Slug Utility — `src/lib/utils.ts`

```ts
export function slug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
```

---

## main.tsx — Full Replacement

Current: 6 lines. New: ~22 lines.

```tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./app/App.tsx";
import BlogPage from "./pages/BlogPage.tsx";
import GamesPage from "./pages/GamesPage.tsx";
import AnalyticsPage from "./pages/AnalyticsPage.tsx";
import MusicPage from "./pages/MusicPage.tsx";
import ShopPage from "./pages/ShopPage.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/games" element={<GamesPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/music" element={<MusicPage />} />
      <Route path="/shop" element={<ShopPage />} />
    </Routes>
  </BrowserRouter>
);
```

---

## App.tsx — 14 Targeted Edits

### Edit 1 — Add router import (after line 13, after lucide imports)
```ts
import { useNavigate } from "react-router-dom";
import { slug } from "../lib/utils";
```

### Edit 2 — GamesSection signature (line 409)
```tsx
// Before: function GamesSection() {
// After:
function GamesSection({ onCardClick }: { onCardClick: (path: string) => void }) {
```

### Edit 3 — GamesSection card div (line 433)
```tsx
// Before: className="border border-primary/15 bg-background/40 backdrop-blur-md p-5 cursor-pointer group hover:border-primary/50 hover:bg-background/60 transition-all"
// After: add onClick:
onClick={() => onCardClick('/games#' + slug(a.title))}
```

### Edit 4 — BlogSection signature (line 607)
```tsx
// Before: function BlogSection() {
// After:
function BlogSection({ onCardClick }: { onCardClick: (path: string) => void }) {
```

### Edit 5 — BlogSection post div (line 635)
```tsx
// Before: className="flex gap-5 items-start py-5 border-b border-border bg-background/20 backdrop-blur-xl hover:border-primary/30 cursor-pointer group transition-colors"
// After: add onClick:
onClick={() => onCardClick('/blog#' + slug(p.title))}
```

### Edit 6 — MusicSection signature (line 465)
```tsx
// Before: function MusicSection() {
// After:
function MusicSection({ onCardClick }: { onCardClick: (path: string) => void }) {
```

### Edit 7 — MusicSection row div (line 493)
```tsx
// Before: className="flex items-center gap-5 py-4 border-b border-border bg-background/60 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 cursor-pointer group transition-all px-1"
// After: add onClick:
onClick={() => onCardClick('/music#' + slug(t.name))}
```

### Edit 8 — ToolsSection signature (line 531)
```tsx
// Before: function ToolsSection() {
// After:
function ToolsSection({ onCardClick }: { onCardClick: (path: string) => void }) {
```

### Edit 9 — ToolsSection card div (line 563)
```tsx
// Before: className="p-5 border-r border-b border-border bg-card hover:bg-primary/5 cursor-pointer group transition-colors"
// After: add onClick:
onClick={() => onCardClick('/analytics#' + slug(t.name))}
```

### Edit 10 — ShopSection signature (line 671)
```tsx
// Before: function ShopSection() {
// After:
function ShopSection({ onCardClick }: { onCardClick: (path: string) => void }) {
```

### Edit 11 — ShopSection product div (line 719)
```tsx
// Before: className="border border-border bg-card p-5 w-44 flex flex-col hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
// After: add onClick:
onClick={() => onCardClick('/shop#' + slug(p.name))}
```

### Edit 12 — App component: add useNavigate (line 768, after useState)
```tsx
// After: const [active, setActive] = useState(0);
// Add:
const navigate = useNavigate();
```

### Edit 13 — Pass onCardClick to BlogSection (line 849)
```tsx
// Before: <BlogSection />
// After:  <BlogSection onCardClick={navigate} />
```

### Edit 14 — Pass onCardClick to GamesSection, ToolsSection, MusicSection, ShopSection (lines 850–853)
```tsx
// Before: <GamesSection />  <ToolsSection />  <MusicSection />  <ShopSection />
// After:
<GamesSection onCardClick={navigate} />
<ToolsSection onCardClick={navigate} />
<MusicSection onCardClick={navigate} />
<ShopSection onCardClick={navigate} />
```

---

## SiteAccordion.tsx — Radix Accordion Component

Uses Radix UI primitives directly (no shadcn wrapper needed).

```tsx
// src/components/SiteAccordion.tsx
import * as Accordion from "@radix-ui/react-accordion";

export type AccordionItemData = {
  id: string;
  index: number;
  label: string;
  content: React.ReactNode;
};

export function SiteAccordion({
  items,
  defaultOpen,
}: {
  items: AccordionItemData[];
  defaultOpen?: string;
}) {
  return (
    <Accordion.Root
      type="single"
      collapsible
      defaultValue={defaultOpen}
      className="w-full max-w-3xl"
    >
      {items.map((item) => (
        <Accordion.Item key={item.id} value={item.id} className="border-t border-border">
          <Accordion.Trigger className="w-full flex items-center gap-4 py-5 font-mono text-xs text-left group hover:text-primary transition-colors">
            <span className="text-muted-foreground/50 tabular-nums w-6 shrink-0">
              {String(item.index).padStart(2, "0")}
            </span>
            <span className="flex-1 font-display font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-wide">
              {item.label}
            </span>
            <span
              className="font-mono text-[9px] tracking-widest shrink-0"
              style={{ color: "var(--primary)" }}
            >
              {/* Radix adds data-state="open"/"closed" — use CSS to toggle [+]/[−] */}
              <span className="group-data-[state=closed]:inline hidden">[+]</span>
              <span className="group-data-[state=open]:inline hidden">[−]</span>
            </span>
          </Accordion.Trigger>
          <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="pb-8 pl-10 pr-4 font-mono text-xs text-muted-foreground leading-relaxed">
              {item.content}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
      {/* Closing border on last item */}
      <div className="border-t border-border" />
    </Accordion.Root>
  );
}
```

**Note:** Tailwind animate-accordion-down/up requires adding keyframes to `theme.css` or `tailwind.config`:
```css
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}
@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}
```

---

## AccordionPage.tsx — Shared Page Layout

```tsx
// src/components/AccordionPage.tsx
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Zap } from "lucide-react";
import { SiteAccordion, type AccordionItemData } from "./SiteAccordion";

type AccordionPageProps = {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  items: AccordionItemData[];
  defaultOpen?: string;
};

export function AccordionPage({ title, icon: Icon, items, defaultOpen }: AccordionPageProps) {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen bg-background">
      {/* Shared background — same aesthetic as main site */}
      {/* MatrixBackground removed here for performance; can add back if desired */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(var(--primary-glow-md) 1px, transparent 1px), linear-gradient(90deg, var(--primary-glow-md) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.03,
        }}
      />

      {/* Nav bar */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ borderBottom: "1px solid var(--primary-glow-border)", background: "var(--bg-nav)", backdropFilter: "blur(12px)" }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-mono text-[9px] tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={10} />
          STANDING TIGER
        </button>

        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.4em]" style={{ color: "var(--primary)" }}>
          <Icon size={9} />
          NODE://{title}
        </div>

        <div className="font-mono text-[9px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>
          {String(items.length).padStart(2, "0")} ITEMS
        </div>
      </nav>

      {/* Page header */}
      <div className="px-16 lg:px-24 pt-16 pb-12">
        <h1
          className="font-display font-black uppercase tracking-tight text-foreground"
          style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
        >
          {title}
        </h1>
      </div>

      {/* Accordion list */}
      <div className="px-16 lg:px-24 pb-24">
        <SiteAccordion items={items} defaultOpen={defaultOpen} />
      </div>
    </div>
  );
}
```

---

## Page Component Pattern (example: BlogPage.tsx)

```tsx
// src/pages/BlogPage.tsx
import { useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { AccordionPage } from "../components/AccordionPage";
import { slug } from "../lib/utils";

const POSTS = [
  {
    title: "WebGPU Compute Pipelines in Real Games",
    date: "2026-06-10", tag: "GPU", mins: 14,
    content: "Full post content will go here...",
  },
  {
    title: "ECS vs OOP: A 500K Entity Benchmark",
    date: "2026-06-07", tag: "ARCH", mins: 8,
    content: "Full post content will go here...",
  },
  {
    title: "DuckDB for Real-Time Game Analytics",
    date: "2026-06-03", tag: "DATA", mins: 15,
    content: "Full post content will go here...",
  },
  {
    title: "Building a WASM Plugin System in Rust",
    date: "2026-05-28", tag: "WASM", mins: 10,
    content: "Full post content will go here...",
  },
  {
    title: "Procedural Audio with SuperCollider + OSC",
    date: "2026-05-20", tag: "AUDIO", mins: 12,
    content: "Full post content will go here...",
  },
];

export default function BlogPage() {
  const { hash } = useLocation();
  const defaultOpen = hash.slice(1) || undefined;

  const items = POSTS.map((p, i) => ({
    id: slug(p.title),
    index: i + 1,
    label: p.title,
    content: (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 text-[9px] tracking-widest mb-2">
          <span>{p.date}</span>
          <span style={{ color: "var(--primary)" }}>{p.tag}</span>
          <span>{p.mins} min read</span>
        </div>
        <p>{p.content}</p>
      </div>
    ),
  }));

  return <AccordionPage title="BLOG" icon={BookOpen} items={items} defaultOpen={defaultOpen} />;
}
```

Same pattern for GamesPage, AnalyticsPage, MusicPage, ShopPage — only data and icon differ.

---

## Task List

- [ ] Create `src/lib/utils.ts` — slug() utility
- [ ] Create `src/components/SiteAccordion.tsx` — Radix accordion styled component
- [ ] Create `src/components/AccordionPage.tsx` — shared page layout
- [ ] Create `src/pages/BlogPage.tsx`
- [ ] Create `src/pages/GamesPage.tsx`
- [ ] Create `src/pages/AnalyticsPage.tsx`
- [ ] Create `src/pages/MusicPage.tsx`
- [ ] Create `src/pages/ShopPage.tsx`
- [ ] Add accordion keyframe animations to `src/styles/theme.css`
- [ ] Edit `src/main.tsx` — full replacement with BrowserRouter + Routes
- [ ] Edit `src/app/App.tsx` — 14 targeted edits (imports, props, onClick, navigate)

---

## Estimated Effort

1 session. New files + App.tsx edits are self-contained. No changes to horizontal scroll behavior.

---

## Decisions

- **Radix directly over shadcn wrapper** — `@radix-ui/react-accordion` is installed; shadcn wrapper isn't scaffolded. Building directly gives full control over monospace aesthetic.
- **Hash-based auto-open** — `/blog#post-slug` deeplinks work natively. Radix Accordion `defaultValue` accepts the item's `value` string directly.
- **Back nav always goes to `/`** — `navigate('/')` instead of `navigate(-1)` so external deeplinks don't leave users stranded.
- **Data duplicated in page components for now** — placeholder content anyway. Will move to CMS/DB in a future session when real content exists.
- **No MatrixBackground on accordion pages** — performance consideration for content-heavy scrolling pages; grid overlay provides visual consistency without canvas overhead.

---

*Last updated: 2026-06-16*
