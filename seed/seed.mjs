#!/usr/bin/env node
/**
 * ReCircle \u2014 demo store seed kit.
 *
 * Creates (idempotently):
 *   - 17 product metafield definitions in the `recircle` namespace
 *   - 6 smart collections (per-niche + per-grade + CO\u2082 champions)
 *   - 4 pages (About, Sustainability, Trade-in, FAQ)
 *   - 1 blog ("Circular news") + 3 articles
 *
 * Products are imported separately via Shopify's native CSV import
 * (Admin \u2192 Products \u2192 Import \u2192 seed/products.csv).
 *
 * Usage:
 *   SHOPIFY_STORE=your-dev-store.myshopify.com \
 *   SHOPIFY_ADMIN_TOKEN=shpat_xxx \
 *   node seed.mjs [--only=metafields|collections|pages|articles]
 *
 * Generate an Admin API token:
 *   Settings \u2192 Apps and sales channels \u2192 Develop apps \u2192 Create an app
 *   Grant: read_products, write_products, read_publications, write_publications,
 *          read_content, write_content, read_metaobjects, write_metaobjects
 *   Install the app, copy the Admin API access token (starts with `shpat_`).
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = process.env.SHOPIFY_STORE;
const token = process.env.SHOPIFY_ADMIN_TOKEN;
const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];
const API_VERSION = "2024-10";

if (!store || !token) {
  console.error("\u2716 SHOPIFY_STORE and SHOPIFY_ADMIN_TOKEN env vars are required.");
  console.error("  SHOPIFY_STORE=your-dev-store.myshopify.com");
  console.error("  SHOPIFY_ADMIN_TOKEN=shpat_\u2026 (from a custom app)");
  process.exit(2);
}

const endpoint = `https://${store}/admin/api/${API_VERSION}/graphql.json`;

let SHOP_CURRENCY = "EUR";

async function gql(query, variables = {}) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }
  const body = await res.json();
  if (body.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(body.errors)}`);
  }
  return body.data;
}

async function readJSON(file) {
  return JSON.parse(await fs.readFile(path.join(__dirname, file), "utf8"));
}

// ---------- Metafield definitions ----------

async function seedMetafields() {
  const defs = await readJSON("metafield-definitions.json");
  console.log(`\u2192 creating ${defs.length} metafield definitions\u2026`);
  for (const def of defs) {
    const mutation = /* GraphQL */ `
      mutation Create($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition { id name namespace key }
          userErrors { field message code }
        }
      }
    `;
    const { metafieldDefinitionCreate: r } = await gql(mutation, { definition: def });
    const errs = r.userErrors.filter((e) => e.code !== "TAKEN");
    if (errs.length) {
      console.warn(`  \u203c ${def.namespace}.${def.key}:`, errs.map((e) => e.message).join("; "));
    } else if (r.createdDefinition) {
      console.log(`  \u2714 ${def.namespace}.${def.key}`);
    } else {
      console.log(`  \u2219 ${def.namespace}.${def.key} (already exists)`);
    }
  }
}

// ---------- Collections ----------

const ruleColumnMap = {
  TAG: "TAG",
  TYPE: "TYPE",
  VENDOR: "VENDOR",
  TITLE: "TITLE",
};

async function seedCollections() {
  const list = await readJSON("collections.json");
  console.log(`\u2192 creating ${list.length} collections\u2026`);
  for (const c of list) {
    const input = {
      title: c.title,
      handle: c.handle,
      descriptionHtml: c.description_html,
      ruleSet: {
        rules: c.rules.map((r) => ({
          column: ruleColumnMap[r.column] || r.column,
          relation: r.relation,
          condition: r.condition,
        })),
        appliedDisjunctively: !!c.disjunctive,
      },
      sortOrder: c.sort_order || "MANUAL",
    };
    const mutation = /* GraphQL */ `
      mutation Create($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection { id handle }
          userErrors { field message }
        }
      }
    `;
    const { collectionCreate: r } = await gql(mutation, { input });
    if (r.userErrors.length) {
      console.warn(`  \u203c ${c.handle}:`, r.userErrors.map((e) => e.message).join("; "));
    } else {
      console.log(`  \u2714 ${c.handle}`);
    }
  }
}

