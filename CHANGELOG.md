# Changelog

All notable changes to the ReCircle Shopify theme.
Versions follow [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`.

## [1.0.0] — Theme Store submission candidate

First public release candidate. Ships 22 phases of incremental work as a single
versioned theme suitable for the Shopify Theme Store.

### Storefront

- 8 refurbished-specific snippets: condition badge, CO₂ badge, DPP passport,
  repairability score, warranty/returns bar, EU dual-price (30-day-low + MSRP),
  before/after slider, trade-in calculator
- 3 niche home templates: electronics, fashion, furniture
- AJAX cart drawer, predictive search, quick-view modal, wishlist, recently-viewed
  rail, compare table (max 2–6 configurable)
- Editorial design system: warm cream (`#FBF8F3`) + Playfair display + Inter body,
  consistent eyebrow pills, rich empty states across cart / search / wishlist / 404
- Sticky desktop buy-card on product page; mobile-only fixed ATC bar
- Mega-menu, FAQ accordion, testimonial carousel, comparison strip, sticky-ATC
  page section, story timeline

### Subscription, loyalty & B2B (Phase 19–20)

- Native Shopify selling-plans picker on PDP
- Member-pricing pill (customer-tag based, with optional teaser for guests)
- ReCircle Credits ledger on `/account` (balance card + how-it-works + history)
- B2B tiered pricing table (gated by customer tag)
- Per-product MOQ enforcement (Liquid `min` + JS submit-guard)
- `sections/quote-request.liquid` + `templates/page.quote.json`
- `sections/locked-content.liquid` (tag-gated content section)

### Settings, analytics, localization

- 3 design-system presets in settings: palette, font pairing, density
- GA4 + Meta Pixel direct integrations + `recircle:*` custom-event API
- Full translations (~156 keys/locale) across 6 EU languages: en / de / fr / it /
  es / nl, plus header language selector
- Section-group architecture; OS 2.0 JSON templates throughout

### Performance & accessibility

- WCAG 2.2 AA compliance: skip-link, visible focus-rings (3 px amber halo),
  reduced-motion + forced-colors coverage, focus-trap on modals, `aria-live`
  regions on cart / wishlist / search-results
- Performance polish: image attrs (`srcset` / `sizes` / `width` / `height` /
  `decoding="async"` / `fetchpriority="high"` for LCP), CSS `aspect-ratio` for
  zero CLS, `content-visibility: auto` on below-fold lists for INP/TBT
- Vanilla JS, no framework — total JS < 100 KB, total CSS < 150 KB

### Email templates

- `email-templates/` — 5 transactional/lifecycle templates × 2 platforms
  (Shopify Email + Klaviyo) + plaintext fallbacks
- Editorial design with Outlook MSO conditionals + dark-mode media queries

### Demo seed kit

- `seed/seed.mjs` — Admin-API seeder for products, metafields, collections,
  pages, articles
- `scripts/install.mjs` — Admin-API theme installer (94 / 94 files)

### Phases

| # | Phase | Highlights |
|---|---|---|
| 1 | MVP foundation | Layout, header, footer, home/product/collection templates |
| 2 | AJAX, predictive search, trade-in metaobject | First interactive features |
| 3 | Performance + theme-check + submission docs | Lighthouse-friendly defaults |
| 4 | Demo seed kit | Admin-API product/metafield/collection seeder |
| 5 | Seed-script hardening | Idempotent seeds against a live store |
| 6 | Premium add-ons | Wishlist, recently-viewed, quick-view, compare |
| 7 | Theme installer + Liquid fixes | `scripts/install.mjs` |
| 8 | PDP Liquid bug fixes | Surfaced during live install |
| 9 | Editorial redesign | Cream + Playfair, sticky buy-card, refined cards |
| 10 | Sticky buy-card fix | `align-items:start` + dedicated details row |
| 11 | Wishlist UI redesign | Editorial cards + ATC + rich empty state |
| 12 | Page-level redesign | Collection, cart, search, blog, account, 404, password, compare |
| 13 | Performance + WCAG 2.2 AA | CLS / LCP / INP + a11y polish |
| 14 | Editorial email templates | Shopify Email + Klaviyo + plaintext |
| 15 | Storefront content blocks | Mega-menu, FAQ, testimonials, compare strip, sticky ATC, story timeline |
| 16 | Theme settings polish | Palette / font / density presets |
| 17 | Analytics | GA4 + Meta Pixel + `recircle:*` custom events |
| 18 | Localization sweep | 85 missing keys + language selector |
| 19 | Subscription + loyalty | Selling-plans, member pricing, ReCircle Credits |
| 20 | B2B / wholesale | Tiered pricing, MOQ, quote-request, tag-locked content |
| 21 | Polish | A11y live regions, autoplay resume, search empty state |
| 22 | Submission package | Listing copy, screenshot script, demo seed, preflight |
