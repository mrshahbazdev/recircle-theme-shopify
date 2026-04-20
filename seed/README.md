# ReCircle demo-store seed kit

Populate an empty Shopify dev store with ReCircle's 17 product metafields, 15 demo products across 3 niches, 6 collections, 4 pages, and a 3-article blog.

Two paths — pick one:

- **Path A (CSV-only):** No dependencies. Upload products via admin CSV import, paste the rest manually. ~15 minutes.
- **Path B (scripted):** Run `node seed.mjs` to create everything except products via the Shopify Admin API, then do the products CSV upload. ~3 minutes.

---

## Path A — CSV only

### 1. Create the metafield definitions (5 min)

**Settings → Custom data → Products → Add definition**, then repeat 17 times using the entries in [`metafield-definitions.json`](./metafield-definitions.json). For each:

| Field | Value |
|---|---|
| Name | from `name` |
| Namespace & key | `recircle` / `<key>` |
| Description | from `description` |
| Type | from `type` (choose the matching option in the dropdown) |
| Validation | copy from `validations` (choices / min / max where present) |

### 2. Import the products (2 min)

**Products → Import → Add file →** upload [`products.csv`](./products.csv) → tick "Overwrite existing products" → **Upload and continue**.

All 15 demo products arrive with images (from placehold.co), tags, prices, and metafield values already filled.

### 3. Create the collections (4 min)

Use [`collections.json`](./collections.json) as the spec. Per entry:

- **Products → Collections → Create collection**
- Title + handle from the JSON
- Description: copy `description_html`
- Collection type: **Smart** (automated)
- Conditions: products must match **all** conditions (unless `disjunctive: true`)
- Copy each rule: column / relation / condition

### 4. Create the pages (2 min)

For each entry in [`pages.json`](./pages.json):

- **Online Store → Pages → Add page**
- Title + handle + body (paste the `body_html`)
- If `template` is set (e.g. `page.trade-in`), pick it from the theme-template dropdown
- Publish

### 5. Create the blog + articles (2 min)

- **Online Store → Blog posts → Manage blogs → Create** blog "Circular news" (handle `news`)
- For each entry in [`articles.json`](./articles.json): **Blog posts → Add blog post**, paste the title / summary / body / tags / author.

---

## Path B — scripted (one command)

### 1. Generate an Admin API token (2 min)

1. Dev store admin → **Settings → Apps and sales channels → Develop apps → Allow custom app development**
2. **Create an app** → name it `ReCircle seed` → configure scopes:
   - `read_products`, `write_products`
   - `read_content`, `write_content`
   - `read_publications`, `write_publications`
   - `read_metaobjects`, `write_metaobjects`
3. **Install the app** → copy the **Admin API access token** (starts with `shpat_`)

### 2. Run the seed

```bash
cd seed
SHOPIFY_STORE=your-dev-store.myshopify.com \
SHOPIFY_ADMIN_TOKEN=shpat_xxx \
npm run seed
```

`npm run seed` creates **everything**: metafield definitions, collections, pages, blog + articles, and all 15 products (with images, metafield values, inventory, and Online-Store publication). `msrp_new` currency is auto-detected from `shop.currencyCode`.

Selective runs:

```bash
npm run seed:metafields   # just the 17 definitions
npm run seed:collections  # just collections
npm run seed:pages        # just pages
npm run seed:articles     # just blog + articles
npm run seed:products     # just the 15 products + publish
npm run seed:publish      # re-publish all existing products to Online Store
```

Node 18+. No dependencies — uses the built-in `fetch` + `graphql.json` endpoint.

### 3. (optional) Bulk CSV fallback

If you'd rather not grant `write_products` scope, skip `seed:products` and instead use the CSV: **Admin → Products → Import → `seed/products.csv`** → Upload. Metafield values are preserved inline.

---

## What you'll have after seeding

| Area | Count | Notes |
|---|---|---|
| Metafield definitions | 17 | Namespace `recircle` |
| Products | 15 | 5 electronics + 5 fashion + 5 furniture, all `active`, all with images |
| Collections | 6 | Per-niche (3) + per-grade (2) + CO₂ champions |
| Pages | 4 | About, Sustainability, Trade-in, FAQ |
| Blog articles | 3 | Grading guide, DPP explainer, 2024 CO₂ methodology |

Pick the niche-specific homepage variant afterwards: **Online Store → Themes → Customize → top-right template dropdown →** `index.electronics` / `index.fashion` / `index.furniture`.

---

## Images

Product images in `products.csv` reference `placehold.co` URLs so imports work out of the box with no CDN setup. Replace with real photos before going live:

- Admin → Products → open each → drag a new image onto the gallery, then delete the placehold.co one.
- Or: use the bulk editor (`Products → More actions → Bulk editor → Image`).

---

## Troubleshooting

- **"Metafield definition already exists"** — safe, script skips `TAKEN` errors.
- **"Handle already in use"** — delete the existing collection / page / article in admin, then re-run. The script doesn't upsert by design (safer to avoid accidental overwrites on a real store).
- **Token 401** — regenerate in Settings → Apps; make sure the app is **installed** after scope changes.
- **CSV import stalls on images** — placehold.co occasionally rate-limits; wait and re-import, or drop the `Image Src` column and upload images manually.
- **Money metafield column** — `recircle.msrp_new` is intentionally absent from the CSV (Shopify CSV money encoding is cumbersome). Fill it manually in admin, or extend `seed.mjs` to set it via `productUpdate`.
