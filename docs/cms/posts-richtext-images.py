"""Compress oversized images inside Posts rich text (post-content).

Stages:
  plan            fetch live posts, measure body images, convert oversized ones locally
  test  <slug>    upload + update + publish ONE post, then diff the stored HTML
  apply           same for every remaining planned post (skips ones already done)

State lives in this folder (W). Backups of every original post-content are
written before any update. Token is read from wf-brandvm/.env, never printed.
"""
import sys, os, re, json, time, hashlib, io, urllib.request, urllib.error, urllib.parse, subprocess, html
from concurrent.futures import ThreadPoolExecutor

W = os.path.dirname(os.path.abspath(__file__))
REPO = '/Users/Work/Documents/Webflow Projects/Brand Vision/wf-brandvm'
SITE = '68b9f0236581de795cba8ec2'
CID = '69fd085c7299c8fab016ef89'
THRESH = 300_000
MAXW = 1600
QUALITY = 82
TOK = [l.split('=', 1)[1].strip().strip('"\'') for l in open(REPO + '/.env') if l.startswith('WEBFLOW_TOKEN=')][0]


def api(method, path, body=None, tries=6):
    data = json.dumps(body).encode() if body is not None else None
    for n in range(tries):
        req = urllib.request.Request('https://api.webflow.com/v2' + path, data=data, method=method,
                                     headers={'Authorization': 'Bearer ' + TOK, 'accept': 'application/json',
                                              'content-type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                time.sleep(0.6)  # stay well under the rate limit
                txt = r.read()
                return json.loads(txt) if txt else {}
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='ignore')[:400]
            if e.code == 429 or e.code >= 500:
                time.sleep(int(e.headers.get('Retry-After') or 0) or 5 * (n + 1)); continue
            raise RuntimeError(f'{method} {path} -> {e.code} {msg}')
    raise RuntimeError(f'{method} {path} -> gave up after retries')


def head(u):
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, method='HEAD', headers={'User-Agent': 'brandvm-audit'}), timeout=30)
        return u, int(r.headers.get('Content-Length') or 0), r.headers.get('Content-Type', '')
    except Exception as e:
        return u, -1, str(e)[:80]


def fetch_live_posts():
    items, off = [], 0
    while True:
        j = api('GET', f'/collections/{CID}/items?limit=100&offset={off}')
        items += j['items']; off += 100
        if off >= j['pagination']['total']: break
    return [i for i in items if not i['isDraft'] and not i['isArchived']]


def plan():
    from PIL import Image
    posts = fetch_live_posts()
    json.dump(posts, open(W + '/posts_live.json', 'w'))
    refs = {}
    for p in posts:
        for u in set(re.findall(r'<img[^>]*?src="([^"]+)"', p['fieldData'].get('post-content') or '')):
            if 'website-files.com' in u: refs.setdefault(u, []).append(p['id'])
    with ThreadPoolExecutor(8) as ex: sizes = list(ex.map(head, refs))
    os.makedirs(W + '/orig', exist_ok=True); os.makedirs(W + '/out', exist_ok=True)
    todo = [(u, s, t) for u, s, t in sizes if s > THRESH and 'gif' not in t and 'svg' not in t]
    broken = [(u, t, refs[u]) for u, s, t in sizes if s < 0]

    def conv(x):
        u, s, t = x
        k = hashlib.md5(u.encode()).hexdigest()
        src, dst = f'{W}/orig/{k}', f'{W}/out/{k}.webp'
        if not os.path.exists(src):
            urllib.request.urlretrieve(u, src)
        im = Image.open(src); w, h = im.size
        alpha = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
        im2 = im.convert('RGBA' if alpha else 'RGB')
        if w > MAXW: im2 = im2.resize((MAXW, round(h * MAXW / w)), Image.LANCZOS)
        im2.save(dst, 'WEBP', quality=QUALITY, method=6)
        n = os.path.getsize(dst)
        if n >= s * 0.9: os.remove(dst); return dict(url=u, skip='no gain', orig=s)
        base = urllib.parse.unquote(urllib.parse.unquote(u.rsplit('/', 1)[1]))
        base = re.sub(r'^([0-9a-f]{24}_)+', '', base); base = re.sub(r'\.[A-Za-z0-9]+$', '', base)
        base = re.sub(r'[^A-Za-z0-9._-]+', '-', base).strip('-')[:80] or k
        return dict(url=u, key=k, orig=s, type=t, dim=f'{w}x{h}', new=n, newdim=f'{im2.size[0]}x{im2.size[1]}',
                    name=base + '.webp', md5=hashlib.md5(open(dst, 'rb').read()).hexdigest(), path=dst, posts=refs[u])
    with ThreadPoolExecutor(6) as ex: imgs = list(ex.map(conv, todo))
    ok = [i for i in imgs if 'skip' not in i]
    pending = [p['fieldData']['slug'] for p in posts if (p.get('lastPublished') or '') < p['lastUpdated']]
    affected = sorted({pid for i in ok for pid in i['posts']})
    json.dump(dict(images=imgs, broken=broken, affected=affected, pending=pending), open(W + '/plan.json', 'w'), indent=1)
    print(f'live posts {len(posts)}; body images measured {len(sizes)}; oversized {len(todo)}; converted {len(ok)}; '
          f'skipped {len(imgs) - len(ok)}; broken {len(broken)}')
    print(f'MB {sum(i["orig"] for i in ok) / 1e6:.1f} -> {sum(i["new"] for i in ok) / 1e6:.1f}; posts to update {len(affected)}; '
          f'posts with other unpublished edits {len(pending)} {pending[:10]}')


