# Email templates — ReCircle

Editorial transactional + lifecycle emails matching the storefront theme. Five templates, two platforms, plaintext fallbacks for every one.

| # | Template | Trigger | Shopify Email | Klaviyo | Plaintext |
|---|----------|---------|---------------|---------|-----------|
| 1 | Order confirmation | Order placed | `shopify-email/01-order-confirmation.html` | `klaviyo/01-order-confirmation.html` | `plaintext/01-order-confirmation.txt` |
| 2 | Shipping confirmation | Fulfillment created | `shopify-email/02-shipping-confirmation.html` | `klaviyo/02-shipping-confirmation.html` | `plaintext/02-shipping-confirmation.txt` |
| 3 | Back in stock | Inventory > 0 (subscribers) | `shopify-email/03-back-in-stock.html` | `klaviyo/03-back-in-stock.html` | `plaintext/03-back-in-stock.txt` |
| 4 | Impact summary | Order fulfilled +14 days | `shopify-email/04-impact-summary.html` | `klaviyo/04-impact-summary.html` | `plaintext/04-impact-summary.txt` |
| 5 | Trade-in receipt | Trade-in form submitted | `shopify-email/05-trade-in-receipt.html` | `klaviyo/05-trade-in-receipt.html` | `plaintext/05-trade-in-receipt.txt` |

## Design system

All templates share one editorial design language matched to the storefront theme:

- **Background:** `#EFE8DA` page · `#FBF8F3` card
- **Text:** `#1A1A1A` body · `#0D211A` headings · `#5A5A5A` muted
- **Accent pills:** `#E8E0CC` (neutral) · `#FCE4C0` (alert) · `#E2EAE5` (eco)
- **Display font:** Playfair Display, falling back to Georgia for Outlook
- **Body font:** system-ui stack (San Francisco / Segoe / Roboto / Helvetica)
- **Width:** 600px max, fully responsive at 620px breakpoint
- **Dark mode:** `prefers-color-scheme: dark` flips card + text colours
- **Outlook compatibility:** `<table>` layout + MSO conditionals + `<!--[if mso]>` font fallback

## Install — Shopify Email (native order notifications)

These map to Shopify's stock notification slots in **Admin → Settings → Notifications**.

| Template | Shopify slot |
|----------|-------------|
| 01-order-confirmation | "Order confirmation" |
| 02-shipping-confirmation | "Shipping confirmation" |
| 03-back-in-stock | "Customer: account invite" or a custom Shopify Email campaign |
| 04-impact-summary | Custom Shopify Email campaign (no native slot) |
| 05-trade-in-receipt | Custom Shopify Email campaign (no native slot) |

**For native slots (1, 2):**

1. Admin → **Settings → Notifications**
2. Click the matching notification (e.g. "Order confirmation")
3. Click **Edit code**
4. Copy the contents of the corresponding `.html` file in `shopify-email/` and paste into the **HTML body**
5. Copy the contents of the matching `.txt` file in `plaintext/` and paste into the **Plain text body**
6. **Save** → click **Send test email** to verify rendering

**For custom campaigns (3, 4, 5):**

1. Apps → **Shopify Email** (install if not already)
2. **Create email** → **Start from scratch** → **Code editor**
3. Paste HTML; toggle plain text view and paste plaintext
4. Set audience (back-in-stock subscribers, recent buyers, etc.)
5. Send a preview → schedule or send

## Install — Klaviyo

1. Klaviyo → **Email** → **Templates** → **Create template** → **Code editor**
2. Paste the contents of the matching file from `klaviyo/`
3. **Save**
4. Attach the template to a flow:

| Template | Klaviyo flow |
|----------|--------------|
| 01-order-confirmation | "Order confirmation" flow (trigger: `Placed Order` Shopify metric) |
| 02-shipping-confirmation | "Shipped" flow (trigger: `Fulfilled Order`) |
| 03-back-in-stock | Built-in "Back in Stock" flow (Klaviyo native) |
| 04-impact-summary | Custom flow — trigger `Fulfilled Order` with 14-day delay |
| 05-trade-in-receipt | Custom flow — trigger `Submitted Trade-in` (custom event from theme) |

5. **Send a preview** to your own address before activating

### Custom event from the theme — `Submitted Trade-in`

