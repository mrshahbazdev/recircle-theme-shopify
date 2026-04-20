# Installing ReCircle

ReCircle is a Shopify Online Store 2.0 theme. It has **no build step** — upload the zip and you're live.

## 1. Prerequisites

- A Shopify store (development or paid plan). Free dev store: https://partners.shopify.com → Stores → Add store → Development store.
- Shopify plan: **Basic or higher** (Markets, Metafields, and Customer Accounts all work on Basic).
- Optional: Shopify CLI for hot-reload dev (`npm i -g @shopify/cli @shopify/theme`).

## 2. Install the theme

### Option A — Upload the zip (fastest)

1. Download this repo as a zip: https://github.com/mrshahbazdev/recircle-theme-shopify/archive/refs/heads/main.zip
2. Shopify admin → **Online Store → Themes** → **Add theme → Upload zip file** → pick the zip.
3. Hit **Customize** on the newly-installed "ReCircle" entry.

### Option B — Shopify CLI (recommended for ongoing dev)

```bash
git clone https://github.com/mrshahbazdev/recircle-theme-shopify.git
cd recircle-theme-shopify
shopify theme dev --store your-dev-store.myshopify.com
```

This opens a live preview and hot-reloads on every file save.

## 3. Set up the metafield definitions (5 min)

All the refurbished-specific features read from product metafields in the `recircle` namespace. Define these once via **Settings → Custom data → Products → Add definition**:

| Namespace.key | Type | Purpose |
|---|---|---|
| `recircle.condition_grade` | Single line text (choices: A, B, C, D) | Condition badge |
| `recircle.condition_notes` | Multi-line text | Detailed condition notes |
| `recircle.co2_saved_kg` | Number (integer) | CO₂ savings badge |
| `recircle.msrp_new` | Money | Dual-price strike-through |
| `recircle.repair_score` | Number (integer, 0–10) | Repairability ring |
| `recircle.warranty_months` | Number (integer) | Warranty bar |
| `recircle.warranty_text` | Single line text | Warranty description |
| `recircle.battery_health_pct` | Number (integer, 0–100) | Electronics |
| `recircle.cycle_count` | Number (integer) | Electronics |
| `recircle.refurbished_year` | Number (integer) | Timeline |
| `recircle.dpp_id` | Single line text | Digital Product Passport ID |
| `recircle.dpp_url` | URL | Public DPP URL |
| `recircle.origin_country` | Single line text | ESPR compliance |
| `recircle.materials` | Multi-line text | DPP materials |
| `recircle.before_image` | File reference (image) | Before/after slider |
| `recircle.after_image` | File reference (image) | Before/after slider |
| `recircle.serial_hash` | Single line text | Traceability |

See [`METAFIELDS.md`](../METAFIELDS.md) for the full breakdown.

## 4. Pick a demo homepage

The theme ships with three home-template variants. Open any section in the editor → top-right template dropdown → choose:

- `index` — generic refurbished (default)
- `index.electronics` — phones / laptops demo
- `index.fashion` — pre-loved apparel demo
- `index.furniture` — restored furniture demo

## 5. Fill in trade-in pricing

Theme editor → **Trade-in calculator** section → **Add block → Brand** → set slug / label / base price.

Leave blocks empty to use the built-in demo pricing (iPhone, Samsung, MacBook, iPad, Pixel, Other).

## 6. Enable Markets (multi-currency)

**Admin → Settings → Markets** → add regions → publish. The country / currency selector in the header auto-populates.

## 7. You're live

Preview URL: **Online Store → Themes → Preview** (for unpublished themes) or your `.myshopify.com` domain once published.
