# Demo store seeding & reviewer instructions

Shopify Theme Store reviewers will install the theme on their own dev store and
also visit the linked demo store. This file documents what merchants (and our
own demo) must seed for the theme to feel populated and for every USP to render.

## 1. Required entities

| Entity | Min count | Why |
|---|---|---|
| Products | 18+ | Three collections × 6 products each |
| Collections | 3+ | Electronics / Fashion / Furniture |
| Pages | 6+ | Wishlist, Compare, Trade-in, Quote, About, Sustainability |
| Blog articles | 3+ | Editorial PR template + RSS sanity |
| Customer accounts | 2 | One regular + one tagged `b2b,wholesale` |
| Selling plans | 1+ | "Refill every 3 months" group, attached to ≥ 1 product |
| Discount automatic | 1 | "Member 10% off" tied to `member` tag |

## 2. Per-product metafield checklist

All in the `recircle` namespace. The seed kit fills these for every product:

| Key | Type | Example |
|---|---|---|
| `condition_grade` | single_line_text | `A` |
| `co2_saved_kg` | number_decimal | `48.2` |
| `repair_score` | number_integer | `8` |
| `warranty_months` | number_integer | `12` |
| `returns_days` | number_integer | `30` |
| `price_30day_low` | money | `EUR 549.00` |
| `msrp_new` | money | `EUR 1099.00` |
| `passport_id` | single_line_text | `RC-IPH13-001` |
| `materials` | json | `[{"label":"Aluminium","percent":62}, ...]` |
| `origin` | single_line_text | `Refurbished in EU (Lyon, FR)` |
| `recycled_percent` | number_integer | `83` |
| `weight_grams` | number_integer | `204` |
| `battery_health` | number_integer | `95` |
| `serial` | single_line_text | `F2LXNQXXXX` |
| `passport_url` | url | `https://passport.recircle.dev/RC-IPH13-001` |
| `before_image` | file_reference | (image) |
| `after_image` | file_reference | (image) |
| `b2b_tiers` | json | `[{"min_qty":10,"price":499.00},{"min_qty":50,"price":459.00}]` |
| `moq` | number_integer | `1` (or `5` for B2B-only items) |

## 3. Customer setup

Two demo customers — credentials to share with the Shopify reviewer:

| Email | Password | Tags | Used to verify |
|---|---|---|---|
| `reviewer@recircle.demo` | `Refurb-Reviewer-2026` | (none) | Wishlist, Recently-viewed, Subscriptions |
| `b2b-reviewer@recircle.demo` | `Wholesale-Reviewer-2026` | `b2b,wholesale,member` | Member pricing, Tiered pricing, Quote form, Locked content |

Seed both customers with:

- 1 completed order (so `/account` has order history to render)
- `recircle.credits_balance = 1875` (number)
- `recircle.credits_history` (json) with 4–6 entries

## 4. Theme settings preset

Apply this preset on the demo store before screenshots:

| Setting | Value |
|---|---|
| Palette preset | "Forest cream" |
| Font preset | "Editorial — Playfair + Inter" |
| Density preset | "Comfortable" |
| Sticky header | on |
| Wishlist | on |
| Compare | on |
| Recently viewed | on |
| Quick view | on |
| Subscriptions | on |
| B2B mode | on |
| Member pricing | on (tag `member`, percent `10`) |

## 5. Seed automation

```bash
# 1. Configure
cat > .env <<EOF
SHOPIFY_STORE=recircle-demo.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_xxx
EOF

# 2. Seed products + metafields + collections + pages + articles
node seed/seed.mjs

# 3. Push the theme files (fresh upload of all assets/sections/templates)
node scripts/install.mjs

# 4. Manual: in the theme editor, switch to the recommended preset
#    (Theme settings → Design system → Apply "Editorial cream")
```

The seeder is idempotent — re-running won't duplicate products. Customer
records and selling plans must be created once via Admin UI; they are not
covered by `seed.mjs` because they require email verification flows.

## 6. Reviewer instructions block (paste into Partner Dashboard)

> **Demo store**: https://recircle-demo.myshopify.com/?preview_theme_id=189945053365
>
> **Storefront password (if active)**: `recircle2026`
>
> **Customer accounts**:
> - Standard customer — `reviewer@recircle.demo` / `Refurb-Reviewer-2026`
> - B2B / wholesale customer — `b2b-reviewer@recircle.demo` / `Wholesale-Reviewer-2026`
>
> Suggested review path:
> 1. Homepage → click featured collection → PDP
> 2. PDP — observe condition badge, dual price, repairability score, DPP block, before/after slider, sticky buy card
> 3. Add to cart → drawer with CO₂ total
> 4. `/pages/compare` — verify per-column ✕ + grade badges
> 5. `/pages/trade-in` — fill calculator, see live quote
> 6. Sign in as `reviewer@recircle.demo` → `/account` shows ReCircle Credits ledger
> 7. Sign out → sign in as B2B customer → PDP shows tiered-pricing table + member-price pill
> 8. `/pages/quote` — quote-request form
> 9. Switch language to `de` via header → ensure all UI translates
> 10. Resize to mobile (≤ 500 px) — verify sticky-ATC bar appears at bottom of PDP
