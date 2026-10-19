# Brand Vision: migration onto wf-template

Started 2026-10-19. This is the plan for moving brandvm.com's custom code from
`brandvm/brandvm` (built on an older, untagged wf-template) onto this repo,
which was created from **wf-template v0.6.0**. It follows the template's
`webflow-audit` skill: the site is live, so every change is measured, ships
alone, and can be taken back.

The goal, in order:

1. **Same site, new plumbing.** After the cutover the site looks and behaves
   exactly as it does today, but its code lives here and follows the
   template.
2. **All animation in the repo.** Every IX2 and IX3 interaction is replayed
   from this repo, so the Webflow interactions can be deleted. Removing them
   also removes Webflow's GSAP runtime and the IX3 `visibility:hidden` gate.
3. **Optimizable.** With the code here, each later performance or cleanup
   change is a small, reviewable batch.
4. **Optional:** consolidate sections, components and classes that are truly
   the same. This is not a goal in itself: only merge where it removes real
   maintenance cost (see the Figma review page).

Rules carried over from the template (`AGENTS.md`, `webflow-audit`):
nothing is written to Webflow without a go-ahead; a live publish needs the
word **publish** for that batch; Designer-first CSS; scripts live in the repo,
not in Webflow custom code.

Companion documents in this folder:

| File | Holds |
| --- | --- |
| `AUDIT.md` | What exists today, with numbers and dates |
| `STATUS.md` | Every request, in your wording, with its state |
| `DECISIONS.md` | Decisions as they are made |
| `ROLLBACK.md` | Written in Stage 1: the rollback point and all custom code word for word |
| `MANUAL-TODO.md` | Designer steps only a person can do |
| `../perf/LOG.md` | PageSpeed after every major step |

---

## Stage 0: Setup and baseline (done 2026-10-19)

- [x] Repo `brandvm/wf-brandvm` created from `brandvm/wf-template` v0.6.0
  (`brandvm/brandvision` was already taken by Asheem's Astro prototype and
  is untouched). `pnpm new-project` was run; `webflow-build.config.json` has
  the live URL, key pages and the parity asset map.
- [x] Read-only inventory through the Webflow MCP and the published HTML
  (`AUDIT.md`).
- [x] HD screenshots of the live site: all 32 static pages plus two items
  per CMS template (50 pages), desktop 1440 @2x and mobile 390 @3x, in
  `Brand Vision/screenshots/2026-10-19-live/` (outside git; 1.2 GB).
- [x] PageSpeed baseline: median of 5 Lighthouse runs, mobile and desktop,
  for the 10 key pages (`docs/perf/LOG.md`). Mobile 41–56, desktop 55–82;
  the Work page transfers ~98 MB.
- [x] Figma review page: "Migration & Optimization Plan — 2026-10-19" in the
  Changelog file.

## Stage 1: Plan, rollback point, decisions (this document)

Nothing visible changes. Gate: you approve this plan and the decisions in
`DECISIONS.md`.

1. ~~**Rollback point.**~~ Done 2026-10-19: tag `v1.1.1` already exists and is
   byte-identical to what jsDelivr serves live; `ROLLBACK.md` + `rollback/`
   hold every piece of custom code word for word. **[Person]** still open:
   finding where the Flowbase script is installed. The Webflow backup
   `2026-10-19 pre-wf-brandvm` and branch protection on both repos exist.
2. ~~**Visual baselines and noise floor.**~~ Done 2026-10-19 (AUDIT ›
   noise floor). `pnpm wf:baseline save --live` on
   the key pages at three widths, then `compare` with nothing changed, to
   record the noise floor (video frames, the orbit, the logo marquees,
   counters). `pnpm wf:film --live` for the first second of load.
3. ~~**Read-only checks**~~ Done 2026-10-19 (`docs/audit/`, AUDIT ›
   Read-only checks). `wf:film` (load-time) is run at the start of Stage 2.
4. ~~Settle open decisions D1–D6~~ done 2026-10-19 (`DECISIONS.md`).

## Stage 2: Parity port (new plumbing, no visible change) — live 2026-10-19 (v1.0.0)

Port `brandvm/brandvm` into this repo **as it is**. No rewrites in this stage.

**JavaScript.** Each existing module moves to `src/modules/` and runs through
the template's `run()` manifest in `src/index.ts`:

