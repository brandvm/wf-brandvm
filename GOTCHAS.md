# Gotchas

A running log of things that cost time on this project. Agents read it at
the start of every session and add to it when they hit something new (see
the Session protocol in `AGENTS.md`). Never delete an entry — update its
`Status` instead.

Lessons from earlier builds are in the skill, not here:
`.claude/skills/webflow-build/lessons/` (one file per area). Read the file
for the area you work in. Entries tagged `Scope: template-candidate` are
collected from client repos into those files.

## Entry format

```md
### YYYY-MM-DD · Short title
- Area: designer | css | loader | release | mcp | ci | js | perf
- Scope: project | template-candidate
- Symptom: what was observed
- Cause: why it happened
- Fix: what was done, or the workaround
- Status: open | fixed <sha> | upstreamed wf-template <sha>
- Found by: claude | codex | human
```

## This project

<!-- Add new entries here, newest first. -->

### 2026-10-19 · CMS-bound JSON-LD on Posts: entities and empty fields
- Area: designer
- Scope: template-candidate
- Symptom: BlogPosting JSON-LD built from CMS tokens in the Posts
  template head (`{{wf {&quot;path&quot;:…} }}`) parsed on every post, but
  on 1,167 posts: 272 had HTML entities in text (`&amp;`, `&#39;` — "Nike
  vs Adidas &amp; More"), 610 had `"author": {"name": ""}`, 538 had
  `"image": [""]`, 44 an empty `articleSection`, 25 an empty
  `dateModified`.
- Cause: Webflow HTML-escapes PlainText tokens inside custom code, and a
  static template can't omit a property whose field is empty on some items.
  (What did work: reference paths `post-author:name`, `category:name`, and
  `"type":"Date"` renders ISO `YYYY-MM-DD`.)
- Fix: reverted on staging the same day; never published. Validation file:
  `docs/audit/2026-10-19-posts-cms-schema-validation.json`. D4 reopened.
- Status: open
- Found by: claude


### 2026-10-19 · `play() … interrupted by pause()` on Home and Web Design
- Area: js
- Scope: project
- Symptom: uncaught `play()` rejections in the console on Home and Web
  Design, intermittently, before and after the Stage 2 cutover.
- Cause: the `.s-bg-video` elements carry Webflow's `autoplay` attribute,
  and the visibility controller (`lazy-videos.ts`) pauses them when they
  leave the viewport, so the browser's own autoplay `play()` is cut short.
  The controller's own `play()` calls already ignore `AbortError`.
- Fix: none yet (not a regression; no visible effect). Stage 5: drop
  `autoplay` from those videos in the Designer and let the controller
  start them.
- Status: open
- Found by: claude


### 2026-10-19 · `wf:baseline compare` flagged every page as changed
- Area: perf
- Scope: template-candidate
- Symptom: with no change on the site, `compare` reported CHANGED on 27 of
  30 page/width pairs at 0.0% pixels, e.g. "height 9982→9754".
- Cause: it compared the saved PNG's height (the full page after
  scrolling) with `scrollHeight` measured before scrolling. Pages that grow
  as lazy content and scroll reveals load always differ.
- Fix: compare the new screenshot's PNG height with the saved PNG's.
  Afterwards only real pixel changes are flagged (noise floor in AUDIT.md).
- Status: fixed in this repo; to upstream to wf-template
- Found by: claude

### 2026-10-19 · `wf:* --live` measured staging, not the live domain
- Area: perf
- Scope: template-candidate
- Symptom: the `webflow-audit` skill runs every check with `--live`, but in
  template 0.6.0 only `seo`, `parity` and `install` read `liveUrl`.
  `perf`, `baseline`, `outline`, `a11y`, `links`, `html`, `film` and the
  rest built URLs from `stagingUrl`. With `--live` they only stopped
  swapping in the local bundle, so they checked `*.webflow.io`, not the
  custom domain.