// ---------- Pages ----------

async function seedPages() {
  const pages = await readJSON("pages.json");
  console.log(`\u2192 creating ${pages.length} pages\u2026`);
  for (const p of pages) {
    const mutation = /* GraphQL */ `
      mutation Create($page: PageCreateInput!) {
        pageCreate(page: $page) {
          page { id handle }
          userErrors { field message code }
        }
      }
    `;
    const pageInput = {
      title: p.title,
      handle: p.handle,
      body: p.body_html,
      isPublished: true,
    };
    if (p.template) pageInput.templateSuffix = p.template.replace(/^page\./, "");
    const { pageCreate: r } = await gql(mutation, { page: pageInput });
    if (r.userErrors.length) {
      console.warn(`  \u203c ${p.handle}:`, r.userErrors.map((e) => e.message).join("; "));
    } else {
      console.log(`  \u2714 ${p.handle}`);
    }
  }
}

// ---------- Articles ----------

async function findOrCreateBlog(handle, title) {
  const q = /* GraphQL */ `
    query ($q: String!) {
      blogs(first: 10, query: $q) { edges { node { id handle } } }
    }
  `;
  const existing = await gql(q, { q: `handle:${handle}` });
  const hit = existing.blogs.edges.find((e) => e.node.handle === handle);
  if (hit) return hit.node.id;
  const mutation = /* GraphQL */ `
    mutation ($blog: BlogCreateInput!) {
      blogCreate(blog: $blog) { blog { id } userErrors { field message } }
    }
  `;
  const { blogCreate: r } = await gql(mutation, { blog: { title, handle } });
  if (r.userErrors.length) throw new Error(r.userErrors.map((e) => e.message).join("; "));
  return r.blog.id;
}

async function seedArticles() {
  const list = await readJSON("articles.json");
  console.log(`\u2192 creating ${list.length} articles\u2026`);
  const blogs = new Map();
  for (const a of list) {
    if (!blogs.has(a.blog_handle)) {
      blogs.set(a.blog_handle, await findOrCreateBlog(a.blog_handle, a.blog_title));
    }
    const blogId = blogs.get(a.blog_handle);
    const mutation = /* GraphQL */ `
      mutation ($article: ArticleCreateInput!) {
        articleCreate(article: $article) {
          article { id handle }
          userErrors { field message }
        }
      }
    `;
    const articleInput = {
      blogId,
      title: a.title,
      handle: a.handle,
      author: { name: a.author },
      body: a.body_html,
      summary: a.summary_html,
      tags: a.tags,
      isPublished: true,
    };
    const { articleCreate: r } = await gql(mutation, { article: articleInput });
    if (r.userErrors.length) {
      console.warn(`  \u203c ${a.handle}:`, r.userErrors.map((e) => e.message).join("; "));
    } else {
      console.log(`  \u2714 ${a.handle}`);
    }
  }
}

// ---------- Products ----------

function metafieldsFor(p) {
  const m = (namespace, key, type, value) =>
    value === null || value === undefined || value === "" ? null : { namespace, key, type, value: String(value) };
  return [
    m("recircle", "condition_grade", "single_line_text_field", p.grade),
    m("recircle", "condition_notes", "multi_line_text_field", p.notes),
    m("recircle", "co2_saved_kg", "number_integer", p.co2),
    p.msrp ? { namespace: "recircle", key: "msrp_new", type: "money", value: JSON.stringify({ amount: p.msrp, currency_code: SHOP_CURRENCY }) } : null,
    m("recircle", "repair_score", "number_integer", p.repair),
    m("recircle", "warranty_months", "number_integer", p.warranty_m),
    m("recircle", "warranty_text", "single_line_text_field", p.warranty_t),
    m("recircle", "refurbished_year", "number_integer", p.year),
    m("recircle", "origin_country", "single_line_text_field", p.origin),
    m("recircle", "dpp_id", "single_line_text_field", p.dpp_id),
    m("recircle", "dpp_url", "url", p.dpp_url),
    m("recircle", "battery_health_pct", "number_integer", p.battery),
    m("recircle", "cycle_count", "number_integer", p.cycles),
  ].filter(Boolean);
}