| brandvm module | What it does | Plan |
| --- | --- | --- |
| `counter.ts` | `[data-count-end]` count-up | Port as is |
| `dot-map.ts` | canvas dot map (512 lines) | Port as is; lazy-init later (Stage 5) |
| `dropdown-close.ts` | `.js-close-dropdown` closes a Webflow dropdown | Port as is |
| `flare-border.ts` | `[data-flare-border]` in-view class | Port as is |
| `lazy-videos.ts` | visibility-based video play, `data-bv-lazy-video` | Port the v1.1.2 version (D2); `fs-autovideo` removed in the same publish |
| `newsletter.ts` | Swiper sliders, Swiper loaded from a CDN at runtime | Port as is; bundle Swiper later (it is already a devDependency) |
| `read-more.ts` | `[data-readmore]` toggles | Port as is |
| `lenis.ts` | Lenis smooth scroll | **Dead on live:** dropped with the Lenis CSS in head code (D3) |
| `environment-switcher.ts` | Staging/Dev pill | Replace with the template's (same feature, `wfc-dev` flag) |

The template's starter modules (`aria-roles`, `placeholders`,
`unique-form-ids`) stay **off** during parity. Each is turned on later as its
own measured batch, because each changes published markup.

**CSS.** The 838-line `src/styles.css` predates the repo-css policy and is
untagged. For parity:

- Its rules are moved into the template's numbered sections, each tagged with
  a `repo-css:` reason. Rules the Designer could own are listed for Stage 6
  instead of being kept silently.
- **The template's own foundation stays out of the parity release.** §01
  viewport font scaling, §02 resets, §03 neutralizers and the `is-loading`
  scroll lock would each change the live site (brandvm's GOTCHAS 2026-09-11
  "Template defaults would have changed a live site"). Each is added back
  later only if it is needed, as its own batch.

**Loader.** The live site uses brandvm's 4-section loader (head preconnect,
Embed 1 CSS, Embed 2 config, footer). It moves to the template's
`loader.html`: head code (`window.WFC`, `RELEASE`), Embeds **2a** (link) and
**2b** (script) inside the **G | Components** component (it already exists,
43 instances), and the footer loader. One version string, `RELEASE`, instead
of `VER` in two places. The dev flag changes from `?bv-dev=1` to
`?wfc-dev=1`.

**Verification** (the release is a no-op for visitors):
`pnpm check && pnpm build && pnpm test`; `pnpm wf:parity` (the asset map
in `webflow-build.config.json` swaps the old bundle for the new one on live
HTML); `wf:baseline compare` inside the noise floor; `wf:film` for load-time
parity; console clean at three widths.

**Cutover** (one batch): tag `v1.0.0` → **[Person]** paste the three
snippets, publish to staging → verify → you check nothing else is pending →
you type **publish** → verify live → archive `brandvm/brandvm` as read-only
(D6). Rollback = paste the old snippets back (ROLLBACK.md).

PageSpeed after: expected flat (±noise). Logged anyway.

## Stage 3: Webflow custom code into the repo

Progress (2026-10-19):
- **3.1 live:** the six duplicate CSS Embeds (project-list ×5 CMS templates,
  case-study grid on Work) removed; `styles.css` already had the rules.
  Desktop/tablet identical; on phones the 4th project card now shows its
  title (by design: hidden on desktop/tablet, shown on phones; the Embeds
  had hidden it on phones too).
- **3.2 live (v1.1.0):** Orbit (About) and the Industries carousel tilt move
  into `orbit.ts` / `industry-tilt.ts` (verbatim; Orbit CSS → §04). The
  About registered script `methodologypinnedscroll-1.0.1.js` is dead code
  (no `.methodology-track` on the page) and is removed, not ported.
- **3.3a/b live (v1.2.0):** `hubspot-form.ts` (the Contact CTA Embed's
  lazy loader, ported) and `tab-rotation.ts` (own implementation of the
  Flowbase `fb-tabs` attributes). S | Contact's Embed is now the form `<div>`
  only. Open: the S | Contact CTA Embed scripts (variant code the API can't
  edit) and uninstalling the Flowbase app: MANUAL-TODO C and D.
- **Kept in Webflow until Stage 4:** the Home hero-panels script (it
  reveals the LCP element inline; moving it into the async bundle would
  delay that) and the Work page Finsweet → IX2 restart hook (needs IX2).

Every script or style that lives in Webflow today moves into a module or a
tagged CSS section, then is deleted from Webflow **in the same batch**. In
`AUDIT.md` › Custom code:

