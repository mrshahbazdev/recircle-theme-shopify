# Cookie / GDPR consent banner

ReCircle ships an opt-in cookie consent banner that gates **GA4 (Consent Mode v2)** and the **Meta Pixel**. It renders only when at least one analytics provider is configured, so non-EU / no-analytics merchants get nothing extra.

## What the merchant configures

Theme editor → **Theme settings → Analytics**:

| Setting | Default | Notes |
|---|---|---|
| `ga4_id` | empty | When set, GA4 loads in `<head>`. |
| `meta_pixel_id` | empty | When set, Meta Pixel loads in `<head>`. |
| `consent_mode_default_denied` | on | GA4 Consent Mode v2 starts denied; banner grants. |
| `consent_banner_enabled` | on | Renders the banner. Set off if you use a Shopify Customer Privacy app instead. |
| `consent_policy_link` | empty | URL for the "Learn more" link inside the banner. |

## What the visitor sees

1. **First load** — banner appears at the bottom of every page until they choose.
2. **Three buttons** — "Accept all", "Reject non-essential", "Customize" (toggles per category: Necessary / Analytics / Marketing).
3. **After choosing** — banner hides; choice persists in `localStorage` under `recircle:consent`.
4. **Revisit choice** — footer "Manage cookies" button re-opens the banner.

## How analytics is gated

`assets/analytics.js` exposes:

```js
window.recircleAnalytics.setConsent({ analytics: true|false, marketing: true|false });
window.recircleAnalytics.grantConsent();   // shorthand for both true
window.recircleAnalytics.revokeConsent();  // shorthand for both false
```

Internally:
- **GA4** — `gtag('consent', 'update', { analytics_storage, ad_storage, ad_user_data, ad_personalization })`.
- **Meta Pixel** — `fbq('consent', 'grant'|'revoke')`.

A `recircle:consent:change` DOM event is dispatched on every change so other scripts (e.g. a Klaviyo loader) can react.

## Custom integration

If you ship a different consent stack (OneTrust, Cookiebot, Shopify Customer Privacy app):

1. Turn `consent_banner_enabled` **off** in theme settings.
2. From your stack, call `window.recircleAnalytics.setConsent({ analytics, marketing })` whenever the visitor's choice changes.
3. The default Consent-Mode-v2 "denied" still applies until your stack grants.

## Storage key

```
localStorage.getItem('recircle:consent')
// → '{"analytics":true,"marketing":false,"ts":1716220800000}'
```

Clear it (DevTools → Application → Local storage) to re-test the first-load flow.
