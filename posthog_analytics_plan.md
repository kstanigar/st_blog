# PostHog Analytics Plan — st_blog

**Created:** 2026-06-19
**Status:** 🟡 In Progress — wizard installed, fixes applied 2026-06-19

---

## 2026-06-19 — Wizard Install + Fixes Applied

**PostHog wizard ran automatically and installed the SDK.** Research conducted on 3 gaps. Findings:

### Fix 1: `.env` → `.env.local`
- Wizard created `.env` — gitignored in this project so not a security risk
- `.env.local` is the correct convention for per-developer local secrets
- Wizard used `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN` — `PUBLIC` is not a Vite standard, just PostHog naming; works fine
- **Action:** Moved key to `.env.local`, created `.env.example` template

### Fix 2: `capture_pageview` — no change needed ✅
- Wizard added `defaults: '2026-01-30'` which automatically sets `capture_pageview: 'history_change'`
- This hooks into the browser history API and handles SPA route changes natively
- The old `capture_pageview: false` + manual `useEffect` pattern is obsolete in 2026
- **Action:** None — wizard's init is correct

### Fix 3: Event names — spaces not underscores
- PostHog officially recommends `[object] [verb]` with **spaces** (e.g. `"section navigated"`)
- Wizard used underscores (`section_navigated`) — technically works but inconsistent with PostHog docs
- **Action:** Renamed all wizard events to use spaces across `App.tsx`, `SiteAccordion.tsx`, `ShopPage.tsx`

### Wizard event name mapping
| Wizard (underscore) | Corrected (spaces) |
|---|---|
| `section_navigated` | `section navigated` |
| `card_clicked` | `card clicked` |
| `accordion_item_opened` | `accordion expanded` |
| `product_viewed` | `product viewed` |
| `back_to_home_clicked` | `back to home clicked` |

### Post-wizard build fix
- `pnpm-workspace.yaml` — wizard left `core-js: set this to true or false` placeholder
- Set to `false` — core-js build script carries supply-chain risk (telemetry history); only static polyfill files are needed, not the build script
- Source: pnpm `allowBuilds` docs — only approve after reviewing script code

---

## Overview

PostHog free tier (1M events/mo) via React SDK. No cookies by default — uses localStorage persistence, which avoids GDPR cookie banner requirements. User identity wired to Supabase user ID after auth.

**Does analytics need to be baked into page templates?** No. PostHog initializes once in `main.tsx` and auto-tracks route changes. Templates stay clean. Only purchase/auth events need manual capture at call sites.

---

## Package & Environment Setup

### Install
```bash
pnpm add posthog-js @posthog/react
```

### Environment variables
Create `.env.local` (gitignored — never commit this):
```
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

Create `.env.example` (commit this as a template):
```
VITE_POSTHOG_KEY=your_posthog_project_api_key
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

**Security note:** PostHog project API keys are intentionally public (client-side only). They can only ingest events — they cannot read data. Safe to expose via Vite's `import.meta.env`. Never use the personal API key (read access) client-side.

---

## Initialization

**File:** `src/main.tsx` — wrap app with PostHogProvider

```tsx
import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,

  // Privacy config — localStorage only, no cookies
  persistence: 'localStorage',
  disable_persistence: false,

  // Disable session recording until explicitly needed
  disable_session_recording: true,

  // Disable surveys (not using this feature)
  disable_surveys: true,

  // Secure cookie fallback if cookies are ever enabled
  secure_cookie: true,

  // Page view auto-capture — disable for SPA (manual via React Router)
  capture_pageview: false,
})

createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <PostHogProvider client={posthog}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/music" element={<MusicPage />} />
        <Route path="/shop" element={<ShopPage />} />
      </Routes>
    </PostHogProvider>
  </BrowserRouter>
)
```

**Why `capture_pageview: false`?** PostHog's auto pageview fires once on init, not on SPA route changes. Manual tracking via React Router gives accurate per-route data.

---

## Page View Tracking (React Router v7)

Add a `useEffect` in `App.tsx` that fires on every route change:

```tsx
import { usePostHog } from '@posthog/react'
import { useLocation } from 'react-router'

// Inside App component:
const posthog = usePostHog()
const location = useLocation()

useEffect(() => {
  posthog?.capture('$pageview', { $current_url: window.location.href })
}, [location, posthog])
```

This runs on every route change — covers `/`, `/blog`, `/games`, `/analytics`, `/music`, `/shop`.

---

## User Identification (Post-Auth)

After Supabase login, call `posthog.identify()` to link all prior anonymous events to the user:

