# Cart upsell / cross-sell rail

Phase 26 ships a recommended-products rail that renders inside the cart drawer **and** at the bottom of the cart page.

## Two source modes

1. **Manual** — enter comma-separated product handles in **Theme settings → Cart upsell → Manual product handles**. The rail renders exactly those products in order, server-side via Liquid.
2. **Automatic** — leave the manual field blank. The theme calls `/recommendations/products.json?product_id={first_cart_item}&limit=N&intent=related` after the cart drawer opens. Requires Shopify's free **Search & Discovery** app for results to flow.

If the API returns an empty list, the rail hides itself.

## Add-to-cart

Each card has an **Add** button that POSTs to `/cart/add.js` and dispatches a `recircle:cart:update` DOM event. The cart drawer is then re-fetched via `?section_id=cart-drawer` and re-rendered in place — no page reload, no double-counted items.

```js
document.addEventListener('recircle:cart:update', (e) => {
  console.log(e.detail); // { source: 'cart-upsell', variantId: '…' }
});
```

## Settings

| Setting | Default | Notes |
|---|---|---|
| `cart_upsell_enabled` | `true` | Master switch |
| `cart_upsell_handles` | `''` | Manual override |
| `cart_upsell_limit` | `4` | 2–6 cards |

## Where it renders

- `snippets/cart-drawer-contents.liquid` — bottom of drawer body, when cart has ≥ 1 line item
- `sections/main-cart.liquid` — below the cart form, before the empty state

The same `snippets/cart-upsell.liquid` is rendered from both spots, so any future styling change automatically applies to both surfaces.

## Excluded products

The first cart line's product is excluded from the rail server-side (manual mode) and via the `intent=related` API parameter (auto mode), so customers don't see a recommendation for a product already in their basket.
