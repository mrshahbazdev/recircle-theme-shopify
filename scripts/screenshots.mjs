#!/usr/bin/env node
/**
 * Theme Store screenshot capture script.
 *
 * Captures the 14 assets required by docs/SCREENSHOTS.md using Playwright,
 * driving a headless Chromium against the seeded demo store.
 *
 * Usage:
 *   SHOPIFY_STORE=recircle-demo.myshopify.com \
 *   THEME_ID=189945053365 \
 *   STOREFRONT_PASSWORD=your-dev-pwd \
 *   node scripts/screenshots.mjs
 *
 * Output: screenshots/*.jpg (14 files)
 *
 * Prerequisite:
 *   npm i -D playwright
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const STORE = process.env.SHOPIFY_STORE;
const THEME_ID = process.env.THEME_ID;
const PWD = process.env.STOREFRONT_PASSWORD || '';

if (!STORE || !THEME_ID) {
  console.error('Set SHOPIFY_STORE and THEME_ID env vars (see docs/SCREENSHOTS.md).');
  process.exit(1);
}

const ORIGIN = `https://${STORE}`;
const PV = `preview_theme_id=${THEME_ID}`;
const OUT = resolve(process.cwd(), 'screenshots');
mkdirSync(OUT, { recursive: true });

/** All shots — keep in sync with docs/SCREENSHOTS.md */
const SHOTS = [
  { f: 'cover.jpg',                          w: 1200, h: 800,  url: '/' },
  { f: 'thumbnail.jpg',                      w: 600,  h: 900,  url: '/products/iphone-13-pro-refurbished' },
  { f: 'feature-01-pdp-desktop.jpg',         w: 1440, h: 900,  url: '/products/iphone-13-pro-refurbished' },
  { f: 'feature-02-collection.jpg',          w: 1440, h: 900,  url: '/collections/all?filter.p.m.recircle.condition_grade=A' },
  { f: 'feature-03-cart.jpg',                w: 1440, h: 900,  url: '/products/iphone-13-pro-refurbished', after: openCart },
  { f: 'feature-04-trade-in.jpg',            w: 1440, h: 900,  url: '/pages/trade-in' },
  { f: 'feature-05-dpp.jpg',                 w: 1440, h: 900,  url: '/products/iphone-13-pro-refurbished#dpp' },
  { f: 'feature-06-compare.jpg',             w: 1440, h: 900,  url: '/pages/compare', after: seedCompare },
  { f: 'feature-07-account-credits.jpg',     w: 1440, h: 900,  url: '/account', auth: 'standard' },
  { f: 'feature-08-b2b-quote.jpg',           w: 1440, h: 900,  url: '/pages/quote', after: prefillQuote },
  { f: 'mobile-01-pdp.jpg',                  w: 375,  h: 812,  url: '/products/iphone-13-pro-refurbished' },
  { f: 'mobile-02-cart.jpg',                 w: 375,  h: 812,  url: '/products/iphone-13-pro-refurbished', after: openCart },
  { f: 'mobile-03-search.jpg',               w: 375,  h: 812,  url: '/?q=iphone', after: openSearch },
  { f: 'og-default.jpg',                     w: 1200, h: 630,  url: '/' },
];

async function openCart(page) {
  await page.evaluate(async () => {
    const r = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: window.__demoVariantA || 0, quantity: 1 }, { id: window.__demoVariantB || 0, quantity: 1 }] }),
    });
    return r.ok;
  });
  await page.click('[data-cart-toggle]').catch(() => {});
  await page.waitForTimeout(450);
}

async function seedCompare(page) {
  await page.evaluate(() => {
    localStorage.setItem('recircle:compare', JSON.stringify(['iphone-13-128gb-refurb','macbook-air-m1-2020-refurb','galaxy-s22-128gb-refurb']));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
}

async function openSearch(page) {
  await page.click('[data-predictive-search-toggle], [data-search-toggle]').catch(() => {});
  await page.fill('input[type="search"]', 'iphone').catch(() => {});
  await page.waitForTimeout(700);
}

async function prefillQuote(page) {
  await page.fill('input[name="contact[Full name]"]', 'Eve Reviewer').catch(() => {});
  await page.fill('input[name="contact[email]"]', 'eve@example.eu').catch(() => {});
  await page.fill('input[name="contact[Company]"]', 'Reviewer GmbH').catch(() => {});
  await page.fill('textarea[name="contact[Products of interest]"]', 'Refurb iPhone 13 Pro × 50, Refurb MacBook Air × 25').catch(() => {});
}

async function unlockPassword(page) {
  if (!PWD) return;
  // Hit /password first, accept gate
  await page.goto(`${ORIGIN}/password?${PV}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  const pwField = page.locator('input[type="password"]').first();
  if (await pwField.count()) {
    await pwField.fill(PWD);
    await page.locator('form[action*="password"] button[type="submit"]').click().catch(() => {});
    await page.waitForLoadState('domcontentloaded');
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  // Optional comma-separated filter: SHOT=feature-06-compare,feature-07-account-credits node scripts/screenshots.mjs
  const onlyShots = (process.env.SHOT || '').split(',').map((s) => s.trim()).filter(Boolean);
  const queue = onlyShots.length ? SHOTS.filter((s) => onlyShots.some((n) => s.f.startsWith(n))) : SHOTS;
  for (const s of queue) {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    try {
      await unlockPassword(page);
      const sep = s.url.includes('?') ? '&' : '?';
      await page.goto(`${ORIGIN}${s.url}${sep}${PV}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      // Settle async widgets (analytics, chat, predictive search) without blocking on networkidle
      await page.waitForTimeout(900);
      if (s.after) await s.after(page);
      await page.waitForTimeout(350);
      await page.screenshot({ path: resolve(OUT, s.f), type: 'jpeg', quality: 88, fullPage: false });
      console.log(`  ✓ ${s.f}  (${s.w}×${s.h})`);
    } catch (err) {
      console.error(`  ✗ ${s.f}  ${err.message}`);
    } finally {
      await ctx.close();
    }
  }
  await browser.close();
})();