def upload(img, state):
    if img['url'] in state: return state[img['url']]
    a = api('POST', f'/sites/{SITE}/assets', {'fileName': img['name'], 'fileHash': img['md5']})
    det = a['uploadDetails']
    M = {'xAmzAlgorithm': 'X-Amz-Algorithm', 'xAmzCredential': 'X-Amz-Credential', 'xAmzDate': 'X-Amz-Date',
         'xAmzSignature': 'X-Amz-Signature', 'successActionStatus': 'success_action_status',
         'contentType': 'Content-Type', 'cacheControl': 'Cache-Control'}
    args = ['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', a['uploadUrl']]
    for k, v in det.items(): args += ['-F', f'{M.get(k, k)}={v}']
    args += ['-F', f'file=@{img["path"]};type=image/webp']
    code = subprocess.run(args, capture_output=True, text=True).stdout
    if code != '201': raise RuntimeError(f'S3 upload {code} for {img["url"]}')
    state[img['url']] = a['hostedUrl']
    with open(W + '/uploaded.jsonl', 'a') as f: f.write(json.dumps({'url': img['url'], 'assetId': a['id'], 'hostedUrl': a['hostedUrl']}) + '\n')
    return a['hostedUrl']


def load_state():
    st = {}
    if os.path.exists(W + '/uploaded.jsonl'):
        for l in open(W + '/uploaded.jsonl'): x = json.loads(l); st[x['url']] = x['hostedUrl']
    return st


def done_set():
    return {json.loads(l)['id'] for l in open(W + '/done.jsonl')} if os.path.exists(W + '/done.jsonl') else set()


def visible_text(h):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', h))).strip()


def process(pid, plan_d, state, posts_by, publish=True):
    p = api('GET', f'/collections/{CID}/items/{pid}')          # fresh copy right before editing
    if (p.get('lastPublished') or '') < p['lastUpdated'] and pid not in ALLOW_PENDING:
        return dict(id=pid, slug=p['fieldData']['slug'], status='skipped: has other unpublished edits')
    old = p['fieldData'].get('post-content') or ''
    with open(BACKUP, 'a') as f: f.write(json.dumps({'id': pid, 'slug': p['fieldData']['slug'], 'post-content': old}) + '\n')
    new, swapped = old, []
    for img in plan_d['images']:
        if 'skip' in img or pid not in img['posts'] or img['url'] not in new: continue
        hu = upload(img, state)
        new = new.replace(f'src="{img["url"]}"', f'src="{hu}"'); swapped.append((img['url'], hu))
    if not swapped: return dict(id=pid, slug=p['fieldData']['slug'], status='nothing to swap')
    r = api('PATCH', f'/collections/{CID}/items/{pid}',
            {'fieldData': {'post-content': new, 'name': p['fieldData']['name'], 'slug': p['fieldData']['slug']}})
    stored = r['fieldData'].get('post-content') or ''
    text_same = visible_text(stored) == visible_text(old)
    imgs_stored = re.findall(r'<img[^>]*?src="([^"]+)"', stored)
    still_old = [u for u, _ in swapped if u in stored]
    if not text_same or still_old or len(imgs_stored) != len(re.findall(r'<img', old)):
        return dict(id=pid, slug=p['fieldData']['slug'], status='CHECK: stored HTML differs', text_same=text_same,
                    still_old=len(still_old), imgs_before=len(re.findall(r'<img', old)), imgs_after=len(imgs_stored))
    if not publish:
        return dict(id=pid, slug=p['fieldData']['slug'], status='staged (not published)', swapped=len(swapped))
    api('POST', f'/collections/{CID}/items/publish', {'itemIds': [pid]})
    res = dict(id=pid, slug=p['fieldData']['slug'], status='ok', swapped=len(swapped))
    with open(W + '/done.jsonl', 'a') as f: f.write(json.dumps(res) + '\n')
    return res


ALLOW_PENDING = set()
BACKUP = REPO + '/docs/cms/posts-richtext-backup-2026-10-20.jsonl'

if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'plan': plan(); sys.exit()
    plan_d = json.load(open(W + '/plan.json')); state = load_state(); done = done_set()
    posts_by = {p['id']: p for p in json.load(open(W + '/posts_live.json'))}
    if cmd == 'test':
        pid = [p for p in posts_by.values() if p['fieldData']['slug'] == sys.argv[2]][0]['id']
        print(json.dumps(process(pid, plan_d, state, posts_by, publish=False)))
    elif cmd == 'publish-one':
        pid = [p for p in posts_by.values() if p['fieldData']['slug'] == sys.argv[2]][0]['id']
        api('POST', f'/collections/{CID}/items/publish', {'itemIds': [pid]})
        with open(W + '/done.jsonl', 'a') as f: f.write(json.dumps(dict(id=pid, slug=sys.argv[2], status='ok')) + '\n')
        print('published', sys.argv[2])
    elif cmd == 'apply':
        todo = [p for p in plan_d['affected'] if p not in done]
        stop = int(sys.argv[2]) if len(sys.argv) > 2 else len(todo)
        for n, pid in enumerate(todo[:stop], 1):
            try: r = process(pid, plan_d, state, posts_by)
            except Exception as e: r = dict(id=pid, status='ERROR ' + str(e)[:200])
            print(n, json.dumps(r), flush=True)
            if r['status'].startswith('CHECK'): print('stopping: stored HTML differs'); break
