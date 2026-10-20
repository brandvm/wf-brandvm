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

### 2026-10-20 · The MCP can't prove a CMS field is unused
- Area: mcp
- Scope: template-candidate
- Symptom: a field-usage audit from Designer settings alone listed FAQ
  reference fields, multi-reference list sources and service-template
  fields as unused, though the live pages use them.
- Cause: `get_settings` returns conditional visibility as just
  `"conditional"`, an "equals current item" filter as an empty filter, a
  multi-reference list source as the target collection only; bindings
  inside component definitions aren't returned, and children of a
  component's slots have no element id. Six parallel scanners also hit
  429s (shared with any other session on the site).
- Fix: count a field unused only if no binding, list filter/sort,
  component prop, page setting or custom-code token reads it **and** its
  values are absent from the item's own live page; check reference fields
  in reverse (are the referenced items the ones shown?). Method and
  results: `docs/audit/2026-10-20-cms-field-usage.md`.
- Status: documented
- Found by: claude


### 2026-10-20 · Lazy ScrollTrigger builds: hidden and re-rendered trigger elements
- Area: js
- Scope: template-candidate
- Symptom: on published staging (IX3 gone), the case-study "next project"
  card stayed at its from-state (scale 0.5) at the bottom of the page; live
  IX3 scrubbed it to 1. An earlier run built all 78 triggers with
  start = end = 0.
- Cause: the template has 78 `.case-next-main` blocks (a CMS list) and
  shows one; (1) a hidden element's 0×0 rect counted as "near the
  viewport", so it was built while hidden and measured as 0/0; (2) Finsweet
  List re-renders the list after start-up, so the IntersectionObserver kept
  watching detached nodes and never fired for the visible one. IX3 avoided
  both with a body ResizeObserver and by resolving targets again.
- Fix: `ix-scroll.ts` builds at once only elements with a layout box near
  the viewport, re-queries each selector on every scan (WeakSet of seen
  nodes), and re-scans + `ScrollTrigger.refresh()` when the body height
  changes (debounced) and on window load. Regression test in
  `tests/ix3.spec.mjs` (fails on the old module). Released as 1.4.1;
  1.4.0 never reached production.
- Status: fixed
- Found by: claude


### 2026-10-20 · Bundled GSAP plugins register themselves on Webflow's `window.gsap`
- Area: js
- Scope: template-candidate
- Symptom: with the bundle running after Webflow's GSAP, the bundled
  ScrollTrigger's triggers showed up in `window.ScrollTrigger.getAll()`,
  and a stub `window.gsap` received 5 `registerPlugin` calls.
- Cause: GSAP's ESM plugin files (ScrollTrigger, Observer, CustomEase) end
  with `_getGSAP() && gsap.registerPlugin(Plugin)`, and `_getGSAP()` falls
  back to `window.gsap`. Importing them registers the bundled plugin on
  Webflow's core and replaces `window.ScrollTrigger` under IX3 and
  `orbit.ts`, flag or no flag. (The earlier entry about `window.gsap` is
  true for gsap-core only.)
- Fix: one entry point, `src/lib/gsap.ts`, that hides `window.gsap` while
  the plugins evaluate (`gsap-hide` → plugins → `gsap-restore`, ES module
  order) and registers them on the bundled core. Never import `gsap/…`
  elsewhere. Test: `tests/ix3.spec.mjs` "gsap isolation" (fails without
  the fix).
- Status: fixed (not yet released; 1.3.0 has no GSAP in the bundle)
- Found by: claude


### 2026-10-20 · IX3 replay rules from its runtime, and a remove() race
- Area: js
- Scope: template-candidate
- Symptom: (1) the phone Process track ran at twice IX3's offset and its
  line started late. (2) On some loads IX3's triggers were still there
  after `remove()`, so both animated.
- Cause: (1) lessons/js.md says "no position = append"; IX3's
  `buildTweensForAction` uses `timing.position ?? 0`: every action without
  a position starts at 0. It also skips an action with no properties (no
  spacer), adds `force3D: true`, and uses 0.5s and GSAP's default ease when
  none is given. (2) IX3 loads interactions around `window.load` and binds
  them over a few frames; a `remove()` in between is undone.
- Fix: (1) `src/interactions/replay.ts` follows the runtime; lessons/js.md
  needs correcting upstream. (2) `ix3-bridge.ts` waits for load plus 3
  frames with an unchanged interaction count. Both checked on 7 staging
  page/width pairs: 0 differences.
- Status: fixed in this repo; lesson to correct in wf-template
- Found by: claude


### 2026-10-20 · Published IX3 drops hidden actions and default durations
- Area: js
- Scope: template-candidate
- Symptom: "Page Load | Home" published an empty timeline although the
  Designer shows three hero-panel actions; several published steps had no
  `duration`.
- Cause: actions marked hidden in the Designer are left out of the
  published chunk, and a step at the default duration is published without
  it (the MCP's `get_interaction` shows 0.5 for the same step).
- Fix: decode from the published chunks (what visitors run), read 0.5s for
  a missing duration (`scripts/ix3-spec.mjs`), and cross-check odd cases
  with `get_interaction`. An interaction whose actions are all hidden still
  makes IX3 load and gate the page: delete it.
- Status: documented
- Found by: claude


### 2026-10-19 · Repo interactions next to live IX2: `!important` and a 0fr grid's padding
- Area: css
- Scope: template-candidate
- Symptom: (1) IX2 keeps writing inline `display`, `height`, `opacity`,
  `transform` on the nav while it runs, so plain repo CSS loses. (2) A
  dropdown animated with `grid-template-rows: 0fr → 1fr` stopped at 41px
  instead of 0.
- Cause: (1) inline styles beat any selector. (2) a grid item's padding
  sets its minimum size, so a 0fr track still holds the padding.
- Fix: (1) flag-gated rules (`html.wfc-ix`, staging only) use
  `!important`; they drop it at the cutover, once IX2 is deleted. (2) the
  closed state also sets the item's vertical padding to 0, transitioned
  with the rows, so the Designer padding returns when open.
- Status: (1) obsolete since IX2 was deleted (1.4.2 dropped the
  `!important`s); (2) still applies
- Found by: claude


### 2026-10-19 · Bundled GSAP and Webflow's `window.gsap` coexist
- Area: js
- Scope: template-candidate
- Symptom: worry that importing `gsap` in the bundle replaces Webflow's
  `window.gsap` (IX3, and page code that reads it) on pages where the
  bundle runs first.
- Cause: none: gsap-core installs into its private `_installScope` (an
  object from the start), never onto `window`, when imported as a module.
- Fix: verified on staging Home with the 3.15.0 bundle: `w-mod-ix3` still
  runs, `window.gsap` is Webflow's. Modules use the imported `gsap`; code
  that reads `window.gsap` keeps Webflow's until its own cutover.
- Status: documented
- Found by: claude


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
  `docs/audit/2026-10-19-posts-cms-schema-validation.json`. Decision D4b:
  the browser-built script stays in the Posts template.
- Status: worked around (script kept)
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
