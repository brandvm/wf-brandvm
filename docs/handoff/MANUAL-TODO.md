# Manual Designer steps

Everything the Webflow MCP can't do, for a person to do in the Designer.
Claude adds a row the moment it hits a limit, with *why* the API can't;
the person marks it done; Claude then reads the result back (or checks it on
the canvas when the API can't read it) and says so.

Common reasons, so they don't need re-explaining (see the skill's
`lessons/mcp.md`):
- a value mixing a variable with `calc()`, a gradient or a shadow;
- conditional visibility on a CMS field; a list sourced from a
  multi-reference or multi-image field; "exclude current item";
- a link to the current CMS item, in a list or a component prop;
- tag styles that have never been set; reserved class names;
- placeholders, slot names, variant props exposed from nested instances.

How to enter a value with variables: select the class, switch to the
breakpoint, type `calc(` in the field and insert variables with the
variable picker. Gradients: Backgrounds → gradient, pick each stop from the
variables.

Letters run A, B, C… then AA, AB… and are never reused, so a letter
mentioned in GOTCHAS or a commit stays unambiguous.

Categories to expect on every build. Go through them at the start and
again at each gate, so the steps are found early and not at the end:

1. **Values with variables in a calc, gradient or shadow** (negative
   section padding, nav height + padding, gradient stops).
2. **Reserved class names** (Label, Form) and **tag styles** never set
   before (All H1–H6 Headings, All Paragraphs, All Links): one property
   set by hand, then the API can do the rest.
3. **CMS bindings:** lists from a multi-reference or multi-image field,
   "exclude current item", links to the current item, conditional
   visibility, decimal number formats, date bindings.
4. **Component wiring:** slots made and named, variant props exposed from
   a nested instance, variant styles on an element with a combo class,
   conditional classes (typed text: check the published class list).
5. **Forms:** field names (type a value that differs from the one shown),
   placeholders, the notification address, the success and error states.
