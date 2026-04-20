# Shopify Theme Store submission checklist

Tracks ReCircle's readiness for https://themes.shopify.com. Use this as a pre-flight before opening a submission at **Partner Dashboard → Themes → Create theme listing**.

## 1. Requirements mapping

Shopify's requirements live at https://shopify.dev/docs/themes/store/requirements. Status column: ✅ done · 🟡 in progress · ⬜ deferred.

### Architecture
| Requirement | Status | File / note |
|---|---|---|
| Online Store 2.0 | ✅ | JSON templates + sections + blocks throughout |
| `config/settings_schema.json` with required groups | ✅ | Brand, typography, layout, social, favicon |
| `locales/en.default.json` + `en.default.schema.json` | ✅ | Both present |
| Section group architecture (header-group, footer-group) | ✅ | `sections/header-group.json`, `sections/footer-group.json` |
| No hard-coded strings | ✅ | All text via `{{ 'key' | t }}` |
| No external fonts (use `font_picker`) | ✅ | Shopify font-picker only |

### Required templates
| Template | Status |
|---|---|
| `index` | ✅ (+ 3 niche variants) |
| `product` | ✅ |
| `collection` | ✅ |
| `list-collections` | ✅ |
| `blog` | ✅ |
| `article` | ✅ |
| `page` | ✅ (+ trade-in, sustainability variants) |
| `search` | ✅ |
| `cart` | ✅ |
| `404` | ✅ |
| `gift_card` | ✅ |
| `password` | ✅ |
| `customers/*` | ✅ (account, login, register, orders, addresses, reset) |

### Performance (Lighthouse)
| Target | Approach | Status |
|---|---|---|
| Performance ≥ 60 (required), 90+ (goal) | Preload theme.css & theme.js, defer JS, responsive srcsets, decoding=async, fetchpriority on LCP images | 🟡 run Lighthouse on live dev store |
| First product page LCP < 2.5s | `product-gallery.liquid` eager+high priority on featured image | 🟡 verify |
| Total JS < 100 KB | Vanilla JS, no framework | ✅ |
| Total CSS < 150 KB | Single `theme.css`, ~40 KB unminified | ✅ |
| No render-blocking | `media="print" onload="this.media='all'"` on CSS | ✅ |

Run Lighthouse:
```bash
npx lighthouse https://your-dev-store.myshopify.com/ --view
npx lighthouse https://your-dev-store.myshopify.com/products/demo --view
```

### Accessibility (WCAG 2.2 AA)
| Criterion | Status | Note |
|---|---|---|
| Skip-to-content link | ✅ | `layout/theme.liquid` |
| Visible focus ring | ✅ | `:focus-visible` in `theme.css` |
| `prefers-reduced-motion` | ✅ | Media query disables animations |
| ARIA on modals | ✅ | Cart drawer + predictive search: role=dialog, aria-modal, focus-trap |
| ARIA live regions | ✅ | `[data-a11y-announce]` on cart/search updates |
| `aria-current` on active nav | ✅ | `header.liquid` + `main-product.liquid` |
| Colour contrast ≥ 4.5:1 | 🟡 | Defaults pass; merchants can override — document |
| Form labels on every input | ✅ | Including trade-in, search, newsletter |
| Heading hierarchy (one h1 per page) | 🟡 | Audit on live preview |
| Reduced-motion animations | ✅ | Respected |

### Code quality
| Check | Status |
|---|---|
| `theme-check` passes | 🟡 run `theme-check .` locally |
| No inline `<style>` beyond theme.liquid token block | ✅ |
| No `<script>` with remote URLs | ✅ |
| No deprecated `{% include %}` | ✅ all `{% render %}` |
| All sections have `{% schema %}` | ✅ |
| All snippets accept explicit parameters (no globals) | ✅ |

## 2. Submission materials

### Theme listing copy
Draft in [`DESCRIPTION.md`](./DESCRIPTION.md).

### Screenshots
Shopify requires:
- 1x cover image (**1200×800**)
- 1x thumbnail (**600×900**)
- 5+ feature screenshots (**1440×900**, desktop)
- Mobile screenshots (**375×812** or similar)

Capture on a populated dev store. Suggested shot list:
1. Electronics homepage (hero + stats)
2. Fashion homepage (hero + grid)
3. Furniture homepage (hero + stats)
4. Product page with condition badge, warranty bar, DPP block, before/after slider
5. Cart drawer open with 2 items
6. Predictive search open with results
7. Trade-in calculator in action
8. Mobile product page
9. Mobile cart drawer

### Demo store
Shopify reviewers need a demo `.myshopify.com` URL with:
- All templates populated with representative content
- At least 15–20 products in 3+ collections
- Metafields filled for ≥ 5 products (condition, CO₂, warranty, DPP, before/after)
- At least 1 blog article
- Privacy + refund + ToS pages

## 3. Go-to-market after approval

- Pricing: **$320** (Shopify Theme Store minimum for new themes).
- Post-launch iteration windows: every ~2 weeks.
- Support SLA: 48h response, 10 days-a-month required by Shopify.
- Monitor average rating — below 3 stars = delisted.

## 4. Pre-submission sanity script

```bash
# From repo root
theme-check .                          # must pass with 0 errors
shopify theme check                    # same, via CLI

# Lighthouse on dev store (requires a live preview)
npx lighthouse https://STORE.myshopify.com/ --only-categories=performance,accessibility,best-practices,seo --output html --output-path ./lh-home.html
npx lighthouse https://STORE.myshopify.com/products/demo --only-categories=performance,accessibility,best-practices,seo --output html --output-path ./lh-product.html
```

Attach `lh-*.html` reports to the submission.

## 5. Status

- ✅ Architecture, templates, i18n, metafield-driven features
- ✅ AJAX cart drawer, predictive search, trade-in calculator, a11y pass
- 🟡 Lighthouse verification (requires dev store URL)
- 🟡 Screenshots + demo store content (requires dev store)
- ⬜ Actual submission (awaiting reviewer-ready demo store)
