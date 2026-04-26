# Performance — ReCircle theme

This theme is engineered for Lighthouse 90+ on Shopify's hosted infrastructure with stock demo data. The optimisations below ship by default; merchant-specific assets (images, custom apps, third-party scripts) determine real-world scores.

## Core Web Vitals targets

| Metric | Target | How we hit it |
|--------|--------|---------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Hero & PDP gallery images use `loading="eager"` + `fetchpriority="high"`; `srcset` + `sizes` deliver right-sized images; `preconnect` to `cdn.shopify.com` |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Every `<img>` has explicit `width`/`height`; media containers have CSS `aspect-ratio`; `contain-intrinsic-size` on grids reserves space for off-screen items |
| **INP** (Interaction to Next Paint) | < 200ms | All JS deferred (`<script defer>`); below-fold sections use `content-visibility: auto`; no layout-thrashing on hover (transforms + opacity only) |
| **FCP** (First Contentful Paint) | < 1.8s | `theme.css` preloaded with `media="print" onload` swap; `font-display: swap` on every face |
| **TTFB** (Time To First Byte) | < 800ms | Shopify-hosted; theme has zero blocking external requests |

## What ships out-of-the-box

### Asset loading
- `theme.css` — `<link rel="preload" as="style" fetchpriority="high">` then async-applied via `media="print" onload="this.media='all'"`
- `theme.js` — `defer` (parses HTML first, executes after DOMContentLoaded)
- `<noscript>` fallback applies the stylesheet immediately if JS is off
- Single concatenated CSS + JS bundle to minimise HTTP round-trips

### Image pipeline
- Every `<img>` includes:
  - `srcset` with 3–4 width breakpoints (300/500/800 for cards, 600/900/1200/1600 for galleries)
  - `sizes` matching the actual rendered width per viewport
  - explicit `width` + `height` attributes
  - `loading="lazy"` (below the fold) or `loading="eager"` + `fetchpriority="high"` (LCP candidates: hero, PDP gallery main, article hero, header logo)
  - `decoding="async"`
- Shopify CDN serves WebP/AVIF automatically based on the `Accept` header — no theme-side conversion needed
- 2x retina variants on small avatar/thumb images via `srcset="…1x, …2x"` micro-syntax

### Font strategy
- `font_face: font_display: 'swap'` for body, body-bold, body-italic, heading
- `<link rel="preconnect" href="https://fonts.shopifycdn.com" crossorigin>`
- No `@import` or external font CDN — all fonts come from Shopify's hosted font CDN

### CLS prevention
- `contain: layout paint` on every media container
- `aspect-ratio` set on `.product-card__media` (4/5), `.article-card__media` (16/10), `.collection-list__link` (4/3), `.cart-line__media` (1/1)
- `contain-intrinsic-size` on `.collection-grid`, `.editorial-grid--articles`, `.cart-lines`, `.recently-viewed-rail`
- Per-item `contain-intrinsic-size` on `.product-card` (380px) and `.article-card` (360px)
- `img { max-width: 100%; height: auto; }` with `img[width][height]` retains `height: auto` so explicit dimensions don't break responsive scaling

### Below-the-fold deferral
`content-visibility: auto` defers paint + layout for off-screen sections in supporting browsers (Chromium, Edge). Massive TBT/INP win on long collection grids, paginated blogs, and multi-line carts.

## Liquid optimisations

- No `{% include %}` (deprecated, slower) — only `{% render %}` (isolated scope, parser-cached)
- Card snippets read metafields **once** with `assign`, not per-iteration
- Predictive search renders via Shopify's `section_id` mechanism — server returns only the rendered HTML fragment
- `{% paginate %}` blocks limit collections to 24, blogs to 12

## Merchant tuning checklist

When you go live, replace the demo assets with production ones — these have the biggest perf impact:

- [ ] **Logo** — keep under 80 KB; use SVG if possible
- [ ] **Hero image** — JPEG/WebP, ≤ 200 KB at 1600 wide, no transparency; aim for 200–400 KB total page weight from the hero block
- [ ] **Product photos** — 1200×1200 JPEG, ≤ 150 KB; Shopify auto-generates AVIF/WebP variants
- [ ] **Article hero images** — 1600×900, ≤ 250 KB
- [ ] **Favicon** — 32×32 PNG/ICO
- [ ] **Custom apps / pixel scripts** — audit each one in Shopify Admin → Apps; remove unused; insist 3rd-parties use `defer` or `async`
- [ ] **Theme settings → "Apps blocks"** — disable any block whose data isn't actually used
- [ ] **Custom CSS / JS** — added via theme settings or `additional-checkout-scripts`? Audit for inline blocking code

## How to measure

Run Lighthouse against `https://<your-store>.myshopify.com/?preview_theme_id=<id>` from a clean Chrome profile in incognito to bypass CDN caches and dev-store password-screens. For published themes, use the storefront URL directly.

Recommended test pages:
- **Homepage** (hero + featured collection — LCP-sensitive)
- **PDP** (`/products/<handle>` — gallery + buy card)
- **Collection** (`/collections/all` — grid with content-visibility + lazy images)
- **Cart** (`/cart` — sticky summary)

## Performance budget

| Resource | Budget |
|----------|--------|
| Total page weight (homepage) | < 1.2 MB |
| HTML | < 60 KB |
| CSS (`theme.css`) | < 70 KB gzipped |
| JS (`theme.js`) | < 35 KB gzipped |
| Webfonts | < 120 KB total |
| Hero LCP image | < 250 KB |
| Number of HTTP requests | < 40 |

## Known trade-offs

- We deliberately ship a single CSS file rather than splitting per template. On Shopify, a single cached CSS file across pages outperforms split files in real-world navigation patterns (cache hits dominate).
- `theme.js` is a single file rather than ES modules. Same logic — Shopify's CDN + browser caching make a single bundle faster end-to-end than per-template imports.
- `content-visibility: auto` is unsupported in Safari < 18; degrades gracefully (full paint, no perf regression — only no benefit).

## Reporting issues

If Lighthouse reports < 90 on the published theme with stock demo data, open an issue with:
1. Lighthouse JSON report (drag-drop into the issue)
2. URL tested
3. Network throttling preset (Mobile / Desktop)
4. Browser version

Most score regressions come from merchant-side assets (oversized hero, bloated app scripts) — the issue template will walk you through eliminating those first.
