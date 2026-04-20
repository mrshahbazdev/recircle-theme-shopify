#!/usr/bin/env node
/**
 * Install (or update) the ReCircle theme on a Shopify dev/prod store via
 * Admin REST API. Iterates the local working copy and uploads each file
 * under layout/, templates/, sections/, snippets/, assets/, config/, locales/
 * to a newly-created (or named, existing) unpublished theme.
 *
 * Required env:
 *   SHOPIFY_STORE        e.g. prodevnns.myshopify.com
 *   SHOPIFY_ADMIN_TOKEN  Admin API token with read_themes/write_themes/read_files/write_files
 *
 * Optional env:
 *   THEME_NAME           Display name (default: "ReCircle")
 *   THEME_PUBLISH        "1" to publish after upload (default: leave unpublished)
 *   THEME_REUSE          "1" to reuse an existing theme with the same name (overwrites)
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const NAME = process.env.THEME_NAME || 'ReCircle';
const PUBLISH = process.env.THEME_PUBLISH === '1';
const REUSE = process.env.THEME_REUSE === '1';
const API = '2024-10';

if (!STORE || !TOKEN) {
  console.error('Missing SHOPIFY_STORE or SHOPIFY_ADMIN_TOKEN');
  process.exit(1);
}

const BASE = `https://${STORE}/admin/api/${API}`;
const REPO_ROOT = path.resolve(new URL('..', import.meta.url).pathname);
// Order matters: Shopify validates each file at upload time. Sections/snippets
// must exist before templates that reference them.
const DIRS = ['assets', 'config', 'locales', 'snippets', 'sections', 'layout', 'templates'];
const BINARY_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.woff', '.woff2', '.ttf', '.otf', '.ico', '.pdf']);

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000));
    return api(method, path, body);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 400)}`);
  }
  return res.json();
}

async function listFiles() {
  const out = [];
  for (const dir of DIRS) {
    const abs = path.join(REPO_ROOT, dir);
    try { await fs.access(abs); } catch { continue; }
    await walk(abs, out);
  }
  return out;
}

async function walk(dir, out) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { await walk(full, out); continue; }
    out.push(full);
  }
}

function relKey(full) {
  return path.relative(REPO_ROOT, full).split(path.sep).join('/');
}

async function uploadAsset(themeId, full) {
  const key = relKey(full);
  const ext = path.extname(full).toLowerCase();
  const buf = await fs.readFile(full);
  const payload = { asset: { key } };
  if (BINARY_EXT.has(ext)) payload.asset.attachment = buf.toString('base64');
  else payload.asset.value = buf.toString('utf8');
  await api('PUT', `/themes/${themeId}/assets.json`, payload);
}

async function findExisting() {
  const data = await api('GET', '/themes.json');
  return (data.themes || []).find((t) => t.name === NAME);
}

async function createTheme() {
  const data = await api('POST', '/themes.json', { theme: { name: NAME, role: 'unpublished' } });
  return data.theme;
}

async function deleteTheme(id) {
  await api('DELETE', `/themes/${id}.json`);
}

async function publishTheme(id) {
  await api('PUT', `/themes/${id}.json`, { theme: { id, role: 'main' } });
}

(async () => {
  console.log(`Store: ${STORE}`);
  console.log(`Theme name: ${NAME}`);
  let theme = await findExisting();
  if (theme && !REUSE) {
    console.log(`Existing theme "${NAME}" found (id=${theme.id}). Deleting & recreating…`);
    await deleteTheme(theme.id);
    theme = null;
  }
  if (!theme) {
    console.log('Creating theme…');
    theme = await createTheme();
  }
  console.log(`Theme id: ${theme.id}`);

  const files = await listFiles();
  console.log(`Uploading ${files.length} files…`);
  let done = 0;
  let failed = 0;
  // Sequential to respect API rate limits.
  for (const f of files) {
    try {
      await uploadAsset(theme.id, f);
      done++;
      if (done % 10 === 0) console.log(`  ${done}/${files.length}`);
    } catch (e) {
      failed++;
      console.warn(`  ! ${relKey(f)} -> ${e.message.slice(0, 200)}`);
    }
  }
  console.log(`Uploaded ${done}/${files.length} (${failed} failed).`);

  if (PUBLISH) {
    console.log('Publishing theme…');
    await publishTheme(theme.id);
  } else {
    console.log(`Theme is unpublished. Preview/publish in admin: https://${STORE}/admin/themes/${theme.id}`);
  }
  console.log('Done.');
})().catch((e) => { console.error(e); process.exit(1); });
