# Theme Store listing — final copy

This file is the single source of truth for the Shopify Theme Store listing.
Paste each section into the Partner Dashboard submission form.
Marketing taglines, SEO metadata, demo URL, screenshot shot list, and
asset specs all live here.

---

## 1. Theme name + tagline

| Field | Value |
|---|---|
| Theme name | **ReCircle** |
| Tagline (≤ 70 chars) | Refurbished commerce, circular by design. |
| Short description (≤ 100 chars) | The first Shopify theme built for refurbished, pre-loved & circular stores — EU DPP-ready. |

### Alternative taglines (A/B options)

1. Refurbished commerce, circular by design.
2. Built for refurbished. Designed for circular.
3. The Shopify theme refurbishers actually wanted.
4. Sell pre-owned without selling-out the design.
5. EU-compliant. Refurbished-first. Apps not required.

---

## 2. Long description (paste into Partner Dashboard)

ReCircle is the first Shopify theme purpose-built for **refurbished,
pre-owned, and circular-economy** merchants. Whether you sell
refurbished electronics, pre-loved fashion, or restored furniture,
ReCircle gives you the ten features every recommerce store needs —
without installing a single app.

### 10 refurbished-specific features no other theme has

1. **Condition grading** — A/B/C/D badges on every product card, filterable in collections
2. **Trade-in calculator** — merchant-editable pricing (brand + condition + age), inline live quote
3. **Digital Product Passport** — ESPR-ready materials, origin, traceability (EU mandate 2026–2027)
4. **Repairability score** — 0–10 ring with spare-parts availability + IFIXIT-style guide link
5. **CO₂ savings counter** — per-product badge + cart total + site-wide tally
6. **Before / after refurbishment gallery** — hand-slider comparison
7. **Warranty & returns bar** — months + days, prominent on PDP
8. **EU dual-price** — 30-day-low + MSRP-new (Price Indication Directive, Article 6a)
9. **B2B tiered pricing** — wholesale tiers by customer tag + per-product MOQ
10. **ReCircle Credits ledger** — loyalty + post-purchase impact summary on /account

### EU-compliance by default

- 6 EU languages — EN / DE / FR / IT / ES / NL — translated out of the box
- Shopify Markets-ready (multi-currency + country selector)
- WCAG 2.2 AA — skip link, visible focus, focus traps, aria-live, reduced-motion
- GDPR-safe — no third-party scripts, no external fonts, all data in Shopify

### 3 niche demos, one theme

Switch your homepage in one click:

- **Electronics** — phones, laptops, tablets. Battery health, cycle count, data-wipe certified.
- **Fashion** — authenticated pre-loved apparel. Designer + high-street.
- **Furniture** — restored mid-century + appliances. White-glove delivery.

### Performance that sells

- Vanilla JavaScript, no framework bloat. Total JS < 100 KB
- Single CSS file, preloaded, non-render-blocking
- Responsive `srcset` on every image, `fetchpriority="high"` on LCP
- AJAX cart drawer + predictive search — no full-page reloads

### Merchant-friendly

- Full theme-editor customisation — colors, type, sections, blocks
- 12+ content sections (mega-menu, FAQ, testimonials, story timeline, sticky ATC)
- 3 design-system presets (palette / font / density) for instant restyling
- 22 pre-defined metafields in the `recircle` namespace — set once, USPs auto-populate
- Native subscriptions via Shopify selling-plans
- B2B with tiered pricing, MOQ, and a quote-request form
- No build step. No node_modules. Upload the zip and you're live.

---

## 3. Tags (paste into Partner Dashboard)

`refurbished` `circular economy` `sustainability` `recommerce`
`pre-loved` `pre-owned` `second-hand` `trade-in` `subscription` `B2B`
`wholesale` `DPP` `EU` `electronics` `fashion` `furniture`
`accessibility` `multi-currency`

---

## 4. Industries

Primary: **Electronics — Refurbished**
Secondary: **Apparel & Accessories — Pre-loved**
Tertiary: **Home & Furniture — Restored**

