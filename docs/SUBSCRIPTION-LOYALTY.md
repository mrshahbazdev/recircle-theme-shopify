# Subscription, member pricing & ReCircle Credits

Phase 19 ships three monetisation features that hook into Shopify's native data
model — **no third-party app is strictly required**, but the integration points
are designed to slot existing apps cleanly into the theme.

## 1. Subscriptions (selling-plan picker)

The PDP buy form auto-renders a `<fieldset class="subscription-options">`
when the product has any selling-plan allocations:

```
[ ] One-time purchase                € 1,499.00
[x] Subscribe & save 10% — every 30 days   € 1,349.10
[ ] Repair-care plan — every 12 months     € 49.00
```

The hidden `<input name="selling_plan">` is updated by `theme.js`
(`initSubscriptionPicker()`) on every radio change, so the existing
`/cart/add.js` flow attaches the plan to the cart line.

### How to enable

Use any of:
- **Shopify Subscriptions** (free, native) — Apps → Shopify Subscriptions →
  attach a plan group to the product
- **Recharge / Skio / Loop / Awtomic** — they all write to Shopify's
  `selling_plan_groups` API, so the picker just works
- **Manual via Admin API** — POST `/admin/api/2024-07/selling_plan_groups.json`

The picker fires `recircle:selling-plan:change` on every change so analytics
or app integrations can react.

## 2. Member pricing

Customers tagged with the configured tag see an alternate price + badge on the
PDP. Non-members optionally see a "Members save 10% — Sign in →" teaser pill.

### Settings (theme editor → Theme settings → Subscription & loyalty)

| Setting | Default | Notes |
|---------|---------|-------|
| `member_pricing_enabled` | off | master toggle |
| `member_tag` | `member` | exact match against `customer.tags` |
| `member_discount_percent` | 10 | range 0–50 |
| `member_pricing_teaser` | on | show pill to logged-out / non-tagged visitors |

### Per-product price override

Optional product metafield to override the percentage:

| Namespace | Key | Type | Notes |
|-----------|-----|------|-------|
| `recircle` | `member_price` | `number_decimal` | exact member price in major currency units (e.g. `1349.10`) |

Falls back to `(variant.price × (100 − discount%))` when no override.

> ⚠️ This is a **display** price. Actual checkout discount is delivered via a
> regular Shopify automatic discount targeting the same customer-tag segment.
> The badge tells the visitor what they'll pay; the discount engine does the
> arithmetic at checkout. See
> https://help.shopify.com/en/manual/discounts/discount-types/automatic-discounts
> for tag-based automatic discounts.

## 3. ReCircle Credits (loyalty ledger)

A read-only credits panel renders on `/account` (toggle via Account section
schema). Credits balance + history come from customer metafields:

| Namespace | Key | Type | Shape |
|-----------|-----|------|-------|
| `recircle` | `credits_balance` | `number_decimal` | spendable balance, store-currency major units |
| `recircle` | `credits_history` | `json` | `[{date:"YYYY-MM-DD", type:"earn|spend|tradein|refund", amount: 12.50, note:"Order #1024"}]` |

The theme renders the last 5 history entries with positive/negative styling.

### Wiring credits

Pick one (or combine):

- **Loyalty app** (Smile, LoyaltyLion, Yotpo) → configure to write to the
  `recircle.credits_*` customer metafields. Most loyalty apps support custom
  metafields.
- **Shopify Flow** → on `Order paid` trigger, increment `credits_balance` by
  5% and append to `credits_history`. Free, no app required.
- **Server-side webhook handler** → consume `orders/paid`, write back via
  Admin GraphQL `customerUpdate(metafields: [...])`.

Spending credits at checkout is delivered via a Shopify automatic discount
(or a discount-code generator on a Flow trigger). The theme does not
auto-apply credits — it just displays the balance.

## Custom events

Theme.js dispatches:

| Event | Detail | When |
|-------|--------|------|
| `recircle:selling-plan:change` | `{ sellingPlan: "<id>" \| null }` | radio change in the subscription picker |

## Files

- `snippets/subscription-options.liquid`
- `snippets/member-price.liquid`
- `snippets/loyalty-credits.liquid`
- `sections/main-product.liquid` (renders both buy-side snippets)
- `sections/main-account.liquid` (renders loyalty-credits)
- `assets/theme.js` (`initSubscriptionPicker`)
- `assets/theme.css` (component styles)
- `config/settings_schema.json` (Subscription & loyalty section)
- `locales/*.json` (`products.subscription.*`, `products.member.*`, `recircle.loyalty.*`)
