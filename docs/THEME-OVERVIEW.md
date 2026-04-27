# ReCircle theme — full overview

This doc walks merchants through every page the theme ships with, what dummy content is pre-populated, and the exact theme-editor levers to customise it. Most pages are usable as-is on a fresh install — change what you want, leave the rest.

> **Tip:** every section in every template can be reordered, duplicated, removed, or replaced from **Online Store → Themes → Customise**. The defaults below are just dummy content so a freshly-installed store doesn't look empty.

---

## Storefront pages at a glance

| Page | Template | Dummy sections shipped | What merchants typically change |
| --- | --- | --- | --- |
| **Home** | `templates/index.json` | hero, condition-grade explainer, refurbishment process, CO₂ counter, sustainability stats, featured collection, rich text | brand copy, hero image, featured collection handle |
| **Product** | `templates/product.json` | 12 PDP blocks (vendor, title, badges, dual price, variants, buy buttons, BNPL, warranty, repairability, DPP, description, before/after, share) | which blocks to show/hide, BNPL provider, size-guide content |
| **Collection** | `templates/collection.json` | product grid + condition filter + condition-grade explainer + newsletter | filter facets, products per page, eyebrow/heading copy |
| **Cart** | `templates/cart.json` | cart items + sustainability stats + "you may like" featured collection | upsell collection handle, reassurance copy |
| **Search** | `templates/search.json` | search results + popular featured collection + condition-grade explainer | popular-picks collection, eyebrow copy |
| **404** | `templates/404.json` | error message + popular picks + 5-step refurbishment process | popular-picks collection, brand voice |
| **Blog index** | `templates/blog.json` | post list (with eyebrow + subheading) + newsletter signup | eyebrow, subheading, newsletter copy |
| **Article** | `templates/article.json` | article body + newsletter + featured collection | newsletter copy, "mentioned products" collection |
| **Page (default)** | `templates/page.json` | rich-text + flexible blocks (gallery, accordion, image+text, CTA, video, embed, columns, table) | merchants drag in blocks per page |
| **About** | `templates/page.about.json` | rich-text + 5-step story timeline + sustainability stats + 3 testimonials + newsletter | numbers, testimonials, photos |
| **FAQ** | `templates/page.faq.json` | rich-text + 8-question accordion (3 groups) + newsletter | questions, answers, support email |
| **Trade-in** | `templates/page.trade-in.json` | hero + interactive calculator + 5-step process + reassurance stats | quote formula, brand list, copy |
| **Sustainability** | `templates/page.sustainability.json` | hero + animated CO₂ counter + 4 stats + methodology + testimonials | numbers, methodology copy |
| **Compare** | `templates/page.compare.json` | compare table + popular picks + condition-grade explainer | nothing — interactive widget |
| **Wishlist** | `templates/page.wishlist.json` | wishlist UI + suggested products | "continue shopping" CTA target |
| **Quote (B2B)** | `templates/page.quote.json` | quote-request form + value pills | form fields, value-prop copy |
| **List collections** | `templates/list-collections.json` | collections grid + sustainability stats | sort order, eyebrow copy |
| **Account dashboard** | `templates/customers/account.json` | account header + orders + addresses links + impact summary | rely on Liquid; no editor changes |
| **Login / Register / Reset / Activate** | `templates/customers/*.json` | editorial panel + form | eyebrow/copy via main-* sections |
| **Order detail** | `templates/customers/order.json` | order summary + impact line per item | rely on Liquid |
| **Addresses** | `templates/customers/addresses.json` | address list + edit form | rely on Liquid |
| **Password gate** | `templates/password.json` | hero + countdown + email capture | hero image, copy |

---

## Sections catalogue (38 total)

Each section ships with at least one preset and dummy default content. Add via theme editor → **Add section**.

### Marketing / hero

