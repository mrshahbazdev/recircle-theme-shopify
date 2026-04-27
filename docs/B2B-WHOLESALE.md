# B2B / wholesale guide

Phase 20 ships four pieces that turn the storefront into a self-service
wholesale shop without a third-party B2B app:

1. **Tiered pricing display** on the PDP for B2B-tagged customers
2. **Minimum order quantity (MOQ)** enforcement on the PDP qty input
3. **Quote-request form** as a standalone page (`/pages/quote`)
4. **Tag-locked content** section to gate any block of content behind a tag

All four are off by default. Master toggle:
**Theme settings → B2B / wholesale → Enable B2B features.**

## 1. Tiered pricing

PDP renders a price-break table to logged-in customers tagged with any of
the comma-separated tags in `settings.b2b_tags` (default: `b2b,wholesale`).
Powered by a single product metafield:

| Namespace | Key | Type |
|-----------|-----|------|
| `recircle` | `b2b_tiers` | `json` |

Schema:

```json
[
  { "min_qty": 5,  "price": 1349.10 },
  { "min_qty": 10, "price": 1199.00 },
  { "min_qty": 25, "price": 1049.00 }
]
```

Prices are in major currency units; the theme renders them with the `money`
filter. The displayed prices are **for communication** — actual checkout
discount is delivered via Shopify automatic discounts targeting the same
tag segment + qty thresholds.

## 2. Minimum order quantity (MOQ)

Per-product override via metafield:

| Namespace | Key | Type | Notes |
|-----------|-----|------|-------|
| `recircle` | `moq` | `number_integer` | minimum units per order; applies to all customers |

When set, the qty input's `min` attr + initial `value` are bumped to MOQ,
and a small caption ("Minimum order: 5") renders next to the qty stepper.
If a customer tries to submit below MOQ, the form is blocked with an inline
error and the qty is auto-reset.

## 3. Quote-request page

`sections/quote-request.liquid` ships with:

- Centered editorial heading + intro
- Bullet block list (default 3 items: Tiered pricing / Net-30 terms / Warranty)
- Form with: name, work email, company, VAT/Tax ID, country, phone,
  products of interest, annual volume, notes
- Submit posts via Shopify's built-in `{% form 'contact' %}` so the request
  arrives in the shop's contact-form inbox + appears under
  Settings → Notifications

Wire it up:

1. Theme editor → Add a new page → template **page.quote**
2. Or in Admin → **Online Store → Pages → Add page**, set page handle
   `quote` and template `page.quote`
3. Add link to the main menu

The hidden field `contact[type]=b2b-quote` makes it easy to filter or
auto-tag in your inbox / Shopify Flow.

## 4. Tag-locked content

`sections/locked-content.liquid` gates a rich-text block behind one or more
customer tags (comma-separated). When the visitor isn't logged in or
doesn't have a matching tag, a centred gate card renders with:

- Eyebrow + heading + body
- "Sign in" button → `/account/login`
- Optional "Request access" button → URL of your choice (e.g. `/pages/quote`)

When the visitor has a matching tag, the rich-text block renders.

Drop into any page / collection / template via the theme editor →
**Add section → Tag-locked content**.

## Settings reference

| Setting | Default | Purpose |
|---------|---------|---------|
| `b2b_enabled` | off | master toggle for tiered-pricing snippet |
| `b2b_tags` | `b2b,wholesale` | comma-separated customer tags |

## Files

- `snippets/b2b-tiered-pricing.liquid`
- `snippets/b2b-moq.liquid`
- `sections/quote-request.liquid` + `templates/page.quote.json`
- `sections/locked-content.liquid`
- `assets/theme.js` (`initB2BMOQ`)
- `assets/theme.css` (component styles)
- `config/settings_schema.json` (B2B / wholesale section)
- `locales/*.json` (`recircle.b2b.*`)
