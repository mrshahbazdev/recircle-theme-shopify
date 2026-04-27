# ReCircle — Analytics integration

Phase 17 wires GA4 + Meta Pixel + a set of custom storefront events into the
theme. All providers are **opt-in** — leave the IDs blank in theme settings to
disable.

## Setup

1. **Theme settings → Analytics**
   - **GA4 Measurement ID** — `G-XXXXXXXXXX` from Google Analytics → Admin → Data Streams
   - **Meta Pixel ID** — numeric ID from Meta Events Manager
2. (Optional) Toggle **"Default consent to denied (Consent Mode v2)"** for EU
   markets. Your cookie banner must call `window.recircleAnalytics.grantConsent()`
   after the visitor accepts.
3. (Optional) Toggle **"Debug mode"** while wiring up — logs every event to the
   browser console (prefixed `[recircle-analytics]`).

## Events fired automatically

### GA4 (Enhanced Ecommerce v2)

| Event              | Trigger                                             |
| ------------------ | --------------------------------------------------- |
| `page_view`        | every page (built-in to gtag.js `config`)           |
| `view_item`        | PDP load                                            |
| `view_item_list`   | collection / search results                         |
| `view_cart`        | `/cart`                                             |
| `search`           | `/search` results page                              |
| `add_to_cart`      | PDP form submit + wishlist quick-ATC                |
| `remove_from_cart` | cart-drawer remove (when fired from theme)          |
| `add_to_wishlist`  | heart icon on card / PDP                            |
| `compare_add`      | compare icon on card                                |
| `compare_remove`   | compare-page column ✕                               |
| `compare_view`     | `/pages/compare` open                               |
| `view_item_quick`  | quick-view modal open                               |
| `trade_in_quote`   | every recompute of the trade-in calculator          |
| `generate_lead`    | trade-in form submit (after the user clicks Submit) |

### Meta Pixel

| Event              | Trigger                                  |
| ------------------ | ---------------------------------------- |
| `PageView`         | every page                               |
| `ViewContent`      | PDP load                                 |
| `Search`           | `/search`                                |
| `AddToCart`        | PDP / wishlist quick-ATC                 |
| `AddToWishlist`    | heart icon                               |
| `Lead`             | trade-in form submit                     |
| `refurb_grade_view`| custom — fired with PDP grade            |
| `co2_savings_view` | custom — fired with PDP CO₂ kg           |
| `compare_add` / `compare_remove` / `compare_view` | custom |
| `quick_view`       | custom                                   |
| `trade_in_quote`   | custom                                   |
| `wishlist_remove`  | custom                                   |

## Purchase event (manual step)

Shopify's hosted checkout & thank-you page do **not** run theme code. To track
`purchase` events you have two options:

### Option A — Shopify Custom Pixel (recommended)

1. Admin → **Settings → Customer events → Add custom pixel**
2. Paste the snippet from `email-templates/README.md` (Custom Pixel section)
   *(or copy from `docs/CUSTOM-PIXEL-PURCHASE.js`)*
3. Connect your GA4 / Meta credentials in the pixel sandbox

This runs server-side via Shopify and fires `purchase` to GA4 + `Purchase` to
Meta with the real order data.

### Option B — Shopify Plus checkout extensibility

If you have Plus, use **Checkout Extensions → Web Pixel** with the same script.
Same event payload, runs in checkout sandbox.

## Custom event payloads

All events bubble through the document. You can listen for them from a custom
script:

```js
document.addEventListener('recircle:atc', (e) => {
  console.log('user added to cart', e.detail);
  // { id, variant_id, name, price, quantity, currency }
});
```

| Event name                      | `detail` shape                                    |
| ------------------------------- | ------------------------------------------------- |
| `recircle:atc`                  | `{ id, variant_id, name, price, quantity, currency }` |
| `recircle:remove_from_cart`     | `{ id, variant_id, name, price, quantity }`       |
| `recircle:begin_checkout`       | `{ value, items }`                                |
| `recircle:wishlist:add`         | `{ id }`                                          |
| `recircle:wishlist:remove`      | `{ id }`                                          |
| `recircle:wishlist:change`      | `{ list }`                                        |
| `recircle:compare:add`          | `{ id }`                                          |
| `recircle:compare:remove`       | `{ id }`                                          |
| `recircle:compare:view`         | `{}`                                              |
| `recircle:quick-view:open`      | `{ id }` (handle)                                 |
| `recircle:trade-in:quote`       | `{ brand, grade, age_years, value, currency }`    |
| `recircle:trade-in:submit`      | `{ brand, grade, age_years, value, currency }`    |

These run regardless of whether GA4 / Meta are configured, so you can use them
for in-house analytics, Klaviyo Web Tracking, Segment, or any third-party tag.

## Privacy

- **No PII** is sent to either provider by default
- `customerId` (Shopify customer ID, integer) is exposed on `window.recircleAnalytics`
  but **not** auto-attached to events. Add it manually if you want logged-in
  attribution.
- Consent Mode v2 ships denied-by-default when the toggle is on. Call
  `window.recircleAnalytics.grantConsent()` from your cookie banner to upgrade.
