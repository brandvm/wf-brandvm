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

### 2026-11-19 · Webflow's "Sitemap Indexing" switch also noindexes the page
- Area: designer / CMS
- Scope: template-candidate
- Symptom: after turning Sitemap Indexing off for 770 Featured posts (to drop
  them from sitemap.xml), each post rendered `<meta name="robots" content="noindex"/>`.
- Cause: Webflow ties the two: off = out of the sitemap and out of search.
- Fix: to keep pages indexable but out of the sitemap, leave the switch on and
  generate the sitemap instead (`scripts/sitemap.mjs`, staging workflow,
  served from GitHub Pages; robots.txt and a 301 on /sitemap.xml point to it).
- Status: fixed 55d7913 (needs the WEBFLOW_TOKEN secret and the Webflow settings)
- Found by: claude

### 2026-11-18 · MCP cannot bind a CMS field inside a component's Collection List
- Area: mcp
- Scope: template-candidate
- Symptom: setting a CMS-bound `aria-label` on `.project-overlay-link`
  inside S | Projects failed: "Element is not inside a CMS context";
  `get_bindable_sources` listed only page fields and props.
- Cause: the MCP resolves CMS context from the page, not from a
  Collection List inside a component definition.
- Fix: `src/modules/card-link-names.ts` copies the card title into the
  link's aria-label at runtime and leaves a Designer-bound label alone.
  Binding it in the Designer by hand (custom attribute → CMS field) is
  still the better home.
- Status: open (workaround d7d3689)
- Found by: claude

### 2026-11-18 · Fluid root shrinks text links under 24px between 992 and ~1100px
- Area: designer
- Scope: project
- Symptom: axe 4.14 / Lighthouse 13 `target-size` failed for author
  links, the insights category pill and contact phone links only at
  ~1024 and 1350px, never at 1440 or on phones. Local axe 4.10 missed the
  author link entirely.
- Cause: §01 scales the root font (9.75px at 1024), so a 12px-class text
  link is 15–19px tall there.
- Fix: invisible tap area on the author link (6px padding, -6px margin),
  `min-height: 24px` on the category pill and on `Contact CTA | Option
  Link` (text bottom-aligned so the underline stays under it). Check
  target-size at 1024 and 1350 as well as the usual widths.
- Status: fixed (Webflow styles, 2026-11-18)
- Found by: claude

### 2026-11-18 · WebGL scores fine locally, 59 on PageSpeed Insights
- Area: perf
- Scope: template-candidate
- Symptom: /seo-agency staging scored 97 desktop in local Lighthouse with
  4 ms TBT, but PageSpeed Insights gave 59 on both mobile (TBT 11,290 ms,
  Speed Index 8.7 s) and desktop (TBT 1,340 ms); "Other" main-thread time
  was 19.5 s, long tasks from index.js through the whole trace.
- Cause: PSI's Chrome has no GPU. WebGL runs on SwiftShader, so every
  frame of the hero shader is drawn on the CPU's main thread. A local
  run uses the machine's GPU and hides it. `failIfMajorPerformanceCaveat`
  does not catch it: SwiftShader still returns a context.
- Fix: read `WEBGL_debug_renderer_info` and skip the shader when the
  renderer matches swiftshader/llvmpipe/software (the CSS gradient under
  the canvas is the hero then); also stop animating when frames average
  over 50 ms. PSI after: mobile 97 (TBT 0), desktop 99. Always measure
  WebGL/canvas pages on pagespeed.web.dev, not only local Lighthouse.
- Status: fixed 1c10d77
- Found by: claude

### 2026-11-18 · S Wrapper's own gap doubles spacing inside new sections
- Area: designer
- Scope: project
- Symptom: on the /seo-agency rebuild the space between the approach
  cards and the card below was ~100 px while the cards themselves were
  20 px apart; headings sat 160 px above the accordion.
- Cause: `S Wrapper` is a flex column with row/column gap bound to the
  content-gap variable (80 px at 1680). Any margin on its children adds to
  that gap.
- Fix: children of `S Wrapper` carry no vertical margins; elements that
  need a tighter rhythm go in one inner wrapper with its own gap
  (`seo-hub-approach-body`, 1.25rem).
