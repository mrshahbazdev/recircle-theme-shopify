# ReCircle — Shopify OS 2.0 theme for refurbished & circular commerce

The first Shopify theme built specifically for **refurbished, pre-owned, and circular** commerce, with EU regulatory features baked in (Digital Product Passport, Right-to-Repair, Price Indication Directive, Accessibility Act).

> **Status:** v1.1 — fully populated demo, Theme Store submission candidate. 35 phases shipped on a public Shopify development store; preflight checks passing. See [`docs/THEME-OVERVIEW.md`](docs/THEME-OVERVIEW.md) for a page-by-page tour, [`docs/SUBMISSION.md`](docs/SUBMISSION.md) for the readiness checklist, and [`CHANGELOG.md`](CHANGELOG.md) for the phase history.

> **Out-of-the-box demo:** every JSON template ships with realistic dummy sections so a fresh install renders as a fully-featured store. Merchants edit, reorder, or remove individual sections from the theme editor — no code required. Full overview: [`docs/THEME-OVERVIEW.md`](docs/THEME-OVERVIEW.md).

---

## What's inside

### Refurbished-specific USPs (the 8 things no other theme has)

| Feature | Where it lives | Data source |
|---|---|---|
| **Condition badge** (A/B/C/D) | `snippets/condition-badge.liquid` | `product.metafields.recircle.condition_grade` |
| **CO₂ saved badge** | `snippets/co2-badge.liquid` | `product.metafields.recircle.co2_saved_kg` |
| **Digital Product Passport** (ESPR-ready) | `snippets/dpp-passport.liquid` | `product.metafields.recircle.{passport_id,materials,origin,recycled_percent,weight_grams,battery_health,serial,passport_url}` |
| **Repairability score** (0–10 ring) | `snippets/repairability-score.liquid` | `product.metafields.recircle.repair_score` |
| **Warranty & returns bar** | `snippets/warranty-bar.liquid` | `product.metafields.recircle.{warranty_months,returns_days}` or theme defaults |
| **EU-compliant dual price** (30-day low + MSRP) | `snippets/dual-price.liquid` | `product.metafields.recircle.{price_30day_low,msrp_new}` |
| **Before/after refurb slider** | `snippets/before-after-gallery.liquid` | `product.metafields.recircle.{before_image,after_image}` |
| **Trade-in calculator** | `sections/trade-in-calculator.liquid` | Runtime JS, demo pricing |

### Sections

- **Header group:** `announcement-bar`, `header`
- **Footer group:** `footer` with menu/newsletter/text/social blocks
- **Homepage:** `refurbished-hero`, `condition-grade-explainer`, `how-refurbishment-works`, `co2-impact-counter`, `sustainability-stats`, `featured-collection`, `rich-text`
- **Product page:** `main-product` with 12 blocks (vendor, title, badges, dual price, variants, buy buttons, warranty bar, repairability, DPP, description, before/after, share)
- **Collection:** `main-collection-product-grid` with condition-grade + brand + price filters
- **Other mains:** cart, search, page, blog, article, 404, password, login, register, account, order, addresses, reset_password, activate_account

### Localization

`locales/` — `en.default.json` + `de.json` · `fr.json` · `it.json` · `es.json` · `nl.json`

### Customization

- **Theme settings:** `config/settings_schema.json` exposes colors (brand + 4 condition grades), typography, layout, feature toggles for every refurbished-specific feature, and social links.
- **Design tokens:** CSS custom properties in `layout/theme.liquid` driven by theme settings.
- **JS:** `assets/theme.js` — vanilla ES, progressive enhancement, ~4 KB min.

---

## Install on a Shopify development store

1. **Create a dev store** (free) at <https://partners.shopify.com/> → *Stores* → *Add store* → *Development store*.

2. **Install the theme** — two options:

   **Option A — Zip upload (simplest):**
   ```bash
   cd recircle-theme-shopify
   zip -r ../recircle.zip . -x "*.git*" "*.github/*" "*.theme-check.yml" "README.md"
   ```
   Go to *Online Store → Themes → Add theme → Upload zip file*.

   **Option B — Shopify CLI (recommended for dev):**
   ```bash
   npm install -g @shopify/cli @shopify/theme
   cd recircle-theme-shopify
   shopify theme dev --store=your-dev-store.myshopify.com
   ```
   This opens a hot-reloading local preview.

3. **Set up metafields** in *Settings → Custom data → Products* using definitions in [`METAFIELDS.md`](METAFIELDS.md).

4. **Customize** in the theme editor (*Online Store → Themes → Customize*):
   - Set up navigation menus (main menu, footer menu)
   - Point `templates/page.trade-in.json` and `templates/page.sustainability.json` to actual CMS pages
   - Add demo products with metafields filled in

---

## Multi-niche demo positioning

The theme supports three launch niches with the same codebase:

| Niche | Collection handle | Demo merchant |
|---|---|---|
| **Refurbished electronics** | `refurbished-phones`, `refurbished-laptops` | Back Market-style |
| **Pre-owned fashion** | `pre-owned-fashion` | Vinted / The RealReal-style |
| **Refurbished furniture & appliances** | `refurbished-appliances` | AO Refurb-style |

Swap the hero image, tweak condition-grade labels (e.g. for fashion use "Pristine / Very good / Good / Visible wear"), and the rest of the theme adapts automatically.

---

## EU compliance notes

| Regulation | How this theme helps | Deadline |
|---|---|---|
| **ESPR / Digital Product Passport** | DPP block driven by metafields, QR-ready, passport URL field | Registry from July 2026, batteries Feb 2027 |
| **Right-to-Repair** | Repairability score + spare-parts badge built in | July 2026 |
| **EU Accessibility Act** | Skip link, ARIA roles, semantic HTML, 4.5:1 contrast colors | June 2025 |
| **Price Indication Directive** | Dual-price with 30-day lowest + MSRP | Already in force |
| **GDPR** | No 3rd-party scripts injected by theme; merchant adds their consent app | Already in force |

---

## Dev / contributing

```bash
# Install Shopify CLI
npm install -g @shopify/cli @shopify/theme

# Lint (Liquid syntax, schema validity, performance)
shopify theme check

# Live preview against a dev store
shopify theme dev --store=your-dev-store.myshopify.com

# Push to a specific store (unpublished)
shopify theme push --unpublished --store=your-dev-store.myshopify.com
```

## Roadmap

- [x] **Phase 1 (current PR):** Full OS 2.0 scaffold, 8 refurbished USP features, localization, multi-niche demo-ready.
- [ ] **Phase 2:** AJAX cart drawer, predictive search, richer trade-in flow with metaobject-driven pricing, accessibility audit pass.
- [ ] **Phase 3:** Theme Store submission — performance tuning (Lighthouse 90+), demo content for all 3 niches, WCAG 2.2 AA certification, Shopify theme review compliance.

## License

Proprietary — © mrshahbazdev. All rights reserved. Will relicense if published to the Shopify Theme Store.