The trade-in form (`sections/trade-in.liquid`) posts to a metaobject and can also fire a Klaviyo event. Wire it up by adding this snippet to `theme.js` (after the trade-in form's `fetch` succeeds):

```javascript
if (window._learnq && form._submission) {
  window._learnq.push(['track', 'Submitted Trade-in', {
    product_title: form._submission.product_title,
    brand: form._submission.brand,
    condition: form._submission.condition,
    value: form._submission.estimated_value,
    reference: form._submission.id,
  }]);
}
```

This makes the variables in `klaviyo/05-trade-in-receipt.html` populate correctly via `event.extra.*`.

## Variable reference

### Shopify Email — order confirmation / shipping / impact

These templates use Shopify's [notification Liquid variables](https://shopify.dev/docs/api/liquid/objects/order):

- `{{ order.order_number }}` · `{{ order.created_at }}` · `{{ order.total_price | money }}`
- `{{ order.line_items }}` (loop) → `{{ line.title }}` · `{{ line.quantity }}` · `{{ line.image | img_url: 'medium' }}` · `{{ line.product.metafields.recircle.grade }}` · `{{ line.product.metafields.recircle.co2_kg }}`
- `{{ fulfillment.tracking_number }}` · `{{ fulfillment.tracking_url }}` · `{{ fulfillment.tracking_company }}` (shipping confirmation only)
- `{{ order.shipping_address.* }}` · `{{ order.billing_address.* }}`
- `{{ shop.name }}` · `{{ shop.url }}` · `{{ shop.domain }}`

### Shopify Email — trade-in receipt

The trade-in receipt is a custom Shopify Email campaign — it doesn't have native Liquid context. Wire the variables via Shopify's Liquid in the campaign builder, populated from a metaobject query keyed on the form submission ID:

- `{{ quote.reference }}` · `{{ quote.value | money }}` · `{{ quote.product_title }}` · `{{ quote.brand }}` · `{{ quote.condition }}` · `{{ quote.notes }}`

### Klaviyo — all templates

Klaviyo flows fire on Shopify-synced metrics. The variable map:

| Klaviyo variable | Source |
|------------------|--------|
| `{{ event.OrderId }}` / `{{ event.extra.order_number }}` | Synced from Shopify on `Placed Order` |
| `{{ event.Value }}` / `{{ event.extra.total_price }}` | Synced from Shopify |
| `{{ event.extra.line_items }}` | Synced array — items have `title`, `quantity`, `line_price`, `image`, `properties.grade` |
| `{{ event.extra.tracking_number }}` | Synced on `Fulfilled Order` |
| `{{ event.extra.product.* }}` | Back-in-stock metric — `title`, `image`, `url`, `price`, `compare_at_price`, `grade`, `co2_kg` |
| `{{ event.extra.co2_total }}` / `{{ event.extra.units_total }}` | Computed by a Klaviyo "Calculate variables" step before the impact email; sum `co2_kg * quantity` over `event.extra.line_items` |
| `{{ event.extra.value }}` / `{{ event.extra.product_title }}` / `{{ event.extra.brand }}` / `{{ event.extra.condition }}` / `{{ event.extra.reference }}` | From custom `Submitted Trade-in` event (see snippet above) |
| `{{ person.first_name }}` | Klaviyo profile property |
| `{{ organization.name }}` / `{{ organization.url }}` / `{{ organization.full_address }}` | Klaviyo account-level branding |
| `{% unsubscribe %}` | Klaviyo footer macro |

For the impact email, add a Klaviyo "Update profile properties" or "Conditional split" step that computes `co2_total` (sum) and `units_total` (count) from `event.extra.line_items` so the template variables resolve at send time.

## Testing

- **Shopify Email native:** Admin → Settings → Notifications → "Send test email" → check all major clients (Gmail web, Gmail mobile, iOS Mail, Outlook desktop, Outlook web)
- **Shopify Email custom:** Shopify Email → "Send test"
- **Klaviyo:** Template editor → "Send a preview"
- **Litmus / Email on Acid (recommended):** paste HTML for full rendering matrix across 80+ clients

## Known constraints

- **Outlook 2016/2019 desktop on Windows** doesn't support `border-radius`, `aspect-ratio`, or `prefers-color-scheme`. Templates degrade gracefully — corners square off, single-light theme. Visually still strong.
- **Gmail clipping:** templates are well under 102 KB (the threshold). Adding a long product list (50+ items) could push past it — Gmail then collapses the email with a "[Message clipped]" link. If your stores ship orders with that many lines, paginate the line items in the order confirmation template (truncate after 30, link to the order page).
- **Plaintext is required by ESPs and improves deliverability.** Always paste both HTML and plaintext when configuring a Shopify Email or Klaviyo template.
- **CSS-in-`<style>` is preserved** by Shopify Email and Klaviyo. Outlook's MSO renderer will ignore those rules — they're only there for `prefers-color-scheme` and the responsive 620px breakpoint, both of which Outlook desktop doesn't support anyway.

## Customising

- **Brand colour:** find/replace `#0D211A` (the deep forest green) with your own brand hex
- **Accent pills:** the three pill backgrounds (`#E8E0CC`, `#FCE4C0`, `#E2EAE5`) map to neutral / alert / eco — keep the semantic split when changing
- **Heading font:** swap `'Playfair Display'` for any serif. Outlook will fall back to Georgia automatically. Don't depend on web-font loading in email — it's unreliable.
- **CTA button copy:** all buttons live near the bottom of each template — search `display:inline-block;padding:14px` to find them