```tsx
// After successful Supabase auth
const { data: { user } } = await supabase.auth.getUser()

posthog?.identify(user.id, {
  email: user.email,
  created_at: user.created_at,
})
```

On logout:
```tsx
posthog?.reset()
```

**Important:** Call `reset()` on logout so the next session starts as a new anonymous user, not the previous user.

---

## Event Naming Convention

Format: `[object] [verb]` (PostHog recommended)

| Event | When to fire |
|---|---|
| `$pageview` | Every route change (React Router) |
| `section navigated` | User clicks nav tab or home nav button |
| `card clicked` | User clicks any section card |
| `accordion expanded` | User opens an accordion item |
| `skin selected` | User picks a color skin in FloatingPalette |
| `purchase initiated` | User starts Stripe checkout |
| `purchase completed` | Stripe webhook confirms payment |
| `user signed up` | New Supabase account created |
| `user logged in` | Existing user signs in |
| `user logged out` | User signs out |

---

## Insertion Points (from codebase analysis)

### 1. `src/main.tsx` — lines 1-22
- Add PostHog init + PostHogProvider wrapper
- No existing analytics code

### 2. `src/app/App.tsx` — page view + navigation events

| Location | Line | Event |
|---|---|---|
| useEffect (new) | after line 647 | `$pageview` on route change |
| `navigateTo()` function | line 665-670 | `section navigated` with section name |
| Logo button onClick | line 690 | `section navigated` → HOME |
| Fixed nav tab onClick | line 702 | `section navigated` with section name |
| Home nav button onClick | line 378 | `section navigated` with section name |
| GamesSection card onClick | line 416 | `card clicked` → game title |
| MusicSection card onClick | line 454 | `card clicked` → music tool name |
| ToolsSection card onClick | line 499 | `card clicked` → tool name |
| BlogSection card onClick | line 549 | `card clicked` → post title |
| ShopSection card onClick | line 610 | `card clicked` → product name |

### 3. `src/components/SiteAccordion.tsx` — line 26-40
- Add `accordion expanded` capture on accordion open trigger

### 4. `src/app/FloatingPalette.tsx` (future — not yet created)
- Add `skin selected` capture with skin name and price tier

### 5. Auth modal (future — Session 4A)
- Add `user signed up`, `user logged in`, `user logged out`
- Add `posthog.identify()` on login, `posthog.reset()` on logout

### 6. Stripe checkout (future — Session 4B)
- Add `purchase initiated` when checkout opens
- Add `purchase completed` in webhook callback (server-side via PostHog API)

---

## Privacy & GDPR

- `persistence: 'localStorage'` — no cookies set → no cookie banner required in most jurisdictions
- `disable_session_recording: true` — no video replay data collected until explicitly opted in
- `mask_all_text: false` (default) — autocapture reads text, disable per-element with `className="ph-no-capture"`
- PostHog stores a random anonymous ID in localStorage only — no PII unless you call `identify()`
- If user requests data deletion: call `posthog.opt_out_capturing()` and delete their PostHog person via API

---

## .gitignore Update Required

Ensure `.env.local` is gitignored (it should be by default in Vite projects). Verify:
```
.env.local
.env.*.local
```

---

## Implementation Sessions

### Session A (now — before Auth)
- [ ] Install `posthog-js` + `@posthog/react`
- [ ] Create `.env.local` + `.env.example`
- [ ] Update `src/main.tsx` — init + PostHogProvider
- [ ] Add page view tracking useEffect in `App.tsx`
- [ ] Add `section navigated` events to `navigateTo()` and nav buttons
- [ ] Add `card clicked` events to all section card handlers (App.tsx lines 416, 454, 499, 549, 610)
- [ ] Add `accordion expanded` to `SiteAccordion.tsx`
- [ ] Verify events appearing in PostHog dashboard

### Session B (during Auth — Session 4A)
- [ ] Wire `posthog.identify()` after Supabase login
- [ ] Wire `posthog.reset()` on logout
- [ ] Add `user signed up` + `user logged in` + `user logged out` events

### Session C (during FloatingPalette — Task Group 4)
- [ ] Add `skin selected` event with skin name + price tier properties

### Session D (during Stripe — Session 4B)
- [ ] Add `purchase initiated` on checkout open
- [ ] Add `purchase completed` via Stripe webhook → PostHog server-side API

---

## PostHog Dashboard Setup (manual — after init)

1. Create project at app.posthog.com
2. Copy project API key → `.env.local`
3. Set up funnels:
   - Skin selection → purchase initiated → purchase completed
   - Sign up → first purchase
4. Set up dashboards:
   - Page views by route
   - Most clicked cards per section
   - Skin selection popularity
   - Purchase conversion rate