- Cause: in `lib.mjs`, `--live` meant "the deployed bundle" (written
  before sites had a custom domain), while the audit skill means "the live
  domain".
- Fix: `perf.mjs` uses `liveUrl` with `--live`; `lib.mjs` `loadConfig()`
  points `stagingUrl` at `liveUrl` when `--live` is passed and `liveUrl`
  is set, so every script follows.
- Status: fixed in this repo; to upstream to wf-template
- Found by: claude

### 2026-10-19 · Keyless PageSpeed Insights API quota is shared and runs out
- Area: perf
- Scope: template-candidate
- Symptom: the first PSI API call of the day returned HTTP 429 "Queries per
  day" without a key.
- Cause: keyless requests share a small daily quota.
- Fix: use a PSI API key (`PSI_KEY` in `.env`, never committed) for PSI
  numbers; `pnpm wf:perf --live` (local Lighthouse) needs no key.
- Status: open (waiting for a key)
- Found by: claude

### 2026-10-19 · Live runs brandvm/brandvm 1.1.1, not the 1.1.2 the old repo records
- Area: release
- Scope: project
- Symptom: `brandvm/brandvm` README, AGENTS and `loader.html` say v1.1.2 is
  in production; the published footer code and config Embed load `@1.1.1`.
- Cause: the 1.1.2 snippets were never pasted/published in Webflow.
- Fix: decision D2 in `docs/handoff/DECISIONS.md`.
- Status: open
- Found by: claude

## Carried over from brandvm/brandvm

Entries from the old repo's `GOTCHAS.md` that still apply to this site,
copied on 2026-10-19 when its code moved here (Stage 2). The old repo keeps
the full history.

### 2026-09-15 · Nav and Home hero stay hidden when IX3 does not start
- Area: css
- Scope: template-candidate
- Symptom: CTA groups and hero text authored hidden for an IX3 entrance can
  stay invisible if IX3 never initialises.
- Cause: the hidden start state lives in Webflow; nothing reveals it when
  `html` has `w-mod-js` but never gets `w-mod-ix3`.
- Fix: a visibility-only fallback in `styles.css` (§04, "Keep navigation
  CTAs and Home hero content visible") matching
  `html.w-mod-js:not(.w-mod-ix3)`. Revisit in Stage 4: once IX3 is gone,
  `w-mod-ix3` never appears, so this rule then applies permanently.
- Status: carried over (brandvm 204150e, v1.1.2)
- Found by: codex

### 2026-09-15 · Finsweet `fs-autovideo` must go when the bundle controls video
- Area: loader
- Scope: project
- Symptom: two video controllers compete for the same `<video>` elements.
- Cause: `lazy-videos.ts` self-starts, while the Finsweet tag in site head
  still carries `fs-autovideo`.
- Fix: remove `fs-autovideo` in the same publish as the release that ships
  `lazy-videos.ts` (Stage 2 cutover, MANUAL-TODO).
- Status: open until the Stage 2 cutover
- Found by: codex

### 2026-09-11 · Custom-code preview frames keep their own dev flag
- Area: loader
- Scope: template-candidate
- Symptom: the dev flag on the Designer URL or the staging site does not
  put the custom-code preview into dev mode.
- Cause: previews run on `*.canvas.webflow.com`, a separate origin with its
  own URL and localStorage (the template loader treats it as staging).
- Fix: set `?wfc-dev=1` on the frame's own URL, or use published staging.
- Status: documented
- Found by: codex

### 2026-09-11 · Insights menu rules duplicated in a Webflow Embed
- Area: designer
- Scope: project
- Symptom: rules hiding `.mega-menu-insights-item` existed in a page Embed
  as well as in `styles.css`.
- Cause: site CSS was added in Webflow outside the bundle.
- Fix: the 2026-10-19 Embed inventory (`docs/handoff/rollback/`) finds no
  Embed with these rules on the 50 captured pages, so the copy in
  `styles.css` §04 is the only one.
- Status: fixed (verified 2026-10-19)
- Found by: codex
