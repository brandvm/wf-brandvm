"""Fix broken internal links in Posts rich text (post-content), SEO crawl Phase 1.

Stages:
  test  <slug>    update ONE post (staged, not live), then diff the stored HTML
  apply           same for every remaining post in the plan (skips ones already done)
  verify          re-read every planned post and check no broken href is left

Plan: posts-broken-links-plan-2026-10-27.json (one row per link: repoint or
unlink, decided by hand; D8: no clear live match -> unlink, text kept).
Only the <a> tags named in the plan change: repoint swaps the href,
unlink replaces the tag with its inner HTML. Writes go to the staged item
only; nothing is published here. Token is read from wf-brandvm/.env,
never printed.
"""
import sys, os, re, json, time, html, urllib.request, urllib.error

W = os.path.dirname(os.path.abspath(__file__))
REPO = '/Users/Work/Documents/Webflow Projects/Brand Vision/wf-brandvm'
SITE = '68b9f0236581de795cba8ec2'
CID = '69fd085c7299c8fab016ef89'
BASE = 'https://www.brandvm.com'
PLAN = W + '/posts-broken-links-plan-2026-10-27.json'
BACKUP = W + '/posts-broken-links-backup-2026-10-27.jsonl'
ROLLBACK = W + '/posts-broken-links-rollback-2026-10-27.json'
TOK = [l.split('=', 1)[1].strip().strip('"\'') for l in open(REPO + '/.env') if l.startswith('WEBFLOW_TOKEN=')][0]


def api(method, path, body=None, tries=6):
    data = json.dumps(body).encode() if body is not None else None
    for n in range(tries):
        req = urllib.request.Request('https://api.webflow.com/v2' + path, data=data, method=method,
                                     headers={'Authorization': 'Bearer ' + TOK, 'accept': 'application/json',
                                              'content-type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                time.sleep(1.1)  # 60 requests/min on this token
                txt = r.read()
                return json.loads(txt) if txt else {}
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='ignore')[:400]
            if e.code == 429 or e.code >= 500:
                time.sleep(int(e.headers.get('Retry-After') or 0) or 5 * (n + 1)); continue
            raise RuntimeError(f'{method} {path} -> {e.code} {msg}')
    raise RuntimeError(f'{method} {path} -> gave up after retries')


def anchor_re(dest):
    return re.compile(r'<a\b[^>]*\bhref="' + re.escape(dest) + r'/?"[^>]*>(.*?)</a>', re.S)


def text_of(h):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', h))).strip()


def transform(body, rows):
    """Apply the plan rows for one post. Each named link must occur exactly once."""
    changes = []
    for r in rows:
        rx = anchor_re(r['dest'])
        hits = rx.findall(body)
        if len(hits) != 1:
            raise RuntimeError(f"{r['source']}: {len(hits)} matches for {r['dest']}")
        m = rx.search(body)
        tag = m.group(0)
        old_href = re.search(r'\bhref="([^"]*)"', tag).group(1)
        if r['action'] == 'repoint':
            new_href = BASE + r['new_path']
            repl = tag.replace(f'href="{old_href}"', f'href="{new_href}"', 1)
        else:
            new_href = None
            repl = m.group(1)
        body = body[:m.start()] + repl + body[m.end():]
        changes.append({'anchor': text_of(m.group(1)), 'old_href': old_href, 'new_href': new_href,
                        'action': r['action'], 'old_tag': tag, 'new_html': repl})
    return body, changes


def check(old, new, changes):
    """Visible text unchanged; anchor count down by the unlinks; no other byte changed."""
    assert text_of(old) == text_of(new), 'visible text changed'
    unl = sum(c['action'] == 'unlink' for c in changes)
    assert len(re.findall(r'<a\b', old)) - len(re.findall(r'<a\b', new)) == unl, 'anchor count off'
    rebuilt = old
    for c in changes:
        assert rebuilt.count(c['old_tag']) == 1
        rebuilt = rebuilt.replace(c['old_tag'], c['new_html'], 1)
    assert rebuilt == new, 'unexpected difference'


def load_done():
    return json.load(open(ROLLBACK)) if os.path.exists(ROLLBACK) else {'items': []}


def do_item(item_id, rows):
    it = api('GET', f'/collections/{CID}/items/{item_id}')
    fd = it['fieldData']
    old = fd['post-content']
    new, changes = transform(old, rows)
    check(old, new, changes)
    with open(BACKUP, 'a') as f:  # original body first, before any write
        f.write(json.dumps({'id': item_id, 'slug': fd['slug'], 'lastUpdated': it['lastUpdated'],
                            'isDraft': it['isDraft'], 'post-content': old}, ensure_ascii=False) + '\n')
    api('PATCH', f'/collections/{CID}/items',
        {'items': [{'id': item_id, 'fieldData': {'name': fd['name'], 'slug': fd['slug'], 'post-content': new}}]})
    back = api('GET', f'/collections/{CID}/items/{item_id}')
    stored = back['fieldData']['post-content']
    for r in rows:
        assert not anchor_re(r['dest']).search(stored), f"{fd['slug']}: {r['dest']} still linked"
    for c in changes:
        if c['new_href']:
            assert f'href="{c["new_href"]}"' in stored, f"{fd['slug']}: {c['new_href']} missing"
    assert text_of(stored) == text_of(old), f"{fd['slug']}: stored text differs"
    assert back['isDraft'] == it['isDraft']
    done = load_done()
    done['items'].append({'id': item_id, 'slug': fd['slug'], 'isDraft': it['isDraft'],
                          'updated': back['lastUpdated'],
                          'changes': [{k: c[k] for k in ('anchor', 'action', 'old_href', 'new_href')} for c in changes]})
    json.dump(done, open(ROLLBACK, 'w'), indent=1, ensure_ascii=False)
    print(f"ok {fd['slug']}: " + ', '.join(f"{c['action']} {c['old_href'].replace(BASE, '')}" for c in changes))


def by_item():
    plan = json.load(open(PLAN))
    out = {}
    for r in plan:
        out.setdefault(r['item_id'], []).append(r)
    return out


if __name__ == '__main__':
    cmd = sys.argv[1]
    groups = by_item()
    done = {i['id'] for i in load_done()['items']}
    if cmd == 'test':
        slug = sys.argv[2]
        iid = next(k for k, v in groups.items() if v[0]['source'] == slug)
        do_item(iid, groups[iid])
    elif cmd == 'apply':
        for iid, rows in groups.items():
            if iid not in done:
                do_item(iid, rows)
    elif cmd == 'verify':
        bad = 0
        for iid, rows in groups.items():
            body = api('GET', f'/collections/{CID}/items/{iid}')['fieldData']['post-content']
            for r in rows:
                if anchor_re(r['dest']).search(body):
                    bad += 1; print('still linked:', r['source'], r['dest'])
        print(f'{len(groups)} posts checked, {bad} broken links left')
