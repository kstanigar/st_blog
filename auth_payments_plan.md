# Auth & Payments Implementation Plan
> Standing Tiger Blog — Full Auth + Stripe One-Time Purchases
> Created: 2026-06-16 | Status: Planning

---

## Overview

Full auth and color skin monetization system. Users can purchase individual color skins, a full color picker, and a rainbow cycle mode. Supabase handles auth + purchase records. Stripe handles payments. AWS (Amplify or S3+CloudFront) hosts the frontend. A Supabase Edge Function receives Stripe webhooks and records purchases.

**Pricing:**
| Product | Price | `product_id` |
|---|---|---|
| Individual named skin (×6) | $2.99 each | `skin_neon_ghost`, `skin_toxic`, etc. |
| Color wheel (hue slider) | $7.99 | `color_wheel` |
| Rainbow cycle | $9.99 | `rainbow_cycle` |

---

## Architecture

```
Browser (React SPA)
  ↓ supabase-js (PKCE auth)
Supabase Auth ──→ Supabase PostgreSQL (purchases table, RLS enforced)
  ↓
  ↓ user clicks Buy
Stripe Checkout (hosted, Stripe-managed)
  ↓ payment succeeds
Stripe Webhook → Supabase Edge Function → INSERT purchases row
  ↓
React queries purchases on login → unlocks skins client-side
```

---

## Research Findings (2026 Best Practices)

> Verified 2026-06-20 via haiku agent research against current Supabase, Stripe, and AWS docs.

### Supabase Auth
- SDK: `@supabase/supabase-js` v2 (v2.108.2 current as of June 2026 — no v3)
- Auth flow: **PKCE for OAuth flows only** — required for OAuth public clients (no client secret in browser). Email/password uses the default implicit flow — PKCE is unnecessary overhead for email/password in a client-only SPA
- **Do not install `@supabase/ssr`** — that package is for SSR frameworks (Next.js, SvelteKit). A Vite React SPA uses `@supabase/supabase-js` only
- Refresh token rotation: enabled by default, 10-second reuse interval prevents replay attacks
- **Never** use the service role key client-side — anon key only (RLS enforces access control)
- `VITE_*` env vars are embedded at build time — safe for anon key, never for service role key

### Stripe Payments
- **Two options (decision pending):**
  - **Hosted Checkout (redirect)** — simpler, redirect to Stripe-managed page and back. Still fully supported. Less code, no custom UI
  - **Embedded Payment Element** (`@stripe/react-stripe-js` + Checkout Sessions API) — stays on-site in a Stripe-managed iframe, 18+ payment methods auto-enabled, Adaptive Pricing. Stripe's current recommended path for SPAs
- SDKs: `@stripe/stripe-js` + `@stripe/react-stripe-js` (browser) + `stripe` (Node/Deno server-side)
- Idempotency keys: **use `crypto.randomUUID()` per request** — never encode user_id in the key (Stripe anti-pattern: blocks legitimate repeat purchases + exposes PII). Attach `user_id` and `product_id` in Stripe `metadata` instead