async function getOnlineStorePublicationId() {
  const { publications } = await gql(`{ publications(first: 20) { edges { node { id name } } } }`);
  const onlineStore = publications.edges.find((e) => e.node.name === "Online Store");
  return onlineStore?.node?.id || null;
}

async function publishResource(id, publicationId) {
  const m = /* GraphQL */ `
    mutation ($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        userErrors { field message }
      }
    }
  `;
  const { publishablePublish: r } = await gql(m, { id, input: [{ publicationId }] });
  return r.userErrors;
}

async function seedProducts() {
  const list = await readJSON("products.json");
  console.log(`\u2192 creating ${list.length} products\u2026`);
  const onlineStoreId = await getOnlineStorePublicationId();
  const createMutation = /* GraphQL */ `
    mutation ProductCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
      productCreate(input: $input, media: $media) {
        product { id handle variants(first: 1) { edges { node { id } } } }
        userErrors { field message }
      }
    }
  `;
  const variantUpdate = /* GraphQL */ `
    mutation VariantsUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        userErrors { field message }
      }
    }
  `;
  for (const p of list) {
    const input = {
      title: p.title,
      handle: p.handle,
      descriptionHtml: p.body,
      vendor: p.vendor,
      productType: p.type,
      tags: p.tags,
      status: "ACTIVE",
      metafields: metafieldsFor(p),
    };
    const media = p.img ? [{ originalSource: p.img, mediaContentType: "IMAGE", alt: p.alt }] : [];
    const { productCreate: r } = await gql(createMutation, { input, media });
    if (r.userErrors.length) {
      console.warn(`  \u203c ${p.handle}:`, r.userErrors.map((e) => e.message).join("; "));
      continue;
    }
    const variantId = r.product?.variants?.edges?.[0]?.node?.id;
    if (variantId) {
      const variants = [{
        id: variantId,
        price: p.price,
        compareAtPrice: p.compare_at || null,
        inventoryItem: { sku: p.sku, tracked: false },
      }];
      const { productVariantsBulkUpdate: vu } = await gql(variantUpdate, { productId: r.product.id, variants });
      if (vu.userErrors.length) {
        console.warn(`  \u203c ${p.handle} variant:`, vu.userErrors.map((e) => e.message).join("; "));
      }
    }
    if (onlineStoreId) {
      const errs = await publishResource(r.product.id, onlineStoreId);
      if (errs.length) console.warn(`  \u203c ${p.handle} publish:`, errs.map((e) => e.message).join("; "));
    }
    console.log(`  \u2714 ${p.handle}`);
  }
}

async function publishAllExistingProducts() {
  const onlineStoreId = await getOnlineStorePublicationId();
  if (!onlineStoreId) return;
  const { products } = await gql(`{ products(first: 100) { edges { node { id handle } } } }`);
  console.log(`\u2192 publishing ${products.edges.length} products to Online Store\u2026`);
  for (const { node } of products.edges) {
    const errs = await publishResource(node.id, onlineStoreId);
    if (errs.length) {
      console.warn(`  \u203c ${node.handle}:`, errs.map((e) => e.message).join("; "));
    } else {
      console.log(`  \u2714 ${node.handle}`);
    }
  }
}

// ---------- Runner ----------

async function main() {
  console.log(`\u2192 seeding ${store}`);
  const shopInfo = await gql(`{ shop { currencyCode } }`);
  SHOP_CURRENCY = shopInfo.shop.currencyCode;
  console.log(`  shop currency: ${SHOP_CURRENCY}`);
  const all = !only;
  if (all || only === "metafields") await seedMetafields();
  if (all || only === "collections") await seedCollections();
  if (all || only === "pages") await seedPages();
  if (all || only === "articles") await seedArticles();
  if (all || only === "products") await seedProducts();
  if (only === "publish") await publishAllExistingProducts();
  console.log("\u2714 done.");
}

main().catch((err) => {
  console.error("\u2716", err.message);
  process.exit(1);
});
