# Newsletter sign-up

Phase 24 ships a dedicated `Newsletter` section + a smarter footer block. Both auto-detect the email provider in this priority order:

1. **Klaviyo** — when a list ID is set (`klaviyo_list_id`). AJAX submission to `https://manage.kmail-lists.com/ajax/subscriptions/subscribe`.
2. **Mailchimp** — when a form action URL is set (`mailchimp_action`). Posts directly to Mailchimp.
3. **Shopify customer** — fallback. Creates a customer tagged `newsletter`.

## Adding the section

Theme editor → **Add section → Newsletter**. Settings:

| Field | Notes |
|---|---|
| Eyebrow / Heading / Body | Editorial copy. |
| Image | Optional, lazy-loaded with srcset. |
| Style | `Card` (boxed, the default) or `Full-bleed`. |
| Klaviyo list ID | Set this to use Klaviyo. |
| Mailchimp form action URL | Used only if Klaviyo is blank. |
| Perk blocks (3 by default) | Bullet list rendered with check icons. |

## Footer block

Footer → Add block → Newsletter. Same Klaviyo / fallback logic.

## Klaviyo wiring

1. Klaviyo → Lists & Segments → create or pick a list. Copy the 6-character ID from the URL.
2. Paste it into the Newsletter section's **Klaviyo list ID** setting.
3. AJAX submit fires; on success a `recircle:newsletter:subscribe` DOM event is dispatched and the success message shows inline.

## Mailchimp wiring

1. Mailchimp → Audience → Signup forms → Embedded forms.
2. Copy the form `action` URL.
3. Paste it into **Mailchimp form action URL**.
4. Submission opens Mailchimp's confirmation page in a new tab (Mailchimp doesn't expose CORS-friendly endpoints).

## Shopify fallback

If both provider fields are blank, the form submits to Shopify's `customer` form, creating a customer with the tag `newsletter`. Use Shopify Email or Shopify Flow to drive the welcome series. Errors surface inline (`form.errors | default_errors`).

## Localized strings

`recircle.newsletter.{label,placeholder,submit,success,error,legal}` translated in en/de/fr/it/es/nl.

## Storage event

```js
document.addEventListener('recircle:newsletter:subscribe', (e) => {
  console.log(e.detail); // { provider: 'klaviyo', email: '…' }
});
```

Useful for downstream analytics — Phase 17 already wires GA4 / Meta Pixel `Lead` events for trade-in; you can mirror that for newsletter sign-ups in your own snippet.
