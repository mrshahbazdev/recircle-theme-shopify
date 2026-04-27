# PDP extras (Phase 28)

Four optional buy-card blocks + a global chat hook.

## 1. Buy-now / pay later messaging (`bnpl` block)

Theme editor → **Product information** section → **Add block → Buy now / pay later messaging**.

| Provider | What renders | Required setting |
|---|---|---|
| Shop Pay Installments (default) | `<shopify-payment-terms>` element with `product \| payment_terms` markup | Enable Shop Pay Installments in Shopify Admin → no extra config |
| Klarna On-Site Messaging | `<klarna-placement>` + `klarna.js` | `klarna_client_id` (Klarna Merchant Portal → Configuration → On-site messaging) |
| Afterpay / Clearpay | `<afterpay-placement>` + `afterpay-1.x.js` | None (uses default brand) |
| PayPal Pay Later | `data-pp-message` element | Requires the merchant's PayPal SDK loaded elsewhere |
| None | Block disables itself | — |

If the Klarna `client_id` is empty, a translated fallback line is rendered (`recircle.bnpl.klarna_fallback`) so the buy-card never has a hole.

## 2. Delivery & returns (`delivery_returns` block)

Three editable rows + optional fine print, each with an inline icon (van / arrow-back / shield). Defaults:
- "Free delivery in 2–4 business days"
- "30-day free returns"
- "12-month warranty"

Override per theme on multilingual stores by editing `locales/*.json → recircle.delivery.*`.

## 3. Size guide (`size_guide` block)

Pulls the rich-text body of a Shopify Page resource and renders it inside a native `<dialog>` modal. Steps:
1. Admin → Online Store → Pages → New page → Title "Size guide" → paste your size table → Save.
2. Theme editor → Product information → Add block → Size guide → pick the page in the **Pull content from page** picker.

The modal closes on backdrop click, on the ✕ button, and on Esc (browser default for `<dialog>`).

## 4. Live chat hook (theme settings)

Theme editor → **Theme settings → Analytics → Live chat widget**. Pick a provider and paste the matching ID; the chat snippet is then injected on every page **only after the visitor grants `functional` consent in the cookie banner.**

Supported providers (one-line install):
- Tidio (`chat_tidio_key`)
- Crisp (`chat_crisp_website_id`)
- Gorgias (`chat_gorgias_app_id`)
- Intercom (`chat_intercom_app_id`)
- Tawk.to (`chat_tawk_id`)

Set `chat_provider` to `none` to disable the slot entirely (no hidden network calls).
