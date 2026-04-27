# Product reviews

Phase 25 wires the theme to four review providers via theme settings. The theme renders **placeholder mounts** that each provider's JavaScript auto-detects and hydrates — no custom JS, no extra CDN scripts.

## Picking a provider

Theme settings → **Reviews** → **Reviews provider**:

| Value | App on Shopify App Store |
|---|---|
| `none` | Hides all review UI. |
| `judgeme` | [Judge.me](https://apps.shopify.com/judgeme) |
| `loox` | [Loox](https://apps.shopify.com/loox) |
| `yotpo` | [Yotpo](https://apps.shopify.com/yotpo-social-reviews) |
| `shopify` | Legacy Shopify Product Reviews app |

Toggles:
- **Show star rating on product cards** (`reviews_show_on_card`)
- **Show full reviews block on product page** (`reviews_show_on_pdp`)

Yotpo also requires its **App key** (Yotpo Admin → Settings → General → API Key).

## What renders where

- `snippets/reviews-stars.liquid` is rendered inside `snippets/product-card.liquid` (under the title) and inside `sections/main-product.liquid` (next to the title block). Each provider gets its preferred star/badge mount markup.
- `snippets/reviews-widget.liquid` is rendered at the bottom of the PDP `.product-details` row. Each provider mounts its full reviews UI here.

## CLS protection

Each widget mount has a `min-height: 120px` reserved in `assets/theme.css` so the page does not jump while the provider's JS hydrates.

## Switching provider

Just change the **Reviews provider** select. The new provider's mount markup renders on the next page load; the old provider's app must be uninstalled separately.

## Per-product control

Set `product.metafields.recircle.reviews_off` (boolean) to `true` to hide both the stars and full widget on a specific product (custom override — wire it in your store's metafield definitions if you need it).
