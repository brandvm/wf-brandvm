"""SEO crawl Phase 4: metadata and heading fixes (staged, not published).

  apply    back up each field, write the new value, read it back
  verify   re-read every change and compare with the record

Changes (decided 2026-10-27, see docs/audit/2026-10-20-seo-crawl/phase4-metadata-2026-10-27.md):
  - Posts: bathroom remodelling post had the kitchen post's description.
  - Posts: 9 bodies with <h1> headings inside the rich text (the template
    already has the page's H1) -> <h2>, nothing else changed.
  - Case Studies: law-firm-website-seo meta-title under 30 characters.
  - Page /insights-contact: same meta description as /contact.
Token is read from wf-brandvm/.env, never printed.
"""
import sys, os, re, json, importlib.util

W = os.path.dirname(os.path.abspath(__file__))
_s = importlib.util.spec_from_file_location('pbl', W + '/posts-broken-links.py')
pbl = importlib.util.module_from_spec(_s); _s.loader.exec_module(pbl)
api, text_of = pbl.api, pbl.text_of
POSTS, CASES = pbl.CID, '6a160018153843878b5c460f'
RECORD = W + '/seo-metadata-fixes-rollback-2026-10-27.json'

H1_POSTS = ['telegram-mini-app-the-future-of-seamless-ux-inside-messengers',
            'website-structure-expertise-conversion-strategy',
            'the-role-of-video-editing-in-building-strong-brand-identity',
            'survive-thrive-risk-tips-for-startups',
            'ai-in-digital-marketing-how-to-avoid-over-optimization-and-predictable-content',
            'as-streamers-partner-in-different-regions-heres-what-not-to-miss-from-anywhere-using-proxies',
            'cloud-developers-for-hire-how-to-choose-the-best-team-for-your-business',
            'using-domain-intelligence-to-improve-content-strategy',
            'top-emerging-it-talent-markets-in-2026']
FIELDS = [
    (POSTS, 'top-bathroom-remodelling-companies-in-bellevue', 'description',
     'Discover the top bathroom remodeling companies in Bellevue offering custom bathroom '
     'renovations, vanity installations, tile upgrades, and full-service bathroom design.'),
    (CASES, 'law-firm-website-seo', 'meta-title', 'Local SEO Case Study for a Law Firm in Ontario'),
]
PAGE = ('6a7f63efe0defe3cbf902aea', 'insights-contact',
        'Questions about a Brand Vision Insights article, or a project in mind? Contact our team '
        'about branding, web design, UX, SEO, development or digital marketing.')


def h1_to_h2(body):
    return re.sub(r'<(/?)h1(\b[^>]*)>', r'<\1h2\2>', body)


def record():
    return json.load(open(RECORD)) if os.path.exists(RECORD) else {'changes': []}


def save(rec):
    json.dump(rec, open(RECORD, 'w'), indent=1, ensure_ascii=False)


def by_slug(cid, slug):
    return api('GET', f'/collections/{cid}/items?slug={slug}')['items'][0]


def write_item(rec, cid, slug, field, new_fn, kind):
    if any(c['slug'] == slug and c['field'] == field for c in rec['changes']):
        return
    it = by_slug(cid, slug); fd = it['fieldData']
    old = fd.get(field)
    new = new_fn(old)
    assert new != old, f'{slug}: nothing to change'
    if kind == 'h1':
        assert text_of(old) == text_of(new) and not re.search(r'<h1\b', new)
    rec['changes'].append({'collection': cid, 'id': it['id'], 'slug': slug, 'field': field,
                           'isDraft': it['isDraft'], 'old': old, 'new': new})
    save(rec)  # old value on disk before the write
    api('PATCH', f'/collections/{cid}/items',
        {'items': [{'id': it['id'], 'fieldData': {'name': fd['name'], 'slug': fd['slug'], field: new}}]})
    back = api('GET', f'/collections/{cid}/items/{it["id"]}')
    assert back['fieldData'][field] == new and back['isDraft'] == it['isDraft'], f'{slug}: read-back differs'
    print('ok', slug, field)


def apply():
    rec = record()
    for slug in H1_POSTS:
        write_item(rec, POSTS, slug, 'post-content', h1_to_h2, 'h1')
    for cid, slug, field, value in FIELDS:
        write_item(rec, cid, slug, field, lambda _old, v=value: v, 'text')
    pid, slug, desc = PAGE
    if not any(c['slug'] == slug for c in rec['changes']):
        pg = api('GET', f'/pages/{pid}')
        old = pg['seo']
        rec['changes'].append({'page': pid, 'slug': slug, 'field': 'seo.description',
                               'old': old.get('description'), 'new': desc})
        save(rec)
        api('PUT', f'/pages/{pid}', {'seo': {'title': old.get('title'), 'description': desc}})
        assert api('GET', f'/pages/{pid}')['seo']['description'] == desc
        print('ok', slug, 'seo.description')


def verify():
    bad = 0
    for c in record()['changes']:
        if 'page' in c:
            now = api('GET', f'/pages/{c["page"]}')['seo']['description']
        else:
            now = api('GET', f'/collections/{c["collection"]}/items/{c["id"]}')['fieldData'][c['field']]
        if now != c['new']:
            bad += 1; print('differs:', c['slug'], c['field'])
    print(len(record()['changes']), 'changes checked,', bad, 'differ')


if __name__ == '__main__':
    {'apply': apply, 'verify': verify}[sys.argv[1]]()