### Stripe Webhooks → Supabase Edge Functions
- Supabase Edge Functions run on Deno (Rust-based Supabase Edge Runtime, Deno-compatible) — 0–5ms cold starts, ideal for webhooks
- Must pass **raw request body** (not JSON-parsed) to `stripe.webhooks.constructEvent()` for signature verification — current Stripe API version `2026-05-27.preview`, requirement unchanged
- Disable JWT verification on the webhook endpoint in `config.toml` (it's a public endpoint Stripe calls)
- Signature verification uses HMAC with 5-minute timestamp tolerance — rejects replayed events
- Return `200` immediately; queue heavy work asynchronously

### Database Security (RLS)
- Row Level Security enforced at PostgreSQL level — users can only read their own purchases
- Anon key client-side + RLS = safe to query purchases table directly from browser
- Service role key (bypasses RLS) only used inside Edge Functions, never exposed to browser
- Policy: `auth.uid() = user_id` on purchases table
- **INSERT blocking:** omit the INSERT policy entirely (no grant) rather than `WITH CHECK (false)` — more idiomatic and clearer in the Supabase dashboard UI

### AWS Deployment
- **AWS Amplify Gen 2** (CDK-based): current recommended approach — auto SPA routing, integrated CI/CD, auto SSL
- **pnpm gotcha:** pnpm is not pre-installed in Amplify's build environment. Must add `npm install -g pnpm` as a pre-build step in `amplify.yml`, or switch CI build command to `npm run build`
- **S3 + CloudFront**: better for full control, custom cache rules, CSP headers
- Vite auto-fingerprints assets (cache busting built-in) — set HTML TTL ≤ 1 day
- Configure 404 → index.html for SPA client-side routing
- Add CSP headers via CloudFront response headers policy (not Supabase/Stripe requirement, but 2026 best practice)

---

## File Structure (Modular)

```
src/
├── app/
│   ├── App.tsx                        — wire auth provider + FloatingPalette
│   ├── FloatingPalette.tsx            — color skin UI modal (Task Group 4)
│   └── AuthModal.tsx                  — login/signup modal (new)
├── lib/
│   ├── supabase.ts                    — supabase client singleton (anon key only)
│   ├── stripe.ts                      — loadStripe() singleton
│   └── purchases.ts                   — query/cache user purchases
├── hooks/
│   ├── useAuth.ts                     — auth state (user, loading, signIn, signOut)
│   └── usePurchases.ts               — fetch + cache purchased product IDs
├── context/
│   └── AuthContext.tsx               — React context wrapping useAuth
supabase/
├── functions/
│   └── stripe-webhook/
│       └── index.ts                  — Edge Function: verify + record purchase
├── migrations/
│   └── 001_purchases.sql             — purchases table + RLS policies
└── config.toml                       — disable JWT on webhook endpoint
```

**Why this structure:**
- `lib/` — pure service clients, no React — easy to swap Supabase for another provider later
- `hooks/` — all auth/purchase logic in hooks, components stay presentation-only
- `context/` — auth state available app-wide without prop drilling
- `supabase/` — Edge Functions and migrations co-located with the project, version-controlled

---

## Task List

### Phase 1 — Supabase Setup (no code yet, dashboard config)
- [ ] Create Supabase project at supabase.com
- [ ] Enable Email/Password auth + Google OAuth in Auth settings
- [ ] Copy `SUPABASE_URL` and `SUPABASE_ANON_KEY` → add to `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Copy `SUPABASE_SERVICE_ROLE_KEY` → add to Supabase Edge Function secrets (never in `.env.local`)

### Phase 2 — Database Schema
- [ ] Create `supabase/migrations/001_purchases.sql`
  ```sql
  -- Tracks which products each user has purchased.
  -- RLS ensures users can only read their own rows.
  create table purchases (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid references auth.users(id) on delete cascade not null,
    product_id  text not null,              -- e.g. 'skin_neon_ghost', 'color_wheel'
    stripe_session_id text unique not null, -- prevents duplicate inserts on webhook retry
    purchased_at timestamptz default now()
  );

  -- RLS: users can only see their own purchases
  alter table purchases enable row level security;
  create policy "users read own purchases"
    on purchases for select
    using (auth.uid() = user_id);

  -- No INSERT policy defined — only the service role (Edge Function) can insert.
  -- Omitting the policy is cleaner than WITH CHECK (false) and clearer in Supabase dashboard.
  ```
- [ ] Run migration via Supabase CLI: `supabase db push`

### Phase 3 — Frontend Auth
- [ ] Install: `pnpm add @supabase/supabase-js`
- [ ] Create `src/lib/supabase.ts` — supabase client singleton
  ```ts
  import { createClient } from '@supabase/supabase-js';
  // Anon key is safe to expose — RLS enforces all access control
  export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  ```
- [ ] Create `src/hooks/useAuth.ts` — auth state hook (signIn, signUp, signOut, user, loading)
- [ ] Create `src/context/AuthContext.tsx` — wrap app in auth provider
- [ ] Create `src/app/AuthModal.tsx` — login/signup modal (email/password + Google button)
  - Tabs: SIGN IN / SIGN UP
  - Monospace aesthetic matching site style
  - Error states (wrong password, email taken)
  - Loading state during auth
- [ ] Wire `AuthContext.Provider` into `App.tsx` root

### Phase 4 — Purchase Tracking
- [ ] Create `src/lib/purchases.ts` — fetch purchases for logged-in user
  ```ts
  // Returns a Set of product_ids the user owns — fast O(1) lookup for lock/unlock
  export async function fetchPurchases(userId: string): Promise<Set<string>> {
    const { data } = await supabase
      .from('purchases')
      .select('product_id')
      .eq('user_id', userId);
    return new Set(data?.map(r => r.product_id) ?? []);
  }
  ```
- [ ] Create `src/hooks/usePurchases.ts` — wraps fetchPurchases, re-runs after payment redirect

### Phase 5 — Stripe Integration
- [ ] Create Stripe account at stripe.com
- [ ] Create products in Stripe dashboard (7 products with prices):
  - `skin_neon_ghost` — $2.99
  - `skin_toxic` — $2.99
  - `skin_solar_flare` — $2.99
  - `skin_ivory_static` — $2.99
  - `skin_blood_code` — $2.99
  - `skin_ember` — $2.99
  - `color_wheel` — $7.99
  - `rainbow_cycle` — $9.99
- [ ] Copy Stripe secret key → Supabase Edge Function secrets (never in `.env.local`)
- [ ] Copy Stripe publishable key → `.env.local` as `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Install: `pnpm add @stripe/stripe-js`
- [ ] Create `src/lib/stripe.ts` — loadStripe singleton
- [ ] Add `createCheckoutSession` Edge Function (or API route) that creates a Stripe Checkout session
  - Passes `metadata: { user_id, product_id }` so webhook knows who bought what
  - Sets `success_url` and `cancel_url` back to the site
  - Uses idempotency key: `crypto.randomUUID()` per request — never encode user_id in key (blocks repeat purchases + exposes PII)

### Phase 6 — Stripe Webhook Edge Function
- [ ] Create `supabase/functions/stripe-webhook/index.ts`
  - Receive POST from Stripe
  - Read raw body (critical for signature verification)
  - Verify signature: `stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)`
  - On `checkout.session.completed` event:
    - Extract `user_id` and `product_id` from `session.metadata`
    - INSERT into purchases with `stripe_session_id` (unique constraint prevents duplicates on retry)
  - Return 200 immediately
- [ ] Add to `supabase/config.toml`:
  ```toml
  [functions.stripe-webhook]
  verify_jwt = false  # Stripe calls this, not authenticated users
  ```
- [ ] Register webhook URL in Stripe dashboard → `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
- [ ] Test with Stripe CLI: `stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook`

### Phase 7 — FloatingPalette Wired to Auth/Purchases
- [ ] Update `FloatingPalette.tsx` — read `usePurchases()` to determine locked/unlocked state
- [ ] Locked skins: show swatch greyed out + `[LOCKED $2.99]` label, clicking opens purchase flow
- [ ] Unlocked skins: fully interactive, persisted to localStorage
- [ ] Color wheel section: locked behind `color_wheel` purchase (`[LOCKED $7.99]`)
- [ ] Rainbow section: locked behind `rainbow_cycle` purchase (`[LOCKED $9.99]`)
- [ ] Add account button (top of palette modal): shows email if logged in, opens AuthModal if not
- [ ] Master toggle: switches `--primary` between chosen skin and default `#00d4ff` (cyan)

### Phase 8 — Deployment Strategy (AWS Amplify — Both Environments)

**Branch model:**
- `dev` branch → GitHub only for free iteration (push as many commits as needed, zero cost) + Amplify staging URL on **manual deploy only**
- `main` branch → Amplify production URL — auto-deploys on every merge from `dev`
- `.github/workflows/build-check.yml` — PR build-check CI (no deploy, just `pnpm build` to catch broken builds before merge)

**Workflow:**
```
feature work → push freely to dev on GitHub (free, no Amplify build triggered)
     ↓ when ready to preview
manually trigger dev build in Amplify console → staging URL available
     ↓ when approved
PR dev → main (build-check CI runs) → merge → Amplify prod auto-deploys
```

**Cost rationale:** Amplify bills per build minute (~$0.01/min). Setting `dev` to manual deploy means zero charges during active development — only pay when you explicitly want a staging preview. After AWS free tier (12 months), estimated cost ~$0.16–$0.20/month total.

---

**Step-by-Step Amplify Console Setup:**

**Step 1 — Connect repo (main branch)**
1. AWS Console → **Amplify** → **New app** → **Host web app**
2. Select **GitHub** → Continue → authorize AWS Amplify
3. Install GitHub App: pick account → **Only select repositories** → choose `kstanigar/st_blog` → **Install & Authorize**
4. Select repo → select **main** branch → Next
5. Amplify auto-detects `amplify.yml` from repo root → Next → **Save and deploy**

`main` now auto-deploys on every push/merge.

**Step 2 — Add `dev` branch + disable auto-build**
1. App console → **Hosting** → **Branches** → **Connect branch**
2. Select `dev` branch → Next → **Save and deploy** *(builds once on connect)*
3. Once connected: click `dev` branch row → **Actions** → **Disable auto build**

Pushes to `dev` on GitHub now cost nothing — Amplify ignores them.

**Step 3 — Trigger manual deploy on `dev` (when you want a preview)**
- Console: App console → click `dev` branch → **Run build**
- CLI: `aws amplify start-job --app-id <id> --branch-name dev --job-type RELEASE`

**Step 4 — Set environment variables per branch**
1. App console → **Hosting** → **Environment variables** → **Manage variables**
2. Add global defaults, then **Add variable override** per branch:

| Variable | `dev` value | `main` value |
|---|---|---|
| `VITE_SUPABASE_URL` | test project URL | live project URL |
| `VITE_SUPABASE_ANON_KEY` | test anon key | live anon key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` |

- Use Stripe test card `4242 4242 4242 4242` for staging purchases
- 2026 recommendation: use Restricted API Keys in live mode (least-privilege)

**Step 5 — Add SPA rewrite rule (both branches)**
1. App console → **Hosting** → **Rewrites and redirects** → **Add rule**

| Field | Value |
|---|---|
| Source | `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|svg|txt|webp|woff|woff2|ttf|map|json)$)([^.]+$)/>` |
| Target | `/index.html` |
| Type | **Rewrite (200)** |

**Step 6 — Allowlist domains**
- Supabase dashboard → Auth → URL Configuration → add both Amplify URLs to redirect allowlist
- Stripe dashboard → add both Amplify URLs to allowed origins

---

**`amplify.yml` — already in repo root (no changes needed):**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 20
        - npm install -g pnpm
        - pnpm install
    build:
      commands:
        - pnpm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**pnpm gotcha:** If dependency resolution errors appear in Amplify build logs, add `.npmrc` to repo root:
```
node-linker=hoisted
```

---

**Tasks:**
- [ ] Step 1 — Connect `kstanigar/st_blog` to Amplify, `main` branch, auto-deploy
- [ ] Step 2 — Connect `dev` branch, disable auto-build
- [ ] Step 3 — Verify manual deploy works on `dev`
- [ ] Step 4 — Set env vars per branch (test keys on `dev`, live keys on `main`)
- [ ] Step 5 — Add SPA rewrite rule to both branches
- [ ] Step 6 — Add Amplify URLs to Supabase Auth allowlist + Stripe allowed origins

### Phase 9 — Environment Variables Checklist
```
# .env.local (committed to .gitignore — NEVER commit this file)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...          # safe to expose — RLS enforces access
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...  # safe to expose — public key