- Status: fixed (Webflow styles, 2026-11-18)
- Found by: human

### 2026-11-18 · Hero poster image was the mobile LCP and the load flicker
- Area: perf
- Scope: template-candidate
- Symptom: the new /seo-agency hero painted flat navy, then jumped to its
  gradient when a 242 KB poster JPEG arrived; Lighthouse mobile LCP 6.2 s
  on that image.
- Cause: a decorative background behind a WebGL canvas was an `<img>`
  in an Embed, so it was both late and the largest paint.
- Fix: ship a 48 px copy of the same frame inline in the stylesheet as
  the background (1.5 KB data URI, scaled), drop the `<img>`; the canvas
  fades in over it. Mobile LCP 6.2 → 4.1 s on staging, no colour jump.
- Status: fixed 7884f97
- Found by: human

### 2026-10-20 · Production loaded the repo stylesheet twice, the first from GitHub Pages
- Area: loader, perf
- Scope: template-candidate
- Symptom: on www, Lighthouse listed `brandvm.github.io/.../styles.css` as
  render-blocking (~770 ms on mobile), then the pinned jsDelivr sheet
  loaded as well: two origins before first paint.
- Cause: Embed 2a must link the staging sheet so the Designer canvas shows
  repo CSS; 2b only swaps to the release afterwards, and 2b itself waits
  for the 2a sheet (a script after a pending stylesheet).
- Fix: piece 1 (head) `document.write`s the pinned sheet into `<head>` on
  release domains (a parser-inserted head sheet holds first paint in every
  browser), and a MutationObserver re-points `#wfc-css` (2a) at the same
  file as the parser inserts it, before 2b runs. 2b's swap is a no-op.
- First attempt (14b7638, re-pointing 2a only) was wrong: once its href
  changes, 2a no longer holds the parser, so the page painted before the
  repo CSS and re-laid out when §01's type scale arrived. Live Home CLS
  went 0 → 0.17 (mobile) / 0.31 (desktop) until the fix. The unit test had
  passed because the stylesheet answered instantly; the test now delays it
  1 s and requires first paint after it. Also: Chrome reports a `<body>`
  stylesheet as `renderBlockingStatus: "non-blocking"`; test paint timing.
- Status: fixed (loader, this commit); on live after the next publish; upstreamed wf-template 4545bee (0.8.0, branch harvest-perf-loader-2026-10-20)
- Found by: claude

### 2026-10-20 · Image loading, fonts and preloads through the MCP (Home 95 work)
- Area: perf, mcp
- Scope: template-candidate
- Symptom: (1) the MCP's element settings expose no "Load: eager/lazy"
  option for images. (2) After `replace_font_file`, the published CSS
  loads the font from `webflow-files-prod.global.ssl.fastly.net`, a new
  connection, not `cdn.prod.website-files.com`. (3) Preloading that font
  dropped Home mobile from 93 to 82 (FCP 2.2 → 3.3 s). (4) A `sizes` custom
  attribute fails with "internal error".
- Cause: (1) `loading` works as a custom attribute: it replaces Webflow's
  own (one `loading="lazy"` in the published HTML). (2) That is where the
  font API stores files. (3) Lighthouse's simulated FCP counts every
  request that starts before the observed paint. A preloaded 90 KB font
  always starts first, so it always counts. (4) `sizes` is reserved.
- Fix: `set_attributes` `loading=lazy`; a `preconnect` (crossorigin) to
  the font host, no font preload; `sizes` only in the Designer. A preload's
  `imagesrcset`/`imagesizes` must match the `<img>` exactly, or the image
  downloads twice. Lazy images within the browser's lazy margin (~1–2
  screens) still load before first paint, so their size still matters.
- Status: documented; upstreamed wf-template 4545bee (0.8.0, branch harvest-perf-loader-2026-10-20)
- Found by: claude

<!-- Add new entries here, newest first. -->

### 2026-10-20 · CMS item updates must resend every required field
- Area: mcp
- Scope: template-candidate
- Symptom: `update_collection_items` setting only an image field returned
  400 "Request is malformed: Missing fields" for Case Studies and Posts,
  but worked for Authors, Industries and Tabs in the same batch.
