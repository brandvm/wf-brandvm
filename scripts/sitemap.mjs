#!/usr/bin/env node
// Builds www.brandvm.com's sitemap.xml from the Webflow Data API, without the
// Featured category and its posts. Those stay indexable (no noindex); they are
// only left out of the sitemap. Webflow cannot do this itself: its per-item
// "Sitemap Indexing" switch also adds <meta name="robots" content="noindex">.
//
//   WEBFLOW_TOKEN=… node scripts/sitemap.mjs <out-dir> [--compare <url>]
//
// Writes sitemap.xml (a sitemap index, like WordPress) and one
// sitemap-<group>.xml per group: pages, posts, categories, authors,
// case-studies, services, industries (groups set in sitemap.config.json).
//
// Token scopes: sites:read, pages:read, cms:read. Settings: sitemap.config.json
// (collections with live template pages, the excluded category, extra paths).
// Runs in .github/workflows/staging.yml on a schedule; the file is served at
// https://brandvm.github.io/wf-brandvm/sitemap.xml (+ the group files), and brandvm.com points to it
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

// Importance order for static pages: listed first, unlisted A-Z, the 'last' list at the end.
function pageKey(p, conf) {
  const i = (conf.pageOrder || []).indexOf(p);
  if (i >= 0) return [0, i];
  const j = (conf.pageOrderLast || []).indexOf(p);
  return j >= 0 ? [2, j] : [1, p];
}
const cmpKey = (a, b) => {
  for (let k = 0; k < Math.max(a.length, b.length); k++) {
    if (a[k] === b[k]) continue;
    if (typeof a[k] === 'number' && typeof b[k] === 'number') return a[k] - b[k];
    return String(a[k]).localeCompare(String(b[k]));
  }
  return 0;
};
// CMS order: the collection's sort fields (missing values last), else the API's own order.
function sortItems(items, sort) {
  if (!sort?.length) return items;
  return items
    .map((item, i) => ({ item, i }))
    .sort((x, y) => {
      for (const { field, dir } of sort) {
        const a = x.item.fieldData[field], b = y.item.fieldData[field];
        const ma = a == null || a === '', mb = b == null || b === '';
        if (ma !== mb) return ma ? 1 : -1;
        if (ma) continue;
        const c = typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b));
        if (c) return dir === 'desc' ? -c : c;
      }
      return x.i - y.i;
    })
    .map((x) => x.item);
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
    entries.push({ path: p, lastmod: page.lastUpdated, group: 'pages', key: pageKey(p, conf) });
  }

  const ex = conf.excludeCategory;
  const catIds = new Set(
    (itemsBySlug[ex.categoryCollection] || [])
      .filter((i) => ex.categorySlugs.includes(i.fieldData.slug))
      .map((i) => i.id),
  );

  for (const col of collections) {
    const def = conf.collections[col.slug];
    if (!def) continue;
    const { prefix, group } = def;
    const items = sortItems(itemsBySlug[col.slug] || [], def.sort);
    for (const [i, item] of items.entries()) {
      if (item.isDraft || item.isArchived) continue;
      if (col.slug === ex.categoryCollection && catIds.has(item.id)) continue;
      if (col.slug === ex.itemCollection) {
        const ref = item.fieldData[ex.referenceField];
        const refs = Array.isArray(ref) ? ref : ref ? [ref] : [];
        if (refs.some((id) => catIds.has(id))) continue;
      }
      const p = `${prefix}/${item.fieldData.slug}`;
      if (excluded(p)) continue;
      entries.push({ path: p, lastmod: item.lastPublished || item.lastUpdated, group, key: [def.rank ?? 0, i] });
    }
  }
  const rank = (g) => (conf.groupOrder.indexOf(g) + 1 || 99);
  entries.sort((a, b) => rank(a.group) - rank(b.group) || cmpKey(a.key, b.key));
  return entries.map(({ path: p, lastmod, group }) => ({
    loc: p === '/' ? conf.baseUrl : conf.baseUrl + p,
    lastmod,
    group,
  }));
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function toXml(entries) {
  const urls = entries
    .map((e) => `  <url>\n    <loc>${esc(e.loc)}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

// Group files + an index pointing at them. Returns { 'sitemap.xml': …, 'sitemap-posts.xml': … }.
export function toFiles(entries, conf = cfg) {
  const groups = [...new Set(entries.map((e) => e.group))];
  const files = {};
  const index = [];
  for (const g of groups) {
    const list = entries.filter((e) => e.group === g);
    const name = `sitemap-${g}.xml`;
    files[name] = toXml(list);
    const last = list.map((e) => e.lastmod).filter(Boolean).sort().pop();
    index.push(`  <sitemap>\n    <loc>${esc(`${conf.publicUrl}/${name}`)}</loc>${last ? `\n    <lastmod>${last}</lastmod>` : ''}\n  </sitemap>`);
  }
  files['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${index.join('\n')}\n</sitemapindex>\n`;
  return files;
}

async function main() {
  const [out, flag, compareUrl] = process.argv.slice(2);
  const token = process.env.WEBFLOW_TOKEN;
  if (!out) throw new Error('usage: sitemap.mjs <out-dir> [--compare <url>]');
  if (!token) throw new Error('WEBFLOW_TOKEN is not set');

  const pages = await all(`/sites/${cfg.siteId}/pages`, 'pages', token);
  const { collections } = await api(`/sites/${cfg.siteId}/collections`, token);
  const wanted = collections.filter((c) => cfg.collections[c.slug]);
  const itemsBySlug = {};
  for (const c of wanted) itemsBySlug[c.slug] = await all(`/collections/${c.id}/items/live`, 'items', token);

  const entries = buildEntries({ pages, collections: wanted, itemsBySlug });
  if (entries.length < 100) throw new Error(`only ${entries.length} URLs; refusing to publish a near-empty sitemap`);
  fs.mkdirSync(out, { recursive: true });
  const files = toFiles(entries);
  for (const [name, xml] of Object.entries(files)) fs.writeFileSync(path.join(out, name), xml);
  const counts = Object.keys(files).filter((n) => n !== 'sitemap.xml')
    .map((n) => `${n.slice(8, -4)} ${entries.filter((e) => e.group === n.slice(8, -4)).length}`);
  console.log(`sitemap: ${entries.length} URLs in ${counts.length} files (${counts.join(', ')}) -> ${out}`);

  if (flag === '--compare' && compareUrl) {
    let old = await (await fetch(compareUrl)).text();
    if (old.includes('<sitemapindex')) {
      const kids = [...old.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      old = (await Promise.all(kids.map(async (u) => (await fetch(u)).text()))).join('');
    }
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
