# GitHub Pages Dev Deploy Plan
> Standing Tiger Blog — Stage 1 of 3-Stage Deployment Pipeline
> Created: 2026-06-22

---

## Overview

3-stage deployment pipeline:

```
push to dev → GitHub Pages (stage 1: free preview, test env vars)
     ↓ when ready to stage
manual trigger → Amplify dev (stage 2: full staging)
     ↓ when approved
PR dev → main → Amplify main (stage 3: production, auto-deploy)
```

GitHub Pages serves as a free, always-on preview of the `dev` branch with full auth and payments working via test keys. Every push to `dev` auto-deploys.

---

## Current State (Already Correct — No Changes Needed)

- `vite.config.ts` — `base: '/st_blog/'` ✅
- `src/main.tsx` — `BrowserRouter basename={import.meta.env.BASE_URL}` ✅
- `.github/workflows/build-check.yml` — PR build check CI already set up ✅

---

## What Needs To Be Done

### Step 1 — Add GitHub Secrets (you do this in browser)

Go to: `github.com/kstanigar/st_blog` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these 3 secrets (use **test/dev keys** — not live keys):

| Secret name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your test Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your test Supabase anon key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` (Stripe test publishable key) |

### Step 2 — Set GitHub Pages Source (you do this in browser)

Go to: `github.com/kstanigar/st_blog` → **Settings** → **Pages** → **Source** → select **GitHub Actions**

### Step 3 — Add `public/404.html` (code change)

GitHub Pages returns a 404 for unknown paths (e.g. `/st_blog/games`). This script encodes the path as a query string so React Router can restore it.

Create `public/404.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Standing Tiger</title>
    <script>
      // pathSegmentsToKeep = 1 for /st_blog/ base path
      var pathSegmentsToKeep = 1;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body></body>
</html>
```

### Step 4 — Add decode script to `index.html` (code change)

Add this script in the `<head>` of `index.html` (before the closing `</head>` tag). It decodes the path encoded by `404.html` and restores the correct URL for React Router:

```html
<!-- SPA routing restore for GitHub Pages -->
<script>
  (function(l) {
    if (l.search[1] === '/') {
      var decoded = l.search.slice(1).split('&').map(function(s) {
        return s.replace(/~and~/g, '&')
      }).join('?');
      window.history.replaceState(null, null,
        l.pathname.slice(0, -1) + decoded + l.hash
      );
    }
  }(window.location))
</script>
```

### Step 5 — Create `deploy-dev.yml` (code change)

Create `.github/workflows/deploy-dev.yml`:

```yaml
name: Deploy to GitHub Pages (dev)

on:
  push:
    branches: [dev]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v6
        with:
          version: 11

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_STRIPE_PUBLISHABLE_KEY: ${{ secrets.VITE_STRIPE_PUBLISHABLE_KEY }}

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

---

## Task Checklist

- [x] Step 1 — Add 3 GitHub Secrets (browser, one-time)
- [x] Step 2 — Set GitHub Pages source to "GitHub Actions" (browser, one-time)
- [x] Step 3 — Create `public/404.html` (SPA routing fix)
- [x] Step 4 — Add decode script to `index.html` `<head>`
- [x] Step 5 — Create `.github/workflows/deploy-dev.yml`
- [ ] Commit + push to `dev` → verify GitHub Pages deploys at `kstanigar.github.io/st_blog/`

---

## Notes

- Steps 1 & 2 are browser-only (no code changes) — do these first
- Steps 3–5 require explicit user approval before implementation
- `build-check.yml` and `deploy-dev.yml` have no conflicts — they trigger on different events (PR vs push)
- GitHub Pages URL: `https://kstanigar.github.io/st_blog/`
- After deployment, verify: home loads, a card click navigates correctly (tests React Router restore)

---

## Why the 404.html trick?

GitHub Pages is a static file server — it has no server-side routing. When a user navigates directly to `https://kstanigar.github.io/st_blog/games`, GitHub Pages looks for a `games` file, doesn't find it, and returns the `404.html`. The script in `404.html` encodes the original path as a query string and redirects to the root. The script in `index.html` detects this encoded query string, decodes it, and calls `history.replaceState` to restore the original URL — then React Router takes over and renders the correct page. The user never sees a 404.

---

*Last updated: 2026-06-22*
