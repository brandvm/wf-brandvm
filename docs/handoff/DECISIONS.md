# Decisions

One at a time, each with what it means. Logged when made.

## Made

### 2026-10-19 · Repo name `brandvm/wf-brandvm`
- Who: Kajal
- What: `brandvm/brandvision` already holds Asheem's private Astro
  prototype (created 2026-09-08), so the new repo is `wf-brandvm`,
  following wf-template's `wf-<client>` naming. The prototype is untouched.

### 2026-10-19 · Public repo
- Who: Claude, per the template README
- What: jsDelivr production URLs and GitHub Pages staging need a public
  repo, as `brandvm/brandvm` is today. No keys in the repo (`.env` is
  gitignored).

## Open

### D1 · Parity release ships without the template foundation CSS
Recommendation: yes. The template's §01 viewport scaling, §02 resets, §03
neutralizers and the `is-loading` scroll lock would all change the live
site. They stay out of v1.0.0; any of them comes back later as its own
measured batch. Cost: none for visitors.

### D2 · Fix the 1.1.1 / 1.1.2 drift before or with the cutover
Live runs v1.1.1 while the repo says v1.1.2. Options: (a) port v1.1.2 and
verify its video controller as part of parity, removing `fs-autovideo` in
the same publish (recommended: that was already the intent of 1.1.2); (b)
port exactly what is live (1.1.1) and do the video change as a later batch.

### D3 · Drop Lenis
No Lenis script loads, so the module and its head CSS do nothing.
Recommendation: drop both in the parity release. If smooth scrolling is
wanted, it comes back as a bundled, measured batch.

### D4 · Article JSON-LD
Today the BlogPosting schema is built in the browser by a page script, so
crawlers that don't run JS don't see it. Options: keep it as a repo module
(parity), or rebuild it as a CMS-bound JSON-LD block in the Posts template
(better for SEO; a Designer change). Recommendation: port as is now, move to
CMS-bound in Stage 5.

### D5 · Separator collections, pages and "No Live Pages" templates
Folder dividers in the CMS and page panel. Recommendation: leave them. Say
if you'd like them removed.

### D6 · What happens to `brandvm/brandvm` after cutover
Recommendation: keep it, archived (read-only), with its tags, so the
rollback snippets still point at valid jsDelivr URLs.
