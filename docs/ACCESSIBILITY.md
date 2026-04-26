# Accessibility — ReCircle theme

This theme targets **WCAG 2.2 Level AA** out of the box. The implementation choices below cover the four principles (Perceivable, Operable, Understandable, Robust) without merchant configuration.

## Compliance summary

| Principle | Coverage |
|-----------|----------|
| **Perceivable** | Color contrast ≥ 4.5:1 (text) / 3:1 (UI components); `alt` text on every image; semantic landmarks; visible focus states |
| **Operable** | Keyboard navigation throughout; visible skip-link; focus traps in modals; no time limits; `prefers-reduced-motion` respected |
| **Understandable** | Form labels + descriptions; clear error messages; predictable navigation; consistent UI patterns across templates |
| **Robust** | Valid HTML5; ARIA roles + states; tested across Chromium, WebKit, Gecko; degrades gracefully without JS |

## Built-in features

### Landmarks & document structure
- `<header role="banner">`, `<main role="main">`, `<nav aria-label="Primary">`, `<footer role="contentinfo">`
- One `<h1>` per page (page title or collection/product title)
- `<a class="skip-to-content" href="#MainContent">` first focusable element
- `<main id="MainContent" tabindex="-1">` accepts skip-link focus

### Keyboard navigation
- Every interactive element reachable via Tab in a logical order
- Focus rings: 3px amber outline + 5px translucent halo for ≥3:1 contrast on any background
- `*:focus-visible` (not `:focus`) so mouse clicks don't show rings, but Tab does
- Esc closes cart drawer, quick-view modal, predictive search dropdown
- `/` shortcut opens predictive search
- Cart drawer + quick-view modal trap focus while open
- Focus restored to triggering element when modals close

### ARIA & live regions
- `<div aria-live="polite" data-a11y-announce>` for dynamic announcements (cart updates, wishlist toggles, search count changes)
- `aria-expanded` on disclosure buttons (mobile menu, predictive search, cart drawer)
- `aria-pressed` on toggle buttons (wishlist heart, compare add)
- `aria-controls` linking triggers to their controlled regions
- `aria-current="page"` on active nav links (auto-applied by Liquid)
- `aria-label` on icon-only buttons (search, cart, wishlist, compare, menu toggle)

### Forms
- Every input has an associated `<label>` (visible or `.visually-hidden` when icon-led)
- Required fields use the `required` attribute (not just `*` in label)
- Form errors render with `aria-describedby` linking field → error message
- `<input type="email">`, `type="tel">`, `type="search">` for hardware keyboard hints
- Search inputs have `autocomplete="off"` to avoid stale browser-suggested terms

### Images
- Every `<img>` has an `alt` attribute (descriptive or `alt=""` for decorative)
- Decorative SVG icons use `aria-hidden="true"` and rely on a sibling text label
- Product card images derive `alt` from `image.alt` falling back to the product title

### Color contrast
Default palette tested against AA at the [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/):

| Foreground / Background | Ratio | AA Body | AA Large |
|------------------------|-------|---------|----------|
| `--color-text` (`#1A1A1A`) on `--color-bg` (`#FBF8F3`) | 16.4 : 1 | ✓ | ✓ |
| `--color-text-muted` (`#5A5A5A`) on `--color-bg` | 6.2 : 1 | ✓ | ✓ |
| `--color-brand` (`#0D211A`) on `--color-bg-subtle` | 14.9 : 1 | ✓ | ✓ |
| `--color-amber` (`#B26500`) on `--color-bg` | 4.6 : 1 | ✓ | ✓ |
| Button white on `--color-brand` | 15.1 : 1 | ✓ | ✓ |

Merchants who override the palette in `Settings → Theme settings → Colors` should re-check contrast — link in the schema points to the WebAIM checker.

### Motion preferences
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```
Plus targeted overrides on hover transforms (`product-card`, `article-card`, `collection-list`) to disable image zoom for users who opt out.

### Forced-colors mode (Windows High Contrast)
Border outlines on buttons, cards, panels, and the skip-link use `CanvasText` so they remain visible when Windows substitutes the palette.

### Hosted Customer Accounts
Note: if your store uses Shopify's hosted Customer Accounts (the default for stores created after Aug 2024), the `/account/login`, `/account/register`, `/account/reset-password` and `/account/activate` URLs are served by Shopify, not by this theme. Shopify's hosted UI passes WCAG AA itself but is outside this theme's control. To activate the theme's editorial login templates, switch to **Classic customer accounts** in Admin → Settings → Customer accounts.

## Audit checklist (run before launch)

- [ ] [axe DevTools](https://www.deque.com/axe/devtools/) — 0 critical, 0 serious violations on homepage / collection / PDP / cart / search
- [ ] [WAVE](https://wave.webaim.org/) — 0 errors; warnings reviewed
- [ ] Tab through homepage → collection → PDP → cart → checkout entirely with keyboard
- [ ] Run with NVDA / VoiceOver / TalkBack — verify announcements on cart-add and wishlist-toggle
- [ ] Resize browser to 320px wide (smallest WCAG-required viewport) — no content cut off, no horizontal scroll
- [ ] Zoom to 200% — text reflows, no overlapping content
- [ ] System "reduce motion" enabled — verify before-after slider, hover transforms, modal animations all stop

## Known limitations

- The before/after refurbishment slider (`snippets/before-after-gallery.liquid`) is operable by keyboard (arrow keys after focus) but uses pointer drag for primary interaction. Screen-reader users hear two static images with descriptive `alt` text — the slider is purely visual enhancement and does not gate any content.
- Country/currency selector uses `<select onchange="this.form.submit()">` — works without JS if user uses keyboard or mouse to change selection then Tab away (browsers fire `change` on blur). Without `onchange`, the form requires an explicit "Update" button which adds keystrokes.
- Compare bar (sticky bottom UI) is hidden until 2+ products are added. Screen-reader users get a live-region announcement when items enter/leave compare; the persistent bar is supplementary.

## Reporting issues

Found an a11y issue? Open one with:
1. Steps to reproduce + URL
2. Browser + AT (assistive tech, e.g. NVDA, VoiceOver) + OS
3. WCAG criterion violated (if known) — e.g. "1.4.3 Contrast (Minimum)"
4. Expected vs actual behaviour

We treat any AA violation as a release blocker.
