#!/usr/bin/env node
/**
 * Phase 29 — publish theme locales.
 *
 * Adds + publishes shop locales matching the theme's translations
 * (de, fr, it, es, nl) so the storefront can switch between them.
 *
 * Usage:
 *   SHOPIFY_STORE=your-dev-store.myshopify.com \
 *   SHOPIFY_ADMIN_TOKEN=shpat_xxx \
 *   node seed/publish-locales.mjs
 *
 * Required scopes: read_locales, write_locales.
 */

const store = process.env.SHOPIFY_STORE;
const token = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = "2024-10";

if (!store || !token) {
  console.error("✖ SHOPIFY_STORE and SHOPIFY_ADMIN_TOKEN env vars are required.");
  process.exit(2);
}

const endpoint = `https://${store}/admin/api/${API_VERSION}/graphql.json`;
const TARGET_LOCALES = ["de", "fr", "it", "es", "nl"];

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

(async () => {
  console.log(`▶ Publishing locales — ${store}`);
  const { shopLocales } = await gql(/* GraphQL */ `
    query { shopLocales { locale primary published } }
  `);
  const have = new Map(shopLocales.map((l) => [l.locale, l]));

  for (const locale of TARGET_LOCALES) {
    const existing = have.get(locale);
    if (!existing) {
      const { shopLocaleEnable: r } = await gql(
        /* GraphQL */ `
          mutation ($locale: String!) {
            shopLocaleEnable(locale: $locale) {
              shopLocale { locale published }
              userErrors { field message }
            }
          }
        `,
        { locale }
      );
      if (r.userErrors.length) {
        console.warn(`  ‼ ${locale}:`, r.userErrors.map((e) => e.message).join("; "));
        continue;
      }
      console.log(`  ✔ enabled ${locale}`);
    } else if (!existing.published) {
      const { shopLocaleUpdate: r } = await gql(
        /* GraphQL */ `
          mutation ($locale: String!, $shopLocale: ShopLocaleInput!) {
            shopLocaleUpdate(locale: $locale, shopLocale: $shopLocale) {
              shopLocale { locale published }
              userErrors { field message }
            }
          }
        `,
        { locale, shopLocale: { published: true } }
      );
      if (r.userErrors.length) {
        console.warn(`  ‼ ${locale} publish:`, r.userErrors.map((e) => e.message).join("; "));
      } else {
        console.log(`  ✔ published ${locale}`);
      }
    } else {
      console.log(`  · ${locale} already published`);
    }
  }
  console.log("✔ locales done.");
})();