| Where now | What | Becomes |
| --- | --- | --- |
| Home › page footer | hero panel alignment (`[data-hero-panels]`) | `hero-panels.ts` |
| About › page footer | Orbit gallery: 280 lines of JS + CSS, uses Webflow's `window.gsap` | `orbit.ts` + CSS §05; must move with Stage 4 GSAP |
| Industries › head + footer | hero carousel random tilt + reduced-motion CSS | `industry-tilt.ts` + CSS §07 |
| Posts template › footer | BlogPosting JSON-LD built in the browser | CMS-bound JSON-LD in the Posts template (D4), checked with `wf:seo` before the script is removed |
| Work › footer | Finsweet list hook that restarts IX2 | Goes away once IX2 moves to the repo (Stage 4) |
| Site head | Finsweet Attributes CDN tag (`fs-list fs-socialshare fs-autovideo`) | Template `recipes/finsweet` (bundled, not a CDN tag); `fs-autovideo` is dropped (it fights `lazy-videos`; already noted in brandvm GOTCHAS) |
| App-injected, every page | Flowbase tab-rotation script; used only by the About "Our Work" client tabs (`fb-tabs`, 15 s, progress bar) | `tab-rotation.ts` reading the same `fb-tabs-*` attributes, so the Designer markup stays; runs only where `[fb-tabs]` exists |
| Site head | `<style>` dev-support hiding + Lenis | CSS §08 / dropped with Lenis |
| 10 CMS pages › Embed | `.project-list` hover CSS, **two near-identical copies** | One CSS rule in §05 |
| Work › Embed | case-study grid `nth-child` CSS | CSS §05 (`designer-cant`) |
| 36 pages › Embed | HubSpot form loader (inline `hsforms.net/v2.js`) | `hubspot-form.ts`, loads on approach (Stage 5 measures it) |

Stays in Webflow: GTM, Ahrefs, meta tags, hreflang links, page preloads and
the site JSON-LD (they are data, not behaviour). Each batch is
measured and verified like any other.

## Stage 4: All IX2 and IX3 interactions into the repo

So you can delete every Webflow interaction. Inventory (AUDIT › Interactions):
**16 IX2 action lists** (34 events: nav dropdowns ×3 variants, mobile menu
×3, FAQ accordion, services-hub sub menu, filter dropdown, C-drop) and
**15 IX3 interactions** (10 scroll, 2 hover/cursor, 1 page load across 10
pages, 2 component scope).

Method (the template's lesson *Moving off IX3: decode the published
interactions, then replay them*, `lessons/js.md`):

1. **Decode, don't eyeball.** The published `webflow.*.js` carries every
   IX2 action list and IX3 timeline as plain JS literals. Note: the chunk
   **differs per page** (Home and Contact load different files), so decode
   from every page type, then merge. Output: `src/interactions/spec.json`,
   checked in, with each interaction's trigger, targets, eases (IX3 ease
   index table) and breakpoint rules.
2. **Replay with bundled GSAP** (`gsap`, `ScrollTrigger`, `SplitText`,
   `CustomEase`), one module per family:
   - `ix-scroll.ts`: Section Header, Section All (`[data-gsap]`), Process
     (desktop/mobile split), Who We Are, About Method, Team Cards, Career
     Join, Case Next, RM Visual, Section Header Image (component scope),
     Services Tabs Menu. Built lazily one screen ahead, one
     `ScrollTrigger.refresh()` per build.
   - `ix-pointer.ts`: Project Link Hover and Project Cursor Move.
   - `ix-load.ts`: Page Load | Home (Home + 9 location/US pages), as **CSS
     keyframes** gated on `html:not(.w-mod-ix3)`, so it starts at first paint
     instead of after IX3's gate (the main mobile LCP cost).
   - `nav.ts`, `accordion.ts`, `dropdown.ts`: the IX2 nav, FAQ, filter and
     C-drop behaviour, written as plain JS + CSS state classes with ARIA
     (`aria-expanded`), not as animations of inline styles. One nav module
     replaces the three "Drop Open / Menu Close" copies.
   - The Orbit (Stage 3) switches to the bundled GSAP at the same time.
3. **Dormant until cutover.** Bundled GSAP never overwrites Webflow's
   `window.gsap`. The modules stay off while Webflow's IX runtime is on the
   page, so there is no double animation in between.
4. **Cutover per family**, on staging: delete that family's interactions in
   Webflow (**[Person]** or MCP after a go-ahead), publish staging, compare
   against the baselines **and by eye** (IX3 writes start styles inline, so
   a blocked-IX3 check is only approximate), then publish. When the last IX3
   interaction is gone, Webflow stops loading its GSAP files.
