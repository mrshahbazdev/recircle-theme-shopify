# Customising ReCircle

Everything merchant-editable lives in the theme editor — **no code changes required** for colours, typography, sections, blocks, or the trade-in pricing table.

## Global settings (`Theme settings`)

| Group | Key controls |
|---|---|
| **Brand** | brand, brand-hover, accent, amber, text, muted-text, background, subtle-background, border |
| **Condition grade colours** | one colour per grade (A/B/C/D) — used on badges + filters |
| **Typography** | heading font + body font (Shopify font-picker, automatic preload) |
| **Layout** | page width, section spacing, corner radius |
| **Feature toggles** | CO₂ badge on cards, dual-price display, warranty bar, repairability ring, before/after slider, DPP block, trade-in calculator, 8 toggles total |
| **Favicon + social** | favicon, social links for the footer |

## Custom sections shipped

All sections can be dropped onto any JSON template via the editor. Each supports presets and i18n'd labels.

| Section | Purpose | Niche fit |
|---|---|---|
| `refurbished-hero` | Lifestyle hero with stat blocks | All |
| `condition-grade-explainer` | 4-grade legend (A/B/C/D) | All |
| `how-refurbishment-works` | 3–6 step process, icons | All |
| `co2-impact-counter` | Total CO₂ saved, animated | All |
| `sustainability-stats` | 2–4 stat tiles | All |
| `featured-collection` | Product grid | All |
| `trade-in-calculator` | Metaobject-driven quote | Electronics, fashion |
| `predictive-search` | Header dropdown | All |
| `cart-drawer` | AJAX side drawer | All |
| `rich-text` | Freeform content | All |

## Trade-in calculator pricing

The calculator reads a JSON pricing table generated from **section blocks + section settings**:

- **Section settings:** `currency_code`, `currency_symbol`, `multiplier_a|b|c|d`, `age_decay_per_year`, `min_age_factor`, `show_pricing_table`
- **Per-brand blocks:** `key` (slug), `label`, `base_price`

Formula (runs in `assets/theme.js`):

```
quote = base_price * condition_multiplier * max(min_age_factor, 1 - age_years * age_decay_per_year)
```

### Example

A 2-year-old **grade-B** iPhone (base €600, multiplier_b `0.65`, decay `0.12/year`):

```
600 * 0.65 * max(0.40, 1 - 2*0.12)
= 600 * 0.65 * 0.76
= €296.40
```

## Localisation

Six locales ship by default:

- `en.default.json` (source of truth)
- `de.json` (Deutsch)
- `fr.json` (Français)
- `it.json` (Italiano)
- `es.json` (Español)
- `nl.json` (Nederlands)

To add a locale, copy `en.default.json` → `xx.json`, translate, and Shopify picks it up automatically. All user-facing strings are i18n'd — no hard-coded copy in templates.

## Demo content variants

Three niche home templates:

| Template | Target merchant |
|---|---|
| `templates/index.electronics.json` | Phones, laptops, tablets |
| `templates/index.fashion.json` | Pre-loved / second-hand apparel |
| `templates/index.furniture.json` | Mid-century, appliances |

Switch per-page from the theme editor's template dropdown (top-right).

## Styling beyond the editor

If you need to touch CSS, **all design tokens live as CSS custom properties** on `:root` in `layout/theme.liquid` (generated from Theme settings). Override those rather than editing `assets/theme.css` directly — the stylesheet respects them throughout.

## Metafields

All refurbished USPs are metafield-driven (see [`METAFIELDS.md`](../METAFIELDS.md)). If a metafield is empty, the related block simply renders nothing — no broken UI for stores that haven't set up every field.
