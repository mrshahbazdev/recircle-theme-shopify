# SEO, structured data, sitemap & GMC feed alignment (Phase 30)

## 1. JSON-LD coverage

| Page type | Schema | Snippet |
|---|---|---|
| All pages | `BreadcrumbList` (auto-detects template chain) | `snippets/json-ld-breadcrumb.liquid` |
| Homepage  | `Organization` + `WebSite` (with `SearchAction`) | `snippets/json-ld-organization.liquid` |
| Product   | `Product` with `gtin`, `mpn`, `brand`, `itemCondition=RefurbishedCondition`, `additionalProperty[]` (Condition grade / Repair score / CO₂ saved), `aggregateRating`, `Offer.warranty` | inline in `sections/main-product.liquid` |
| Article   | `Article` with author, datePublished, dateModified, publisher.logo | `snippets/json-ld-article.liquid` |

Validate live URLs at <https://search.google.com/test/rich-results>.

## 2. Sitemap & robots.txt

- Shopify auto-generates `/sitemap.xml` (and per-language sitemaps when locales are published).
- `templates/robots.txt.liquid` overrides the default robots:
  - keeps Shopify's default disallow rules
  - adds `Disallow: /*?*filter*` and pagination/sort variants to suppress duplicate-content URLs
  - explicitly allows `/products` and `/collections`
  - emits the auto-generated sitemap URL in every UA group

## 3. Google Merchant Center feed alignment

The theme surfaces every field GMC's "refurbished" template requires:

| GMC field | Source |
|---|---|
| `id` | Shopify variant ID |
| `title` | `product.title` |
| `description` | `product.description` |
| `link` | `product.url` |
| `image_link` | `product.featured_image` |
| `price` | `product.price` (cents → currency) |
| `availability` | `variant.available` |
| `condition` | `refurbished` (mapped from `itemCondition=RefurbishedCondition`) |
| `gtin` | `variant.barcode` (set in Admin → Variant → Barcode) |
| `mpn` | `variant.sku` |
| `brand` | `product.vendor` |
| `product_highlight[]` | `recircle.condition_grade`, `recircle.warranty_months`, `recircle.co2_saved_kg`, `recircle.repair_score` |
| `custom_label_0` | `recircle.condition_grade` (use to build "Grade A / B / C" GMC campaigns) |

To produce the feed, install **Google & YouTube** sales channel in Admin → Apps → Google Channel; it auto-reads the structured data we now emit. Map the recircle metafields to product highlights in the channel's "Configuration" panel.

## 4. EU Digital Product Passport (DPP) prep

The theme already reads two metafields:
- `recircle.dpp_id` — the unique DPP identifier from your registry (e.g. EU DPP-API)
- `recircle.dpp_url` — public landing URL

`snippets/dpp-passport.liquid` renders a "Digital Product Passport" badge linking to the URL. For the EU **ESPR / DPP** rules (battery passport applies from Feb 2027, textiles from 2028), prep checklist:

1. Decide the registry — likely a national chamber of commerce DPP gateway, EBSI, or a private aggregator (Circulor, Optel, Avery Dennison atma.io).
2. Mint a DPP record per **variant** (not per product) including: bill of materials, refurbisher chain-of-custody, repair history, end-of-life instructions.
3. Save the registry's DPP URL to `recircle.dpp_url` per variant via Admin → Variants → Metafields, OR via the Admin API:
   ```
   mutation { metafieldsSet(metafields: [{
     ownerId: "gid://shopify/ProductVariant/123",
     namespace: "recircle", key: "dpp_url", type: "url",
     value: "https://dpp.example.eu/passport/abc123"
   }]) { metafields { id } } }
   ```
4. The PDP badge auto-renders with the link.
5. (Optional) Generate a QR code on the printed packing slip pointing to the same URL — most label printers can render QR from a Liquid template variable.

## 5. WCAG 2.2 AA — Phase 30 audit

Re-audit (manual + axe-core) confirmed no NEW violations introduced by Phases 23–28:
- Cookie banner (Phase 23) — keyboard-trapped, Esc closes, focus restored
- Newsletter form (Phase 24) — labels + aria-describedby for inline error
- Reviews mount (Phase 25) — provider widgets are 3rd-party; theme adds `aria-label` to mount container
- Cart upsell rail (Phase 26) — list semantics + aria-live announcement on quantity change
- Locale selector (Phase 27) — native `<select>` + `:focus-within` ring, flag has `aria-hidden="true"`
- Size guide (Phase 28) — native `<dialog>` (keyboard + Esc + focus return for free)
- BNPL (Phase 28) — provider widgets surface their own a11y; theme fallback uses semantic `<p>`
- Chat hook (Phase 28) — consent-gated, no page-load impact

See `docs/ACCESSIBILITY.md` for the full Phase 13 baseline.
