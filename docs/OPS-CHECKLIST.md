# Phase 29 — Operations checklist

End-to-end deployment + data-seeding checklist for taking a fresh dev / staging
store from "theme installed" to "every v1.x feature visibly working."

## Required env

```bash
export SHOPIFY_STORE=your-dev-store.myshopify.com
export SHOPIFY_ADMIN_TOKEN=shpat_…   # custom app token, scopes below
export SHOPIFY_CURRENCY=EUR          # match the store's primary currency
```

App scopes:
`read_products, write_products, read_publications, write_publications, read_themes, write_themes, read_metaobjects, write_metaobjects, read_files, write_files, read_locales, write_locales, read_content, write_content`

## 1. Push theme to the store

```bash
node seed/install-theme.mjs                # uploads all theme files unpublished
```

## 2. Seed catalog + content

```bash
node seed/seed.mjs                         # metafield defs + collections + pages + articles
# Then in Admin → Products → Import → seed/products.csv
```

## 3. Seed B2B / member-pricing / MOQ on demo products *(new in Phase 29)*

```bash
node seed/seed-ops.mjs --limit=6
```

What it does (idempotent):
- Ensures Phase 19/20/28 metafield definitions exist (`member_price`, `b2b_tiers`, `moq`, `size_chart_html`).
- Sets a 3-tier B2B ladder (5 → -5%, 10 → -10%, 25 → -18%) on the first 6 products so the **Tiered pricing** table renders on PDP.
- Sets a sample `member_price` on each product so the **Member price** badge renders for tag-locked customers.
- Sets `moq=5` on every third product so the **MOQ guard** triggers in the cart.

Owner can override every value in Admin → Products → \[product\] → Metafields.

## 4. Publish theme locales *(new in Phase 29)*

```bash
node seed/publish-locales.mjs
```

Enables + publishes `de, fr, it, es, nl` so the language switcher works on the
storefront. The translation strings already ship with the theme (Phase 18 +
Phase 24/25/26/27/28).

## 5. Verify customer-accounts mode

Admin → **Settings → Customer accounts** → ensure **"Classic customer accounts"** is selected.

The theme's editorial login / register / reset-password / activate templates
only render under classic CA. Hosted CA (the new default) routes to Shopify's
own UI so the templates ship inert.

## 6. Configure analytics + consent

Theme settings → **Analytics**:
- GA4 measurement ID (optional)
- Meta Pixel ID (optional)
- Default consent denied = on (EU-safe)
- Cookie banner policy URL = `/policies/privacy-policy` (or your custom page)

## 7. Configure live chat *(optional, new in Phase 28)*

Theme settings → **Analytics → Live chat widget** → pick provider + paste ID.
Loads only after the visitor accepts functional consent.

## 8. Drop in optional storefront sections

Theme editor (homepage):
- Newsletter (Phase 24) — Add section → Newsletter → pick provider
- Hero / mega-menu / FAQ / story timeline (Phase 15)
- Cart upsell (Phase 26) — auto-shows in drawer + cart page once enabled in theme settings

Theme editor (product template):
- Add buy-card blocks: BNPL messaging, Delivery & returns, Size guide (Phase 28)
- Add Reviews widget (Phase 25, after wiring an app key)

## 9. Smoke test

- `/` — hero + newsletter + featured + footer with locale selector + cookie banner on first load
- `/collections/all` — facets, sort, grade pills
- `/products/{handle}` — sticky buy card, BNPL, delivery row, size-guide modal opens, reviews mount
- `/cart` — upsell rail, condition pills, CO₂e total
- `/pages/wishlist` — empty state then add 2 items
- `/pages/compare` — 3 columns + per-column ✕
- `/pages/quote` — B2B form
- Switch country in footer → currency follows
- Switch language in footer → page reloads in new locale
- Decline cookies → no GA4 / Pixel / chat scripts in network panel

## 10. Common gotchas

- **No products show up in collections** — smart collections are empty until products are imported. Run step 2 first.
- **Tiered pricing not showing** — the customer must be tagged `b2b` (Settings → Customers → tag) and the product must have `recircle.b2b_tiers` set.
- **Member price not showing** — same: customer needs `member` tag.
- **Subscription picker not showing** — install Shopify Subscriptions or Recharge / Skio / Loop and attach a Selling Plan group to the product first.
- **Reviews widget showing nothing** — install the matching app (Judge.me / Loox / Yotpo) and let it back-fill review data; the theme just renders the mount points.
