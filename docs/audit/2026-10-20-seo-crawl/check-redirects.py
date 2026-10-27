"""Check the live site against the latest redirect import (redirects/webflow-import-*.csv).

  python3 check-redirects.py            # www.brandvm.com
  python3 check-redirects.py <origin>   # e.g. https://brandvm.webflow.io

Every row in the latest import must answer 301 to its target (first hop,
not followed); every source in the export or an earlier import that the
latest one drops must answer 404.
Wildcard rows (`(.*)`) are skipped. Prints only rows that don't match.
"""
import csv, os, re, sys, urllib.request, urllib.error

ORIGIN = sys.argv[1] if len(sys.argv) > 1 else 'https://www.brandvm.com'
HERE = os.path.dirname(os.path.abspath(__file__))
EXPORT = HERE + '/redirects/webflow-export-2026-10-27.csv'
EARLIER = [HERE + '/redirects/webflow-import-2026-10-27.csv']
EARLIER.append(HERE + '/redirects/webflow-import-2026-10-27-v2.csv')
IMPORT = HERE + '/redirects/webflow-import-2026-10-27-v3.csv'  # 3 rows whose targets were unpublished


def unescape(s):  # Webflow writes "/post/a%-b" for "/post/a-b"
    return re.sub(r'%(.)', r'\1', s)


def rows(path):
    return [r for r in list(csv.reader(open(path, newline='', encoding='utf-8')))[1:] if r]


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


opener = urllib.request.build_opener(NoRedirect)


def first_hop(path):
    try:
        r = opener.open(urllib.request.Request(ORIGIN + path, headers={'User-Agent': 'brandvm-audit'}), timeout=30)
        return r.status, None
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get('Location')


want = {unescape(s): t for s, t in rows(IMPORT) if '(' not in s}
gone = {unescape(s) for f in [EXPORT] + EARLIER for s, _ in rows(f) if '(' not in s} - set(want)
bad = 0
for src, target in want.items():
    code, loc = first_hop(src)
    loc = (loc or '').replace('https://www.brandvm.com', '').replace(ORIGIN, '')
    if not (code == 301 and loc == target.replace('https://www.brandvm.com', '')):
        bad += 1
        print(f'redirect  {src} -> {code} {loc} (want {target})')
for src in sorted(gone):
    code, loc = first_hop(src)
    if code != 404:
        bad += 1
        print(f'removed   {src} -> {code} {loc or ""} (want 404)')
print(f'{len(want)} redirects + {len(gone)} removed checked, {bad} not as imported')