5. `prefers-reduced-motion`: each module honours it (Lighthouse doesn't
   emulate it, so it's checked by hand).

PageSpeed after each family; this is the stage with the largest expected
gain (fewer scripts, no IX3 hide-until-ready, less main-thread work).

## Stage 5: Performance batches

Ordered lowest risk first, one change per batch, kept only if its number
moves (the median beats the spread). Candidates, to be confirmed by the
baseline:

- **Work page weight (~98 MB per load):** find what loads (videos or
  full-size images in the case-study list) and lazy-load it. Highest value.
- **CLS > 0.25** on Home, Contact, Work, Insights, About, Branding: find
  the shifting element per page (`wf:film`).

- Bundle Swiper and Finsweet instead of runtime CDN loads; load each module
  only on pages with its markup.
- HubSpot form script on approach or interaction, not on load (36 pages).
- `dot-map` canvas: start on view, pause off-screen.
- Hero LCP images: check the existing preloads (Home, Web Design) actually
  help (template lesson: *Measure preloads*).
- Turn on the template starter modules (`aria-roles`, `unique-form-ids`,
  `placeholders`) where they fix real findings from `wf:html`/`wf:a11y`.
- Webflow-side settings (CSS/JS minify, lazy images, unused fonts): reported
  as **[Person]** steps.

## Stage 6 (optional): Classes and components

Marked on the Figma page for review. Only merges that remove real duplicate
upkeep. Summary (details in `AUDIT.md` › Similarity):

- **Hero / page header family:** 11 different hero sections (`s-home-hero`,
  `s-hero`, `s-page-header`, `s-page-header is_service`, `s-case-hero`,
  `s-category-hero`, `s-post-hero`, `s-industry-hero`, `s-work-hero`,
  `s-insights-header`, `s-sitemap-hero`). Candidate: fewer components with
  variants. Review per pair; some are distinct designs and stay.
- **Two Contact CTA builds** (`s-contact-cta` on 37 pages vs
  `s-contact-cta in-contact-page-2` on /insights-contact) and **two FAQ sections**
  (`s-faqs` component vs `s-faqs-main` on /faq): candidates for one
  component with a variant.
- **Card family:** Service Card ≈ Service Tab (91% same declarations),
  Contact Location ≈ Project Card content, Job Card ≈ SEO Bento CTA. Merge
  only where the cards are meant to evolve together.
- **Identical classes:** 46 groups / 182 classes have identical CSS. Most are
  harmless (empty CMS wrapper classes). Worth merging: `.type-base` =
  `.paragraph`, `.type-h2` = `.heading`, `.button-group---left-top` =
  `.button-group---right-bottom`, a 7-class "stack" pattern, and the
  `u-hide`/`orbit-source`/`orbit-size`/`orbit-ratio`/`hidden-link` group.
- **Nav IX2 copies:** "Drop Open / 2 / 3", "Menu Close / 2 / 3" become one
  module in Stage 4 anyway.
- **Housekeeping:** 5 separator CMS collections (`s-0`…`s-4`), 4 separator
  draft pages and 16 "No Live Pages" templates are folder dividers.
  Leave them unless you want them gone (D5).

Each accepted merge is a Designer change (MCP after go-ahead or
`MANUAL-TODO.md`), checked against the baselines.

## Stage 7: Close

Before/after report per request in `STATUS.md`; `ROLLBACK.md` updated; old
tags kept; lessons offered back to wf-template (`template-candidate` entries
in `GOTCHAS.md`), for example the per-page IX chunk.

## PageSpeed tracking

After every stage and every Stage 5 batch, `docs/perf/LOG.md` gets one row
per key page × mobile/desktop: score, LCP, TBT, CLS and transfer size, each
the **median** of several runs with its range. Two sources:

- **PageSpeed Insights API** (Google's servers; what you see on
  pagespeed.web.dev): median of 3 runs. The keyless quota ran out on day
  one, so it needs an API key: put `PSI_KEY=…` in `.env` (gitignored), never
  in chat.
- **Local Lighthouse** (`pnpm wf:perf --live`): median of 5 runs, same
  machine every time, for fine-grained before/after.

Key pages: `/`, `/about`, `/contact`, `/web-design`, `/branding`,
`/our-work-portfolio`, `/insights`, `/services`, one case study, one post.
