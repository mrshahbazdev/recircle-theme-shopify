# Country / currency / language selector

Phase 27 ships a unified locale selector reused across header, footer, and any custom placement.

## What it does

- **Country** — POSTs to `/localization` with `country_code`. Shopify Markets routes the visitor to the matching market and switches the displayed currency.
- **Language** — same endpoint with `locale_code`. Stays on the same page (`return_to` preserves path).
- **Flag** — JS converts the ISO-2 country code to the corresponding regional indicator emoji at runtime (no flag images shipped with the theme).

## Where it renders

| Location | Source | Toggles |
|---|---|---|
| Header | `sections/header.liquid` (legacy inline forms) | `show_country_selector`, `show_language_selector` (existing settings) |
| Footer | `sections/footer.liquid` → `{% render 'locale-selector', location: 'footer' %}` | `show_locale_selector`, `show_country_selector`, `show_language_selector` (new) |

## Reuse anywhere

Drop the snippet into any section / template:

```liquid
{% render 'locale-selector', location: 'standalone', layout: 'stacked',
          show_country: true, show_language: true %}
```

## Auto-submit

The form auto-submits on `change`. The flag emoji updates instantly while the page reload is in flight, so the perceived response is sub-100 ms.

## A11y

- The native `<select>` is labelled by a visible `.locale-selector__label` (no visually-hidden hack).
- Focus ring is rendered on the `.locale-selector__field` wrapper using `:focus-within` so keyboard users see a single solid ring around the whole pill.
- The flag has `aria-hidden="true"` — screen readers announce the country name from the option text.

## What it does NOT do

- It does not auto-prompt visitors based on geo-IP. Adding a "Looks like you're shopping from {country} — switch?" toast is a separate task; the building block (data-locale-selector + auto-submit) is already in place.
- It does not display per-product prices in foreign currencies on cards. Shopify Markets handles that automatically once the visitor picks a country.