# Supabase Edge Function secrets (set via Supabase dashboard or CLI — never in .env.local)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # bypasses RLS — treat like a password
```

---

## Security Checklist

- [ ] RLS enabled on `purchases` table with `auth.uid() = user_id` policy
- [ ] Service role key only inside Edge Function secrets, never in browser bundle
- [ ] Stripe webhook signature verified on every request (HMAC, 5-min timestamp tolerance)
- [ ] `stripe_session_id` unique constraint prevents duplicate purchase inserts on webhook retry
- [ ] Idempotency key on Checkout session creation prevents duplicate charges
- [ ] `.env.local` in `.gitignore` (verify before first commit with secrets)
- [ ] CSP headers on CloudFront (or Amplify custom headers): restrict script-src, connect-src
- [ ] Supabase Auth redirect URLs allowlist (production domain only in production project)
- [ ] Stripe allowed origins includes production domain

---

## Estimated Session Breakdown

| Session | Work |
|---|---|
| Session 4A | Phase 1–3: Supabase setup + database + frontend auth modal |
| Session 4B | Phase 4–6: Stripe integration + webhook Edge Function |
| Session 4C | Phase 7–8: FloatingPalette wired to purchases + AWS deploy |

---

## Decisions

- **Supabase over Firebase** — PostgreSQL is more queryable; better RLS; single platform for auth + DB; Deno Edge Functions ideal for Stripe webhooks
- **Stripe Checkout (hosted) over Payment Element** — less code, PCI handled by Stripe, mobile-optimized, supports 100+ payment methods with no extra work
- **Amplify over S3+CloudFront** — comparable cost, built-in CI/CD, zero infra config; can migrate to S3+CF later if needed
- **`stripe_session_id` unique constraint** — database-level deduplication; webhook retries are safe even if Edge Function crashes mid-insert
- **Purchases as a Set client-side** — O(1) lookup for lock/unlock checks; re-fetched on login and after Stripe redirect

---

*Last updated: 2026-06-20 — verified against 2026 best practices (Supabase v2.108.2, Stripe API 2026-05-27, Amplify Gen 2)*
