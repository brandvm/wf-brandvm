#!/usr/bin/env node
// Builds www.brandvm.com's sitemap.xml from the Webflow Data API, without the
// Featured category and its posts. Those stay indexable (no noindex); they are
// only left out of the sitemap. Webflow cannot do this itself: its per-item
// "Sitemap Indexing" switch also adds <meta name="robots" content="noindex">.
//
//   WEBFLOW_TOKEN=… node scripts/sitemap.mjs <out.xml> [--compare <url>]
//
// Token scopes: sites:read, pages:read, cms:read. Settings: sitemap.config.json
// (collections with live template pages, the excluded category, extra paths).
// Runs in .github/workflows/staging.yml on a schedule; the file is served at
// https://brandvm.github.io/wf-brandvm/sitemap.xml, and brandvm.com points to it
// from robots.txt and a 301 on /sitemap.xml (both set in Webflow).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(here, 'sitemap.config.json'), 'utf8'));
const API = 'https://api.webflow.com/v2';

async function api(url, token) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(API + url, { headers: { Authorization: `Bearer ${token}`, accept: 'application/json' } });
    if (res.status === 429 && attempt < 5) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${url}: ${(await res.text()).slice(0, 200)}`);
    return res.json();
  }
}

async function all(url, key, token) {
  const out = [];
  for (let offset = 0; ; offset += 100) {
    const sep = url.includes('?') ? '&' : '?';
    const data = await api(`${url}${sep}limit=100&offset=${offset}`, token);
    out.push(...data[key]);
    const total = data.pagination?.total ?? out.length;
    if (out.length >= total || data[key].length === 0) return out;
  }
}

// Pure: turns API data into sorted { loc, lastmod } entries. Exported for tests.
export function buildEntries({ pages, collections, itemsBySlug }, conf = cfg) {
  const excluded = (p) =>
    conf.excludePaths.includes(p) || conf.excludePathPrefixes.some((pre) => p.startsWith(pre));
  const entries = [];

  for (const page of pages) {
    if (page.draft || page.archived || page.collectionId) continue;
    const p = page.publishedPath || '/';
    if (excluded(p)) continue;
    entries.push({ path: p, lastmod: page.lastUpdated, order: 0 });
  }

  const ex = conf.excludeCategory;
  const catIds = new Set(
    (itemsBySlug[ex.categoryCollection] || [])
      .filter((i) => ex.categorySlugs.includes(i.fieldData.slug))
      .map((i) => i.id),
  );

  for (const col of collections) {
    const prefix = conf.collections[col.slug];
    if (!prefix) continue;
    for (const item of itemsBySlug[col.slug] || []) {
      if (item.isDraft || item.isArchived) continue;
      if (col.slug === ex.categoryCollection && catIds.has(item.id)) continue;
      if (col.slug === ex.itemCollection) {
        const ref = item.fieldData[ex.referenceField];
        const refs = Array.isArray(ref) ? ref : ref ? [ref] : [];
        if (refs.some((id) => catIds.has(id))) continue;
      }
      const p = `${prefix}/${item.fieldData.slug}`;
      if (excluded(p)) continue;
      entries.push({ path: p, lastmod: item.lastPublished || item.lastUpdated, order: 1 });
    }
  }
  entries.sort((a, b) => a.order - b.order || a.path.localeCompare(b.path));
  return entries.map(({ path: p, lastmod }) => ({
    loc: p === '/' ? conf.baseUrl : conf.baseUrl + p,
    lastmod,
  }));
}

export function toXml(entries) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const urls = entries
    .map((e) => `  <url>\n    <loc>${esc(e.loc)}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function main() {
  const [out, flag, compareUrl] = process.argv.slice(2);
  const token = process.env.WEBFLOW_TOKEN;
  if (!out) throw new Error('usage: sitemap.mjs <out.xml> [--compare <url>]');
  if (!token) throw new Error('WEBFLOW_TOKEN is not set');

  const pages = await all(`/sites/${cfg.siteId}/pages`, 'pages', token);
  const { collections } = await api(`/sites/${cfg.siteId}/collections`, token);
  const wanted = collections.filter((c) => cfg.collections[c.slug]);
  const itemsBySlug = {};
  for (const c of wanted) itemsBySlug[c.slug] = await all(`/collections/${c.id}/items/live`, 'items', token);

  const entries = buildEntries({ pages, collections: wanted, itemsBySlug });
  if (entries.length < 100) throw new Error(`only ${entries.length} URLs; refusing to publish a near-empty sitemap`);
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, toXml(entries));
  console.log(`sitemap: ${entries.length} URLs -> ${out}`);

  if (flag === '--compare' && compareUrl) {
    const old = await (await fetch(compareUrl)).text();
    const oldSet = new Set([...old.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
    const newSet = new Set(entries.map((e) => e.loc));
    const gone = [...oldSet].filter((u) => !newSet.has(u));
    const added = [...newSet].filter((u) => !oldSet.has(u));
    console.log(`compare with ${compareUrl}: ${gone.length} removed, ${added.length} added`);
    for (const u of added.slice(0, 50)) console.log('  + ' + u);
    for (const u of gone.slice(0, 50)) console.log('  - ' + u);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('sitemap:', err.message);
    process.exit(1);
  });
}