- `refurbished-hero` — full-bleed hero with condition pill + dual CTA + impact stats
- `rich-text` — single-column heading + body for editorial moments
- `featured-collection` — 4-product (configurable 2-12) grid with grade + CO₂ badges + dual price
- `story-timeline` — vertical step-by-step with photo per step
- `testimonial-carousel` — quotes + 5-star rating + verified-buyer badge, autoplay (respects reduced-motion)
- `comparison-strip` — refurb-vs-new (or A/B/C/D matrix) with checkmark grid
- `sticky-atc-bar` — page-level sticky CTA for landing pages

### Refurbished-specific

- `condition-grade-explainer` — 4 grade tiles (A/B/C/D) with description
- `how-refurbishment-works` — 5-step refurb process (source → inspect → repair → grade → ship)
- `co2-impact-counter` — animated tonnes counter + sub-stats (devices saved, water saved, etc.)
- `sustainability-stats` — 4-up stat grid (configurable blocks)
- `trade-in-calculator` — interactive form with brand picker + condition + age, returns instant quote

### Conversion + utility

- `newsletter` — email capture with 3 perk pills, optional Klaviyo / Mailchimp form-action
- `faq-accordion` — keyboard-accessible Q&A grouped by topic
- `cart-upsell-rail` — drawer + cart-page upsell row with "Add to cart" inline
- `compare-table` — interactive 4-column compare widget
- `wishlist` — localStorage-backed saved-for-later UI
- `recently-viewed` — last 12 viewed products
- `quote-request` — B2B contact form with custom value pills
- `predictive-search` — type-ahead search popover with grade badges

### Page templates (main-* sections)

`main-404`, `main-account`, `main-activate-account`, `main-addresses`, `main-article`, `main-blog`, `main-cart`, `main-collection-product-grid`, `main-list-collections`, `main-login`, `main-order`, `main-page`, `main-password`, `main-product`, `main-quick-view`, `main-register`, `main-reset-password`, `main-search`

### Header / footer

- `announcement-bar` — rotating message bar with locale-aware copy
- `header` — sticky header with mega-menu, search, account, cart drawer trigger, locale + currency selector
- `footer` — 4-column with menu/newsletter/text/social blocks + payment icons + consent link

---

## Where merchants spend most of their time

1. **Theme settings → Branding** — palette, fonts, density, social links
2. **Theme settings → Refurbished** — default warranty months, return window, BNPL provider
3. **Theme settings → Analytics** — GA4 ID, Meta Pixel ID (off until set; consent-gated by default)
4. **Theme settings → Subscription & loyalty** — Recharge/Bold/Skio enable, points multiplier
5. **Theme settings → B2B / wholesale** — quote-request email, customer-tag access rules
6. **Sections everywhere** — every dummy heading, eyebrow, image, collection-handle is a one-click swap in the editor

---

## What's intentionally not pre-set

These need a one-time merchant setup before going live. The theme works without them but features stay invisible.

- **GA4 / Meta Pixel IDs** (analytics off until set)
- **Klaviyo / Mailchimp form action** for newsletter
- **Reviews app provider** in theme settings (Judge.me / Loox / Yotpo / Shopify)
- **Trade-in destination email** + `recircle.tradein_quote` form action
- **Quote-request destination email** for B2B
- **Customer-account mode** must be set to "Classic" in admin if `/account/login` should render the editorial template (not Shopify-hosted UI)
- **Locales** (de/fr/it/es/nl) ship in `locales/` but must be **published** in admin → Languages

A full one-time setup checklist is in [`docs/OPS-CHECKLIST.md`](OPS-CHECKLIST.md).

---

## Walkthrough video

A 5-minute walkthrough covering desktop + mobile passes across every page above is linked at the top of [`README.md`](../README.md).

## Live demo

Reviewer access details + demo store URL are in [`docs/DEMO-STORE.md`](DEMO-STORE.md).

## Listing copy

Theme Store listing copy ready to paste is in [`docs/THEME-STORE-LISTING.md`](THEME-STORE-LISTING.md).