---

## 5. Theme features (Partner Dashboard checkboxes)

Tick all that apply on the listing form:

- [x] Above-the-fold animations (reduced-motion respected)
- [x] Age verifier (use `sections/locked-content.liquid` if needed)
- [x] Announcement bar
- [x] Back-in-stock notifications (email template provided)
- [x] Cart notes
- [x] Cart type — Drawer (with native fallback)
- [x] Color swatches on product cards
- [x] Cookie banner (template stub, GDPR safe)
- [x] Country / region selector
- [x] Customer accounts (classic + new customer accounts both supported)
- [x] EU translations
- [x] FAQ page
- [x] Free shipping bar
- [x] Image with text
- [x] In-menu promotions (mega-menu)
- [x] Language selector
- [x] Lookbook
- [x] Mega menu
- [x] Newsletter signup
- [x] Predictive search
- [x] Press / logo bar
- [x] Product comparison
- [x] Product filtering (Storefront filters API)
- [x] Product reviews (compatible — reads from review apps' metafields)
- [x] Promo banners
- [x] Quick buy / quick view
- [x] Recently viewed
- [x] Recommended products
- [x] RTL languages — *partial; verified Hebrew/Arabic on a few templates*
- [x] Search / filter facets
- [x] Slideshow
- [x] Social media icons
- [x] Sticky add-to-cart
- [x] Sticky header
- [x] Stock counter
- [x] Store locator (template stub via `templates/page.locator.json` if needed)
- [x] Subscriptions / selling plans
- [x] Trust / payment badges
- [x] Video on product
- [x] Wishlist

---

## 6. Demo store URL

> https://recircle-demo.myshopify.com/?preview_theme_id=189945053365

(Provide reviewer access via Partners → Manage collaborator access. Storefront password if any.)

Required pages on the demo store:

- `/` (electronics homepage)
- `/?demo=fashion` *or* additional homepage variants seeded
- `/products/iphone-13-pro-refurbished` (PDP fully populated with all 22 metafields)
- `/collections/all`
- `/pages/wishlist`
- `/pages/compare`
- `/pages/trade-in`
- `/pages/quote` (B2B)
- `/blogs/news/why-refurbished` (1+ article)
- `/policies/privacy-policy`, `/policies/refund-policy`, `/policies/terms-of-service`
- `/account/login` (legacy customer accounts) so reviewer can verify member-pricing
  + ReCircle Credits + B2B locked content

---

## 7. SEO metadata (storefront-side, not Theme Store side)

| Field | Value |
|---|---|
| `<title>` (homepage) | ReCircle — Refurbished, pre-owned & circular commerce |
| Meta description | Sell refurbished electronics, pre-loved fashion, or restored furniture on Shopify with built-in condition grading, trade-in, DPP, and EU-compliant dual pricing. |
| Open Graph image | `screenshots/og-default.jpg` (1200 × 630) |
| Twitter card | `summary_large_image` |
| `application/ld+json` | Product schema auto-emitted by `snippets/structured-data.liquid` |

---

## 8. Pricing

| Channel | Price |
|---|---|
| Shopify Theme Store (US) | **$320** USD (one-time, includes free updates) |
| Off-store single-store | €149 EUR |
| Off-store agency 10-pack | €599 EUR |
| Custom enterprise | starting €2 500 EUR (whitelabel + bespoke section work) |

---

## 9. Support

- Help docs: bundled in `/docs/` and rendered to `https://recircle-theme.dev` (post-launch)
- Response SLA: 48 h (Shopify minimum), 10 days/month commitment
- Contact: `support@recircle-theme.dev` (or merchant-set contact email)
- Bug reports: GitHub issues at the public repo (link added at submission time)

---

## 10. Submission acceptance criteria

Before opening the listing form, all rows in [`SUBMISSION.md`](./SUBMISSION.md)
must be ✅. The `scripts/preflight.sh` script runs the automated subset.
