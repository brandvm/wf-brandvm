# Rollback

How to put brandvm.com back exactly as it was before this migration.
Written 2026-10-19 (Stage 1), before anything was written to Webflow.
Update the "Current state" section after every batch that goes live.

## Rollback point

- **Code:** `brandvm/brandvm` tag **`v1.1.1`** (`b35f31d`). This is what live
  runs. Checked 2026-10-19: jsDelivr's
  `cdn.jsdelivr.net/gh/brandvm/brandvm@1.1.1/dist/index.js` and
  `styles.css` are byte-identical to `git show v1.1.1:dist/…`
  (`index.js` sha1 `7c534d0b6e3d…`, `styles.css` `b002bc923d06…`).
  The tag stays forever (D6: the repo is archived, never deleted), so these
  URLs keep resolving.
- **Webflow:** site backup `2026-10-19 pre-wf-brandvm`, made by Asheem
  Shrestha on 2026-10-19 (Site settings › Backups), before any Webflow
  write.
- **Live publish:** 2026-10-19 15:26 UTC (`lastPublished` from the MCP).
  The custom code below was taken from that published HTML.

## Custom code, word for word

Every file in [`rollback/`](rollback/) is the exact text as published on
www.brandvm.com on 2026-10-19 (50 pages: every static page and two items per
CMS template; [`rollback/index.json`](rollback/index.json) lists which pages
carry each piece). Webflow joins adjacent custom-code blocks without the
newline the Designer shows, so whitespace at the very start or end of a
block can differ from the Designer field. Nothing else does.

| Where in Webflow | File | Pages |
| --- | --- | --- |
| Site settings › Custom code › Head | `site-head.html` | all |
| Site settings › Custom code › Footer | `site-footer.html` (brandvm loader, `VER = '1.1.1'`) | all |
| Home › Page settings › Head | `page-head--home.html` (hero preload, hreflang) | Home |
| United States › Head | `page-head--us.html` (hreflang) | /us |
| Industries › Head | `page-head--industries.html` (reduced-motion CSS) | /industries |
| Insights › Head | `page-head--insights.html` (RSS link) | /insights |
| Web Design › Head | `page-head--web-design.html` (hero preloads) | /web-design |
| Home › Footer | `page-footer--home.html` (hero panels) | Home |
| About › Footer | `page-footer--about.html` (Orbit gallery) | /about |
| Industries › Footer | `page-footer--industries.html` (carousel tilt) | /industries |
| Work › Footer | `page-footer--our-work-portfolio.html` (Finsweet → IX2 restart) | /our-work-portfolio |
| Posts template › Footer | `page-footer--post_….html` (BlogPosting JSON-LD) | every post |
| Embed (G \| Components) | `embed-01.html` GTM noscript | all |
| Embed (G \| Components) | `embed-02.html` CSS link (`bv-css`; localhost link commented out) | all |
| Embed (G \| Components) | `embed-03.html` config script (`VER = '1.1.1'`) | all |
| Embed `hubspot-form` | `embed-04.html` HubSpot slot + loader | 35 pages (Contact CTA) |
| Embed `hubspot-form` | `embed-06.html` HubSpot contact form | /contact |
| Embed | `embed-05.html` `.project-list` hover CSS | 6 CMS pages (branding, industry, web design items) |
| Embed | `embed-08.html` `.project-list` hover CSS, second copy | 4 CMS pages (SEO, UI/UX items) |
| Embed | `embed-07.html` case-study grid CSS | /our-work-portfolio |
| Not custom code: added by an installed app/integration | `app-flowbase-head-script.html` Flowbase tab rotation | all |

The Flowbase tab-rotation script is on every page but in neither the site
nor any page custom code (the MCP's registered-scripts read returns nothing),
so it comes from an installed app or integration. It drives one element
only: the "Our Work" client tabs on /about (`fb-tabs="true"`,
`fb-tabs-speed="15000"`, `fb-tabs-progress="true"`,
`fb-tabs-pauseable="false"`, 15-second auto-rotation with a progress bar).

## How to roll back

**After the Stage 2 cutover (new loader installed):**

1. Paste `site-head.html` and `site-footer.html` back into Site settings ›
   Custom code, replacing the wf-template head and footer snippets.
2. In the G \| Components component, replace Embeds 2a/2b with the
   contents of `embed-02.html` and `embed-03.html`.
3. Put `fs-autovideo` back on the Finsweet tag in site head if it was
   removed (D2), since 1.1.1 relies on it.
4. Publish to staging → check → publish live (needs the word **publish**).

**After a Stage 3 batch (page code or an Embed moved into the repo):**
paste the matching file above back into the same place, and set `RELEASE`
back to the tag before that batch, so the old script and the module that
replaced it don't both run. Then publish.

**After a Stage 4 batch (Webflow interactions deleted):** restore the
Webflow backup (interactions can't be pasted back), then re-apply any
later Designer changes. That makes Stage 4 the costliest to undo. Each
family is cut over alone, and a fresh backup is made before each.

**A bad wf-brandvm release:** set `RELEASE` in head code to the previous
tag and publish. Never move a pushed tag.

## [Person] steps still open

- [x] Webflow backup `2026-10-19 pre-wf-brandvm` (2026-10-19)
- [x] Branch protection on `master` in `brandvm/wf-brandvm` and
  `brandvm/brandvm` (2026-10-19): no force pushes, no deletion. No PR or
  status-check requirement, so pushes to `master` still deploy staging.
- [ ] Find where the Flowbase script is installed (Site settings › Apps), so it can be removed when Stage 3 replaces it

## Current state

| Date | What is live | Rollback to |
| --- | --- | --- |
| 2026-10-19 | `brandvm/brandvm@1.1.1`, all Webflow IX2/IX3 | — (this is the baseline) |
| 2026-10-19 | **Batch 3.3c live, `1.3.0`:** Finsweet Attributes (list, socialshare 2.7.1) bundled; the CDN tag removed from site head | set RELEASE to `1.2.0` and put the Finsweet tag back in site head: `<script async type="module" src="https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js" fs-list fs-socialshare></script>` |
| 2026-10-19 | **Batch 3.3a/b live, `1.2.0`:** HubSpot loader and tab rotation in the bundle; S \| Contact Embed reduced to the form `<div>` | set RELEASE to `1.1.0` and paste `embed-04.html` back into S \| Contact's Embed |
| 2026-10-19 | **Batch 3.1 live:** six duplicate CSS Embeds removed (project-list on 5 CMS templates, case-study grid on Work) | paste `embed-05` (Branding, Industries, Web Design templates), `embed-08` (SEO, UI/UX templates), `embed-07` (Work) back as Embeds |
| 2026-10-19 | **Batch 3.2 live, `1.1.0`:** About footer code (Orbit), About registered script (methodology, dead) and Industries head/footer code removed; now in `orbit.ts` / `industry-tilt.ts` | set RELEASE to `1.0.0` **and** paste `page-footer--about.html` (style + script part), `page-head--industries.html`, `page-footer--industries.html` back; re-apply the registered script `methodologypinnedscroll` 1.0.1 if wanted |
| 2026-10-19 | **Live:** `brandvm/wf-brandvm@1.0.0` loader in head, footer and G \| Components Embeds; `fs-autovideo` and Lenis CSS removed (published by Claude after Asheem typed "publish") | the files in `rollback/` (site-head, site-footer, embed-02, embed-03), then publish |