6. **Page settings:** sitemap and search exclusion, the 404 and password
   pages (the API can't reach utility pages), Open Graph images for CMS
   templates.
7. **Site settings:** fonts uploaded, head and footer code pasted, the
   staging password.

| ID | Where (page › element or class) | Breakpoint | Set | Why the API can't | Done |
| --- | --- | --- | --- | --- | --- |
| A | Site settings › Custom code (Stage 2 cutover, below) | — | Head and footer snippets | Done by Claude through the MCP on 2026-10-19 (go-ahead from Asheem); published HTML checked word for word against loader.html | ☑ |
| B | G \| Components › Embeds 2 and 3 (Stage 2 cutover) | — | Replace with loader 2a / 2b | Done by Claude through the MCP (`code` setting) on 2026-10-19 | ☑ |
| C | S \| Contact CTA component › Embed with class "Hubspot Form", **both variants** (base, and the variant used on /contact) | — | Delete the whole `<script>…</script>` part. Keep only the form `<div>`: base keeps `<div class="hs-form-slot" data-hs-form=…>`; the /contact variant becomes `<div class="hs-form-slot" data-hs-form="7a162eb3-35f1-476d-8877-2d1bd30b0f28" data-hs-portal="22077182" data-hs-region="na1"></div>` (also drop its `v2.js` tag and inline `hbspt.forms.create`). Then tell Claude to verify and publish | The Embed's code differs per variant ("containsBindings"); the API can't read or write it | ☑ done by Asheem (both variants render the slot on staging, checked 2026-10-19) |
| D | Site settings › Apps (or the Flowbase account) | — | Uninstall / disable Flowbase "Auto Tab Rotation" booster. `tab-rotation.ts` takes over automatically (it stays off while Flowbase's script is on the page) | Installed by an app, not as site/page code; no API to remove it | ☐ |
| E | Home hero (+ the 9 location pages with the same hero) | all | The Home hero intro build, section below | Designer markup, Embeds, page head code and an IX3 deletion; done together with a wf-brandvm release | ☐ |
| F | Interactions panel › IX2 "G Nav \| …" (8 action lists) | all | Delete them, after Asheem has tried staging with `?wfc-ix=repo` | IX2 deletion has no API | ☐ |
| G | Interactions panel › IX2 "FAQs Accordion", "S HUB", "Filter Drop", "C Drop Click" (8 action lists) | all | Delete them, after trying staging with `?wfc-ix=repo` (section below) | IX2 deletion has no API | ☐ |

## F · Nav cutover (Stage 4)

1. **Try it first:** open any page on `brandvm.webflow.io` with
   `?wfc-ix=repo` (remembered in that browser; `?wfc-ix=off` to go back).
   Desktop: Services / About / Resources mega menus. Phone/tablet: the menu
   button, the dropdowns inside, the close button, Escape.
2. **Claude:** remove the flag check from `nav.ts` and the `!important`s
   and the `html.wfc-ix` prefix from styles.css §03 "G | Nav", release.
3. **Webflow:** delete IX2 action lists "G Nav | Drop Open", "Drop Open 2",
   "Drop Open 3", "Drop Close", "Menu Open", "Menu Close", "Menu Close 2",
   "Menu Close 3" and their 12 events, in the same publish as the release.
4. Publish staging, check by eye at 1440, 991, 390; then "publish".

## G · FAQ, Services hub, Filter and C-drop cutover (Stage 4)

1. **Try it first** on `brandvm.webflow.io` with `?wfc-ix=repo`: a FAQ
   (`/`, `/faq`, any service page), the sub-lists on `/services`, "Sort by"
   on `/insights`, and "Learn More" on any case study (also with the
   keyboard: Tab to it, Enter).
2. **Claude:** remove the flag check and the `stopPropagation` from
   `c-drop.ts`, the `!important`s and the `html.wfc-ix` prefix from
   styles.css §03 "FAQ, Services hub and Filter dropdowns" and "C-drop",
   release.
3. **Webflow:** delete IX2 action lists "FAQs Accordion | Open", "FAQs
   Accordion | Close", "S HUB | Sub Open", "S HUB | Sub Close", "Filter
   Drop Open", "Filter Drop Close", "C Drop Click Open", "C Drop Click
   Close" and their 22 events (e, e-2, e-5…e-24), in the same publish as
   the release.
4. Publish staging, check by eye at 1440, 991, 390; then publish.

## E · Home hero intro cutover (Stage 4, one batch, staging first)

The code is ready and inert: `src/modules/hero-intro.ts` + styles.css §03
"Home hero intro" run only once the hero has `data-hero`. Target markup:
`tests/fixtures/home-hero.html`; Embed snippets: `docs/handoff/home-hero/embeds.html`.

**Scope: 10 pages.** `/`, `/chicago`, `/miami`, `/san-francisco`, `/us`,
`/us-web-design`, `/locations/montreal`, `/locations/canada`,
`/locations/los-angeles`, `/locations/dallas` all use the same
`s-home-hero` and IX3 "Page Load | Home" (`i-fa832f3a`). Easiest: make the
hero a component first (`S | Home Hero`), then do steps 1–7 once.

1. **Hero section** `.s-home-hero`: attribute `data-hero` (no value).
2. **Desktop grid** (`.hero-panels-grid` inside `[data-hero-panels]`):
   attribute `data-rig="desktop"`. Delete the three hidden
   `.hero-panels-layer-panorama` images. Add Embed **E2** as its first child.
3. **Styles** (Designer): new class `hero-window-scene` → position absolute,
   inset 0, z-index 0, overflow hidden, pointer-events none (the Embed's
   `img` needs: absolute, inset 0, 100% × 100%, object-fit cover; give it
   class `hero-window-scene-img` in the Embed if a descendant style is not
   wanted). `.hero-panels-panel` → z-index 1. `.hero-panels-panel-center`
   → border-left none. `.hero-panels-fader` → z-index 2, pointer-events none.
4. **Headline** (h1 `.d1`): three line wrappers, each a Span with attribute
   `data-hero-line` holding one inner Span: "Award-Winning ", "Branding &
   Web " (accent classes), "Design Agency" (accent classes), with the two
   Line Breaks between them. Today lines 2 and 3 share one outer span.
5. **Attributes:** `data-hero-reveal` on both `.max-width` blocks in
   `.home-hero-right`; `data-hero-cta` on both `.grouped-cta-w` in the hero;
   `data-hero-nav` on the nav wrapper `.g-nav-w` (fine site-wide: the CSS
   only reacts when the page also has `[data-hero]`).
6. **Phone card** `.home-hero-center`: add combo class `hero-phone-card`
   (position relative, background none); replace its Image with Embed
   **E3**. Styles: `.hero-panels-grid.hero-panels-grid-phone` → absolute,
   inset 0, column and row gap 0.5em; `.hero-panels-panel.hero-panels-panel-phone`
   → radius `--_radius---12`.
7. **SVG windows:** Embed **E4** as the last child of the hero section.
8. **Home page head code:** E1 (scene preload). **Home page footer code:**
   delete the hero-panels align script (it never worked: wrong selector).
9. **Interactions:** delete IX3 "Page Load | Home" (`i-fa832f3a`).
10. **Release:** Claude tags the wf-brandvm release that contains
    hero-intro.ts and sets `RELEASE` in the head code; publish staging,
    check all 10 pages at 1440 and 390 (first visit, returning visit,
    reduced motion), then "publish".

## Stage 2 cutover (one batch, staging first)

Only after `v1.0.0` is tagged on a commit whose CI passed. Everything is
pasted from `loader.html` with comments removed. `ROLLBACK.md` has the
originals.

1. **Site settings › Custom code › Head code.** Keep GTM, the meta tags,
   Ahrefs, the dev-support `<style>` rules and the JSON-LD. Then:
   - delete the `<!-- Asset Connection -->` jsDelivr preconnect line (the
     head snippet warms the right origin itself);
   - in the Finsweet tag, delete `fs-autovideo`, keeping `fs-list
     fs-socialshare` (D2);
   - in the `<style>`, delete the "Lenis Smooth Scrolling" rules (D3);
   - paste **piece 1** (the `<script>` defining `window.WFC`) with
     `var RELEASE = "1.0.0";`.
2. **G | Components** (open the component). It holds three Embeds:
   - Embed 1, GTM noscript: leave it;
   - Embed 2, `<link id="bv-css" …>`: replace its contents with **2a**;
   - Embed 3, the `bv` config script: replace its contents with **2b**.
3. **Site settings › Custom code › Footer code:** replace the brandvm
   footer loader (`__bvFooterStarted`, `VER = '1.1.1'`) with **piece 3**.
4. **Publish to `brandvm.webflow.io` only.** Then Claude checks staging:
   bundle from GitHub Pages, no console errors, Staging/Dev pill,
   `wf:baseline compare` and `wf:film` against the live baselines.
5. Check nothing else is pending in Webflow, then type **publish**.
6. Claude checks the live domain: bundle from
   `cdn.jsdelivr.net/gh/brandvm/wf-brandvm@1.0.0`, baselines, console,
   and the PageSpeed log.
