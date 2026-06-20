<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Standing Tiger blog. PostHog was initialized in `src/main.tsx` with `PostHogProvider` and `PostHogErrorBoundary` wrapping the entire app. Five targeted events were instrumented across four components to capture the key user journey: landing on the home page, navigating between sections, clicking into content, expanding items, and viewing products in the shop.

| Event name | Description | File |
|---|---|---|
| `section_navigated` | User navigates to a section via the top nav bar or the home page link list | `src/app/App.tsx` |
| `card_clicked` | User clicks a preview card in any section (blog, games, music, analytics, shop) | `src/app/App.tsx` |
| `accordion_item_opened` | User expands an accordion item on a sub-page (blog post, game article, tool, product) | `src/components/SiteAccordion.tsx` |
| `product_viewed` | User opens a product accordion on the Shop page (top of purchase funnel) | `src/pages/ShopPage.tsx` |
| `back_to_home_clicked` | User clicks the back / STANDING TIGER button on a sub-page to return to the hub | `src/components/AccordionPage.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/478373/dashboard/1738004)
- [Section Navigation Trend](https://us.posthog.com/project/478373/insights/jc2Qf7Ew) — which sections users navigate to, by section
- [Card Clicks by Section](https://us.posthog.com/project/478373/insights/2lKRo7wk) — total card clicks broken down by section
- [Content Engagement Over Time](https://us.posthog.com/project/478373/insights/dmGirNR1) — accordion opens vs product views trend
- [Product Views Total](https://us.posthog.com/project/478373/insights/nKSn21HC) — top-of-funnel shop metric
- [Shop Funnel: Card Click → Product Viewed](https://us.posthog.com/project/478373/insights/JgfZcWjj) — shop card click vs product view trend

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN` and `VITE_PUBLIC_POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