- Cause: the API validates required fields even on a partial update.
  Case Studies requires `tagline`, `meta-title`, `meta-description`; Posts
  needs `name` and `slug` sent explicitly. One failing item fails the
  whole collection action.
- Fix: read the item first and resend every required field unchanged with
  the field being changed; test on one item before the batch. Also: don't
  use `compress_assets` when a rollback is wanted — it replaces the file in
  place. Upload new assets and repoint the field instead
  (`docs/audit/2026-10-20-cms-images.md`).
- Status: documented
- Found by: claude

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
- Status: documented; upstreamed wf-template 4545bee (0.8.0, branch harvest-perf-loader-2026-10-20)
- Found by: claude


### 2026-10-20 · Reserving space for an async form: when to let go
- Area: js, perf
- Scope: template-candidate
- Symptom: Contact mobile CLS 0.276 from the HubSpot form pushing the
  page down. Reserving its height fixed it in most runs, but: releasing on
  `:empty` made it 0.355; releasing on HubSpot's `onFormReady` gave 0.467
  in 1 of 10 live runs; and with HubSpot blocked (ad blockers), releasing
  the empty space shifted the page by ~0.28 every time.
- Cause: HubSpot inserts its wrapper before the fields render, and
  `onFormReady` can fire before they reach their final height. A blocked
  form never fills the space, so any release is a shift.
- Fix: `hubspot-form.ts` keeps the reservation until a ResizeObserver
  sees the rendered form at least as tall as it (or on submit); if the
  script fails or nothing renders in 8s, the space stays and shows contact
  details (`.hs-form-fallback`). Contact mobile: CLS 0 in all runs, form
  loading or blocked.
- Status: fixed (1.4.5); upstreamed wf-template 4545bee (0.8.0, branch harvest-perf-loader-2026-10-20)
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
- Status: fixed; upstreamed wf-template 4545bee (0.8.0, branch harvest-perf-loader-2026-10-20)
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
- Status: fixed (not yet released; 1.3.0 has no GSAP in the bundle); upstreamed wf-template 4545bee (0.8.0, branch harvest-perf-loader-2026-10-20)
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
- Status: fixed in this repo; lesson to correct in wf-template; upstreamed wf-template 4545bee (0.8.0, branch harvest-perf-loader-2026-10-20)
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
- Status: documented; upstreamed wf-template 4545bee (0.8.0, branch harvest-perf-loader-2026-10-20)
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
  `!important`s); (2) still applies; upstreamed wf-template 4545bee (0.8.0, branch harvest-perf-loader-2026-10-20)
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
- Status: fixed in this repo; to upstream to wf-template; upstreamed wf-template 4545bee (0.8.0, branch harvest-perf-loader-2026-10-20)
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

### 2026-11-18 · MCP cannot style CMS rich-text descendants
- Area: designer / MCP
- Scope: template-candidate
- Symptom: a Rich Text bound to a CMS field renders `<h1>`/`<h2>`/`<p>`/`<em>`
  with the site's default rich-text styles, not the wrapper's class.
