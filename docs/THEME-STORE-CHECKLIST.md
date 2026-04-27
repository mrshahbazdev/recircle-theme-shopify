# Theme Store Requirements (TSR) — compliance checklist

Last reviewed: Phase 31. Mirrors Shopify's [Theme Store Requirements](https://shopify.dev/docs/storefronts/themes/store/requirements) for paid + free theme submissions.

## A. Architecture

| # | Requirement | Status | Evidence |
|---|---|---|---|
| A1 | Settings schema present + valid JSON | PASS | `config/settings_schema.json` validates; covers brand / typography / layout / grading / analytics / consent / reviews / cart upsell / locale selector / B2B / subscriptions / size guide / chat / DPP / SEO. |
| A2 | Locale schema files for every storefront locale (settings labels) | PASS | `locales/{en.default,de,fr,it,es,nl}.schema.json` ship with `settings_schema.colors` translations. Expand as more `t:` keys are introduced in `settings_schema.json`. |
| A3 | No `templates/checkout.liquid` (Plus only) | PASS | Verified absent: `find templates -name 'checkout.liquid'` returns nothing. |
| A4 | `templates/gift_card.liquid` present | PASS | Ships with editorial styling. |
| A5 | JSON templates only (no stray `*.liquid` in `templates/` apart from `gift_card.liquid`, `robots.txt.liquid`, `*.compare-meta.liquid` snippet aliases) | PASS | `templates/robots.txt.liquid` is allowed. `product.compare-meta.liquid` and `product.quick-view.json` route via `?view=` and JSON respectively. |
| A6 | Every dynamic content section ships ≥1 preset | PASS | All 19 dynamic sections (`refurbished-hero`, `featured-collection`, `recently-viewed`, `condition-grade-explainer`, `co2-impact-counter`, `compare-table`, `comparison-strip`, `faq-accordion`, `how-refurbishment-works`, `locked-content`, `newsletter`, `quote-request`, `rich-text`, `sticky-atc-bar`, `story-timeline`, `sustainability-stats`, `testimonial-carousel`, `trade-in-calculator`, `wishlist`) each declare a preset. |
| A7 | No deprecated Liquid tags / globals | PASS | Repo-wide grep for `{% include %}`, `shop.global`, `font_url` returns zero matches. All snippets use `{% render %}`. |
| A8 | No external font stylesheets | PASS | `layout/theme.liquid` uses Shopify `font_face` filter exclusively (Shopify CDN). No `fonts.googleapis.com` link tags. |
| A9 | No external script tags except via merchant-provided integrations | PASS | Analytics IDs default to empty string → tags only emit when merchant pastes ID. Reviews / chat snippets emit only when provider selected. |
| A10 | Analytics off by default | PASS | `ga4_measurement_id`, `meta_pixel_id` default to `""`; consent banner gates them anyway (Phase 23). |

## B. Presets & demo

| # | Requirement | Status | Evidence |
|---|---|---|---|
| B11 | ≥3 named theme presets in `settings_data.json` | PASS | Ships `Editorial cream` (default), `Forest boutique`, `Tech charcoal` — each with distinct palette, fonts, density, page width and corner radius. |
| B12 | Demo store seeded with content | PENDING | Phase 32 — runs `scripts/seed.mjs` + `scripts/seed-ops.mjs` against the prodevnns demo store. |

## C. Performance & accessibility

| # | Requirement | Status | Evidence |
|---|---|---|---|
| C13 | Lighthouse ≥60 on home / collection / product (mobile, slow 4G) | PENDING | Phase 33 — captures audit and stores under `docs/lighthouse/`. |
| C14 | `theme-check` zero errors | PENDING | Phase 33 — runs the suite end-to-end and stores under `docs/theme-check.txt`. |
| C15 | axe-core / WAVE zero violations | PENDING | Phase 33 — runs against home / collection / PDP / cart / wishlist / compare / search / 404 and stores under `docs/axe/`. |

## D. Listing assets

| # | Requirement | Status | Evidence |
|---|---|---|---|
| D16 | 14 listing screenshots (1600×1000 lossless PNG) | PENDING | Phase 32 — runs `scripts/screenshots.mjs` against the seeded demo store. |
| D17 | Demo store URL (password-protected with reviewer code) | PENDING | Phase 32 — captured in `docs/DEMO-STORE.md`. |
| D18 | Listing copy in Partner Dashboard | DRAFT | `docs/THEME-STORE-LISTING.md` ready — merchant pastes during submission. |
| D19 | Theme docs / changelog / support email | PASS | `README.md`, `CHANGELOG.md`, `docs/*.md`, support email in `settings_schema.json` `theme_info`. |
| D20 | Pricing decision (free vs paid) | MERCHANT | Decided at Partner Dashboard submission. |

## E. Legal / business (merchant responsibility)

| # | Requirement | Status |
|---|---|---|
| E21 | Shopify Partner account + 2FA | MERCHANT |
| E22 | Tax forms (W-8BEN / W-9) | MERCHANT |
| E23 | Demo data licensing (CC0 / royalty-free) | MERCHANT — verify before submission |
| E24 | Privacy policy / GDPR text with merchant DPO contact | MERCHANT — Phase 23 ships consent banner; merchant fills in the policy pages |

## Phase mapping

- **Phase 31** — closes A1–A10, B11, D19 (this PR)
- **Phase 32** — closes B12, D16, D17
- **Phase 33** — closes C13–C15

Once Phase 33 lands, the theme is submission-ready. Merchant fills the Partner Dashboard listing form using `docs/THEME-STORE-LISTING.md`, attaches the 14 screenshots from Phase 32, supplies the demo store URL + reviewer password, and submits.
