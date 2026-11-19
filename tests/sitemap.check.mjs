// node --test tests/sitemap.check.mjs — rules of scripts/sitemap.mjs on fixture data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEntries, toXml, toFiles } from '../scripts/sitemap.mjs';

const FEAT = 'cat-featured';
const data = {
  pages: [
    { publishedPath: '/', lastUpdated: 't0' },
    { publishedPath: '/contact', lastUpdated: 't1' },
    { publishedPath: '/404', lastUpdated: 't' },
    { publishedPath: '/design/style-guide', lastUpdated: 't' },
    { publishedPath: '/draft', draft: true },
    { publishedPath: '/post', collectionId: 'c-post' },
  ],
  collections: [
    { slug: 'post', id: 'c-post' },
    { slug: 'insights', id: 'c-cat' },
    { slug: 'services-tabs', id: 'c-tabs' },
  ],
  itemsBySlug: {
    insights: [
      { id: FEAT, fieldData: { slug: 'featured' } },
      { id: 'cat-seo', fieldData: { slug: 'seo-agency' }, lastPublished: 'p' },
    ],
    post: [
      { id: 'a', fieldData: { slug: 'kept', category: 'cat-seo' }, lastPublished: 'p1' },
      { id: 'b', fieldData: { slug: 'featured-one', category: FEAT } },
      { id: 'c', fieldData: { slug: 'no-category', category: null }, lastPublished: 'p2' },
      { id: 'd', fieldData: { slug: 'biggest-athlete-endorsement-deals' } },
      { id: 'e', fieldData: { slug: 'draft-one' }, isDraft: true },
    ],
    'services-tabs': [{ id: 'x', fieldData: { slug: 'no-template' } }],
  },
};

test('drops Featured, its posts, drafts, utility and excluded paths', () => {
  const locs = buildEntries(data).map((e) => e.loc);
  assert.deepEqual(locs, [
    'https://www.brandvm.com',
    'https://www.brandvm.com/contact',
    'https://www.brandvm.com/post/kept',
    'https://www.brandvm.com/post/no-category',
    'https://www.brandvm.com/insights/seo-agency',
  ]);
});

test('writes valid sitemap XML', () => {
  const xml = toXml([{ loc: 'https://www.brandvm.com/a&b', lastmod: '2026-01-01T00:00:00Z' }]);
  assert.match(xml, /^<\?xml version="1.0"/);
  assert.match(xml, /<loc>https:\/\/www\.brandvm\.com\/a&amp;b<\/loc>/);
  assert.match(xml, /<lastmod>2026-01-01T00:00:00Z<\/lastmod>/);
});

test('splits into group files with an index', () => {
  const files = toFiles(buildEntries(data));
  assert.deepEqual(Object.keys(files).sort(), ['sitemap-categories.xml', 'sitemap-pages.xml', 'sitemap-posts.xml', 'sitemap.xml']);
  assert.match(files['sitemap.xml'], /<sitemapindex/);
  assert.match(files['sitemap.xml'], /<loc>https:\/\/brandvm\.github\.io\/wf-brandvm\/sitemap-posts\.xml<\/loc>/);
  assert.equal((files['sitemap-posts.xml'].match(/<url>/g) || []).length, 2);
  assert.match(files['sitemap-pages.xml'], /<loc>https:\/\/www\.brandvm\.com<\/loc>/);
});
