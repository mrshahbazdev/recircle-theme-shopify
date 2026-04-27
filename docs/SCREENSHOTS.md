# Screenshot capture guide

Shopify Theme Store requires a specific set of screenshot assets at exact sizes.
This file lists every shot, the page state needed, and the exact viewport.

The `scripts/screenshots.mjs` Playwright script automates the desktop captures
once the demo store is seeded and the theme is published as preview.

## Required asset matrix

| # | File | Size (W × H) | Purpose | Page | State |
|---|---|---|---|---|---|
| 1 | `screenshots/cover.jpg` | 1200 × 800 | Theme listing cover | `/` (electronics home) | Hero visible, no banners |
| 2 | `screenshots/thumbnail.jpg` | 600 × 900 | Tile in theme grid | `/products/iphone-13-pro-refurbished` | Full PDP, sticky card pinned |
| 3 | `screenshots/feature-01-pdp-desktop.jpg` | 1440 × 900 | PDP hero | `/products/...` | Gallery + buy-card + warranty bar |
| 4 | `screenshots/feature-02-collection.jpg` | 1440 × 900 | Filtered grid | `/collections/all` | Condition + brand facets active |
| 5 | `screenshots/feature-03-cart.jpg` | 1440 × 900 | Drawer | `/?cart=open` | Drawer open, 2 lines, CO₂ total |
| 6 | `screenshots/feature-04-trade-in.jpg` | 1440 × 900 | Trade-in calc | `/pages/trade-in` | Filled inputs + live quote |
| 7 | `screenshots/feature-05-dpp.jpg` | 1440 × 900 | DPP block | `/products/...#dpp` | Materials + origin + recycled% |
| 8 | `screenshots/feature-06-compare.jpg` | 1440 × 900 | Compare table | `/pages/compare` | 3 columns, ✕ buttons visible |
| 9 | `screenshots/feature-07-account-credits.jpg` | 1440 × 900 | Loyalty | `/account` | Balance card + history table |
| 10 | `screenshots/feature-08-b2b-quote.jpg` | 1440 × 900 | Quote form | `/pages/quote` | Form filled but not submitted |
| 11 | `screenshots/mobile-01-pdp.jpg` | 375 × 812 | Mobile PDP | `/products/...` | Sticky ATC at bottom |
| 12 | `screenshots/mobile-02-cart.jpg` | 375 × 812 | Mobile drawer | `/?cart=open` | 2 lines + CO₂ total |
| 13 | `screenshots/mobile-03-search.jpg` | 375 × 812 | Predictive search | `/?search=open&q=iphone` | 4 results visible |
| 14 | `screenshots/og-default.jpg` | 1200 × 630 | OG share | `/` | Hero + theme name overlay |

## Page-state preconditions

Before running the capture script:

- Demo store seeded (run `node seed/seed.mjs` then `node scripts/install.mjs`)
- Theme published OR previewable at `?preview_theme_id=...`
- For wishlist/compare shots, the script seeds local-storage in-page
- For cart shot, the script POSTs `/cart/add.js` with 2 variant IDs from seed data
- For loyalty shot, the seeded customer must have `recircle.credits_balance = 1875`
  and a populated `recircle.credits_history` (seed already includes this)
- For B2B shots, the seeded customer's tag list must include `b2b` so the
  tiered-pricing snippet + locked-content section render

## Branding rules (Shopify)

- Cover + thumbnail: NO text overlays, NO logo over the imagery, NO mockup frames
- Use real-looking products (the seed kit ships these)
- No watermarks, no app banners
- Same theme variant across all screenshots — pick one design preset and stick with it

## Capture command

```bash
# from repo root, with seeded demo store ready:
SHOPIFY_STORE=recircle-demo.myshopify.com \
THEME_ID=189945053365 \
STOREFRONT_PASSWORD=your-dev-pwd \
node scripts/screenshots.mjs
```

The script saves all 14 assets to `screenshots/`. Run optipng/jpegoptim before
uploading to keep each file under 500 KB.

## Manual fallback

If Playwright fails (Chromium not installed, network blocked, etc.), capture
manually with Chrome DevTools "Capture full size screenshot" at the exact
viewport widths in the matrix. macOS: `Cmd+Shift+P` → type "screenshot".
