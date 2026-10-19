# Decisions

One at a time, each with what it means. Logged when made.

## Made

### 2026-10-19 · Repo name `brandvm/wf-brandvm`
- Who: Asheem Shrestha
- What: `brandvm/brandvision` already holds Asheem's private Astro
  prototype (created 2026-09-08), so the new repo is `wf-brandvm`,
  following wf-template's `wf-<client>` naming. The prototype is untouched.

### 2026-10-19 · Public repo
- Who: Claude, per the template README
- What: jsDelivr production URLs and GitHub Pages staging need a public
  repo, as `brandvm/brandvm` is today. No keys in the repo (`.env` is
  gitignored).

### 2026-10-19 · D1 · Parity release ships without the template foundation CSS
- Who: Asheem Shrestha
- What: v1.0.0 leaves out §01 viewport scaling, §02 resets, §03
  neutralizers and the `is-loading` scroll lock. Any of them comes back
  later only as its own measured batch.

### 2026-10-19 · D2 · Parity release ports brandvm v1.1.2
- Who: Asheem Shrestha
- What: port v1.1.2 (visibility-based video controller) and verify it as
  part of parity; `fs-autovideo` is removed from the Finsweet tag in the
  same publish.

### 2026-10-19 · D3 · Drop Lenis
- Who: Asheem Shrestha
- What: the dead Lenis module and the Lenis CSS in site head code are
  removed in the parity release. No visible change.

### 2026-10-19 · D4 · Article JSON-LD goes CMS-bound directly
- Who: Asheem Shrestha
- What: in Stage 3 the browser-built BlogPosting script is replaced by a
  CMS-bound JSON-LD block in the Posts template (a Designer change), not
  ported to the repo. Verified with `wf:seo` against the current output
  (headline, dates, author, image, publisher) before the page script is
  removed. Watch for quotes in CMS fields breaking the JSON
  (lessons/designer.md).

### 2026-10-19 · D5 · Separator collections, pages and "No Live Pages" templates stay
- Who: Asheem Shrestha

### 2026-10-19 · D6 · Archive `brandvm/brandvm` after cutover
- Who: Asheem Shrestha
- What: archived (read-only) with its tags kept, so the rollback snippets'
  jsDelivr URLs keep working.

## Open

None.
