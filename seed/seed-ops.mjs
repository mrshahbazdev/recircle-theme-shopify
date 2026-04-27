#!/usr/bin/env node
/**
 * Phase 29 — ops seed.
 *
 * Idempotently brings a dev / staging store up to v1.x feature parity:
 *   - Ensures Phase 19/20/28 metafield definitions exist (member_price, b2b_tiers, moq, size_chart_html).
 *   - Sets sample values on the first N products so the storefront features
 *     (member pricing, B2B tier table, MOQ guard) light up immediately.
 *
 * Usage:
 *   SHOPIFY_STORE=your-dev-store.myshopify.com \
 *   SHOPIFY_ADMIN_TOKEN=shpat_xxx \
 *   node seed/seed-ops.mjs [--limit=6]
 *
 * Required scopes: read_products, write_products, read_metaobject_definitions,
 *                  write_metaobject_definitions.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const store = process.env.SHOPIFY_STORE;
const token = process.env.SHOPIFY_ADMIN_TOKEN;
const limit = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] || 6);
const API_VERSION = "2024-10";

if (!store || !token) {
  console.error("✖ SHOPIFY_STORE and SHOPIFY_ADMIN_TOKEN env vars are required.");
  process.exit(2);
}

const endpoint = `https://${store}/admin/api/${API_VERSION}/graphql.json`;

async function gql(query, variables = {}) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function ensureDefinitions() {
  const defs = JSON.parse(
    await fs.readFile(path.join(__dirname, "metafield-definitions.json"), "utf8")
  ).filter((d) => ["member_price", "b2b_tiers", "moq", "size_chart_html"].includes(d.key));

  const mutation = /* GraphQL */ `
    mutation Create($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition { id key }
        userErrors { field message code }
      }
    }
  `;
  console.log(`→ ensuring ${defs.length} metafield definitions…`);
  for (const def of defs) {
    const { metafieldDefinitionCreate: r } = await gql(mutation, { definition: def });
    const taken = (r.userErrors || []).some((e) => e.code === "TAKEN");
    if (r.createdDefinition) console.log(`  ✔ ${def.key}`);
    else if (taken) console.log(`  · ${def.key} (already exists)`);
    else console.warn(`  ‼ ${def.key}:`, r.userErrors.map((e) => e.message).join("; "));
  }
}

async function listProducts(n) {
  const q = /* GraphQL */ `
    query ($n: Int!) {
      products(first: $n, sortKey: CREATED_AT, reverse: true) {
        edges { node { id title handle } }
      }
    }
  `;
  const { products } = await gql(q, { n });
  return products.edges.map((e) => e.node);
}

async function setProductMetafield(productId, namespace, key, type, value) {
  const mutation = /* GraphQL */ `
    mutation Set($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id key }
        userErrors { field message }
      }
    }
  `;
  const { metafieldsSet: r } = await gql(mutation, {
    metafields: [{ ownerId: productId, namespace, key, type, value }],
  });
  if (r.userErrors.length) {
    console.warn(`  ‼ ${key} on ${productId}:`, r.userErrors.map((e) => e.message).join("; "));
  }
}

let SHOP_CURRENCY = "EUR";

async function detectShopCurrency() {
  try {
    const { shop } = await gql(`{ shop { currencyCode } }`);
    if (shop?.currencyCode) {
      SHOP_CURRENCY = shop.currencyCode;
      console.log(`  shop currency: ${SHOP_CURRENCY}`);
    }
  } catch (e) {
    console.warn(`  ‼ could not detect shop currency, defaulting to EUR (${e.message})`);
  }
}

async function seedB2BAndMember() {
  const products = await listProducts(limit);
  if (!products.length) {
    console.warn("✖ no products found — import seed/products.csv first.");
    return;
  }
  console.log(`→ seeding member_price + b2b_tiers + moq on ${products.length} products…`);
  for (const [i, p] of products.entries()) {
    /* 10% off MSRP for member tier (rough — owner can edit later in admin). */
    await setProductMetafield(p.id, "recircle", "member_price",
      "money",
      JSON.stringify({ amount: (49.0 + i * 7).toFixed(2), currency_code: process.env.SHOPIFY_CURRENCY || SHOP_CURRENCY })
    );
    /* Three-tier wholesale ladder. */
    await setProductMetafield(p.id, "recircle", "b2b_tiers",
      "json",
      JSON.stringify([
        { min_qty: 5,  price_pct_off: 5 },
        { min_qty: 10, price_pct_off: 10 },
        { min_qty: 25, price_pct_off: 18 },
      ])
    );
    /* Default MOQ for B2B = 1 (override on selected products). */
    await setProductMetafield(p.id, "recircle", "moq", "number_integer",
      String(i % 3 === 0 ? 5 : 1)
    );
    console.log(`  ✔ ${p.handle}`);
  }
}

(async () => {
  console.log(`▶ Ops seed — ${store}`);
  await detectShopCurrency();
  await ensureDefinitions();
  await seedB2BAndMember();
  console.log("✔ ops seed complete.");
})();