- Cause: the MCP style tool has no way to target tags inside a Rich Text
  (the Designer's "All H2s inside" selectors).
- Fix: put the type on the wrapper class and add `data-seo-rt` on it; repo CSS
  (`styles.css` › "SEO sub-pages: CMS rich text") makes the inner tags inherit
  and styles `em` per role (h1 / h2 / h3-dark / p).
- Status: fixed (SEO sub-page template)
- Found by: claude

### 2026-11-18 · Collection List "current item" reference filter cannot be set by MCP
- Area: designer / MCP / CMS
- Scope: template-candidate
- Symptom: `filters` on a Collection List with a Reference field and a bound
  value fails: "itemRef ... does not support bound filter values"; a list's
  `source` also cannot be set to a Multi-Reference field (the field id is dropped).
- Cause: MCP limitation; plain-text fields accept bound filter values.
- Fix: add a Plain Text "Service Slug" field to the child collection and
  filter `service-slug equals <current item Slug>` (static_json filter with a
  cms binding). Curated lists (related services) go in a CMS embed field.
- Status: worked around (Services • Tabs on the SEO template)
- Found by: claude

### 2026-11-18 · Services • SEO is at the 60-field limit
- Area: CMS
- Scope: project
- Symptom: creating a field fails with "Can not have more than 60 custom fields".
- Fix: "Advantage Header Sub-Title" (unused since the template rebuild) was
  renamed "Related Services (Embed)" and reused; old values are in
  `seo-redesign/webflow/backup-advantage-fields.json`. The other Advantage
  fields are also unused and can be freed the same way.
- Status: documented
- Found by: claude

### 2026-11-18 · Rich-text margin trim flattened designed embeds
- Area: CSS / CMS
- Scope: template-candidate
- Symptom: inside CMS rich-text embeds (SEO hero cards, diagrams, related tiles) spacing vanished;
  the cards row sat on the hero CTA.
- Cause: styles.css §04 `.w-richtext :where(:first-child, div:first-child :first-child){margin-top:0!important}`
  (and the last-child twin) matches every first/last child at any depth inside an embed.
- Fix: the trim now skips `.seo-sub-cards`, `.seo-sub-vx`, `.seo-sub-rel` and their descendants. Any new
  designed embed in rich text needs adding to that :not(:where(...)) list.
- Status: fixed
- Found by: claude (reported by the user)

### 2026-11-18 · Embed class names collide with site classes
- Area: CSS
- Scope: template-candidate
- Symptom: Local SEO map-pack rows overlapped and their text was squashed.
- Cause: prototype class names `d1`–`d5` and `dot` are also Webflow site classes (display headings, a
  vermillion dot); site CSS styled the embed elements.
- Fix: renamed to `sx-*` in the generator (`avoid_site_classes`) and in the CMS HTML
  (`seo-redesign/tools/fix-embed-classes.py`). Before adding prototype markup to a CMS embed, check its
  class names against the published site CSS.
- Status: fixed
- Found by: claude (reported by the user)

### 2026-11-19 · Sitemap toggle off adds noindex; the sitemap API publishes drafts
- Area: CMS / SEO
- Scope: template-candidate
- Symptom: (1) Featured posts carried `<meta name="robots" content="noindex">` on staging. (2) After
  turning their sitemap indexing back on, 277 draft posts went live on the staging domain.
- Cause: (1) Webflow adds noindex to any page or CMS item whose Sitemap indexing is off, so the
  toggle cannot hide a page from the sitemap only. (2) `bulk_update_items_sitemap_status` sets
  `isDraft` to false on draft items, so the next site publish publishes them.
- Fix: to keep indexed pages out of the sitemap, turn auto-generate off and paste a hand-written
  sitemap (`seo-redesign/tools/build-sitemap.py`). Before any sitemap-status bulk update, send only
  non-draft item ids, or re-run `unpublish_collection_items` on the drafts before publishing.
- Status: fixed
- Found by: claude

### 2026-11-19 · Asset upload fields come back camelCase; CMS image updates fail in big batches
- Area: Webflow API (MCP)
- Scope: template-candidate
- Symptom: (1) S3 answered 403 AccessDenied to every asset upload. (2) `update_collection_items`
  setting an Image field failed with "Request is malformed: Missing fields" for batches of 10–43,
  but the same items succeeded one or two at a time.
- Cause: (1) `create_asset` returns `uploadDetails` with camelCase keys (`xAmzSignature`,
  `contentType`, `successActionStatus`…); S3 needs the real form-field names. (2) Unclear;
  Webflow re-hosts each image on update, and larger batches fail intermittently.
- Fix: (1) map keys to `X-Amz-Algorithm`, `X-Amz-Credential`, `X-Amz-Date`, `X-Amz-Signature`,
  `Policy`, `success_action_status`, `Content-Type`, `Cache-Control` (`key`, `acl`, `bucket`
  unchanged) and send them with `--form-string`. (2) send image updates in small batches and
  retry failures one item per action; pass `{fileId, url}` without `alt`.
- Status: worked around
- Found by: claude
