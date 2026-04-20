# ReCircle metafield definitions

Create these in Shopify admin: **Settings → Custom data → Products → Add definition**.

All metafields use namespace `recircle`.

## Product-level

| Key | Type | Description | Example |
|---|---|---|---|
| `condition_grade` | Single-line text | One of `a`, `b`, `c`, `d` | `b` |
| `co2_saved_kg` | Number (integer) | kg CO₂e saved vs buying new | `56` |
| `repair_score` | Number (decimal) | 0–10 repairability rating | `8.2` |
| `warranty_months` | Number (integer) | Override theme default warranty | `24` |
| `returns_days` | Number (integer) | Override theme default returns window | `30` |
| `price_30day_low` | Money | Lowest price in last 30 days (Price Indication Directive) | `€399.00` |
| `msrp_new` | Money | Manufacturer's recommended retail price when new | `€1099.00` |
| `passport_id` | Single-line text | Unique DPP ID | `RC-IP13-2024-00471` |
| `materials` | Single-line text | Comma-separated materials list | `Aluminium, glass, lithium-ion` |
| `origin` | Single-line text | Country/city of refurbishment | `Refurbished in Leuven, BE` |
| `recycled_percent` | Number (integer) | Recycled content as % | `32` |
| `weight_grams` | Number (integer) | Product weight in grams | `174` |
| `battery_health` | Number (integer) | Battery health as % (for batteries) | `92` |
| `serial` | Single-line text | Device serial or IMEI | `F1234567ABCD` |
| `passport_url` | URL | Link to full Digital Product Passport page | `https://dpp.example.com/RC-IP13-2024-00471` |
| `before_image` | File reference (image) | "Before refurbishment" photo | – |
| `after_image` | File reference (image) | "After refurbishment" photo | – |

## Variant-level (optional)

Variant metafields override product-level values for that specific condition/variant:

- `recircle.co2_saved_kg`
- `recircle.condition_grade`
- `recircle.battery_health`

## Demo data seeding

For demo stores, you can seed metafields via the Shopify CLI or the Admin API. A sample CSV import is scheduled for Phase 2.
