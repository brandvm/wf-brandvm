# Audit: brandvm.com before the migration

Read-only. Measured or read on **2026-10-19** through the Webflow MCP (site
`68b9f0236581de795cba8ec2`) and the published HTML/CSS/JS of
www.brandvm.com. Each point says whether it was *measured* (a run or a
count) or *read* (from code/settings). Nothing was written to Webflow.

## Site

- Webflow site "Brand Vision Marketing", domains `www.brandvm.com` and
  `brandvm.com`; last published 2026-10-19 15:26 UTC. *read*
- **64 pages** in Webflow: 33 published static pages, 10 CMS templates with
  live pages, 16 CMS templates kept off the site ("No Live Pages"), 4
  separator draft pages, 2 draft design pages (`/design/style-guide`,
  `/design/components`). *read*
- **26 CMS collections**, 5 of them separators (`s-0`…`s-4`). *read*
- **Sitemap: 1,326 URLs**, of which 1,167 posts, 78 case studies, 11
  industries, 9 authors, 7 insight categories and 26 service detail pages
  (branding 7, SEO 8, web design 5, UI/UX 3…). *measured*

## Custom code delivery today

- Repo `brandvm/brandvm` (TypeScript + esbuild, 9 modules, 838-line
  untagged `styles.css`). *read*
- **Drift:** the repo and its README say production is **v1.1.2**, but the
  live footer code and the config Embed both load **`@1.1.1`**. So v1.1.2
  (visibility-based video controller) is not live, and the Finsweet tag still
  carries `fs-autovideo`, which brandvm's own GOTCHAS says must go when the
  bundle controls video. *read from published HTML*
- The config Embed's localhost stylesheet link is commented out on live.
  Good: visitors don't request localhost. *read*
- Lenis: the head code has Lenis CSS and the bundle has a Lenis module, but
  **no Lenis script loads on any page**, so the module never runs. *read*

### Scripts on every page (Home, in load order) *read*

Ahrefs analytics · Finsweet Attributes 2 (CDN, module) · Flowbase
tab-rotation 1.2.2 (CDN) · jQuery 3.5.1 · 3 Webflow chunks (`webflow.schunk`
×2 + page chunk) · GSAP 3.15 + ScrollTrigger + SplitText + CustomEase +
Observer (Webflow-hosted, for IX3) · GTM (head) · brandvm bundle (footer,
dynamic). HubSpot `v2.js` via an inline Embed on 36 pages.

### Custom code (word for word copies go to ROLLBACK.md in Stage 1) *read*

| Location | Content |
| --- | --- |
| Site head | GTM; theme-color, robots, 2 verification metas; jsDelivr preconnect; Ahrefs; Finsweet tag; `<style>` hiding dev elements + Lenis CSS; site JSON-LD graph (Organization, OfferCatalog, 4 LocalBusiness, WebSite) |
| Site footer | brandvm footer loader (`VER = '1.1.1'`) |
| Home | head: hero image preload, 3 hreflang links · footer: hero-panels align script |
| About | footer: Orbit gallery (≈280 lines JS + 90 lines CSS, uses `window.gsap`) |
| Industries | head: reduced-motion CSS · footer: carousel tilt script |
| Web Design | head: mobile/desktop hero preloads |
| Insights | head: RSS link |
| Work | footer: Finsweet list hook that restarts IX2 after render |
| Posts template | footer: BlogPosting JSON-LD builder |
| Embeds, every page | GTM noscript · CSS link Embed · config script Embed |
| Embeds, 36 pages | HubSpot form slot + loader |
| Embeds, 10 CMS pages | `.project-list` hover CSS (two near-identical copies) |
| Embed, Work | case-study grid `nth-child` CSS |

Static pages not listed above have no page code (checked: Contact, FAQ,
Services, Career, Branding, and the CMS templates for Case Studies,
Industries, Categories, Authors and Services).

## Interactions

**IX2** (in the page chunk): 16 action lists, 34 events
(`DROPDOWN_OPEN` 17, `DROPDOWN_CLOSE` 11, `MOUSE_CLICK` 5,
`MOUSE_SECOND_CLICK` 1). *read*

| Action list | Use |
| --- | --- |
| G Nav \| Drop Open, Drop Open 2, Drop Open 3, Drop Close | Mega-menu dropdowns (3 near copies) |
| G Nav \| Menu Open, Menu Close, Menu Close 2, Menu Close 3 | Mobile menu (3 close copies) |
| FAQs Accordion \| Open / Close | FAQ items (37 `data-w-id` on /faq) |
| S HUB \| Sub Open / Close | Services hub sub-lists |
| Filter Drop Open / Close | Insights filters |
| C Drop Click Open / Close | Generic click dropdown (`H \| C Drop`) |

**IX3**: 15 interactions (MCP `list_interactions`). *read*

| Interaction | Trigger | Target | Scope |
| --- | --- | --- | --- |
| Page Load \| Home | load | — | Home, Chicago, Miami, San Francisco, US, US Web Design, Montreal, Canada, Los Angeles, Dallas |
| Scroll \| Section Header | scroll | `.section-header` | site |
| Scroll \| Section All | scroll | `[data-gsap="animate-wrapper"]` | site |
| Section Header Image | scroll, scrub 0.8 | `.heading-image-mask` | component C \| Heading With Image |
| Process \| Scroll / Process Scroll \| Mobile | scroll, scrub | `.process-scroll` | site |
| Scroll Services Tabs Menu | scroll | `.service-tabs-menu` | site |
| Project Link Hover | hover in/out | `.project-overlay-link` | site |
| Project \| Cursor Move | mouse move (viewport) | 3 timelines | site |
| Who We Are Scroll | scroll, scrub | `.who-main` | About |
| Scroll Team Cards | scroll, scrub | `.team-scroll-w` | About |
| Scroll - About Method | scroll, scrub | `.method-main` | About |
| Career \| Join Visual | scroll, scrub | `.join-cta-visuals` | Career |
| Scroll Case Next | scroll, scrub | `.case-next-main` | Case Studies template |
| RM Visual Scroll | scroll, scrub | `.s-rm-intro` | Real Estate Marketing |

The published page chunk differs per page (Home loads
`webflow.8e0c63f0…js`, Contact `webflow.3eff193a…js`); each carries only
that page's interactions. *read*

## Design system

- **1,106 styles**: 722 classes, 349 combos, 35 tag styles. *read*
- **41 components**, most used: Button (1,305 instances), Overline (697),
  Paragraph (685), Heading (405), Industry Tab Content (264), Section Header
  (218), Social Links (207). Unused: G \| Embed Code, S \| Logo Strip,
  Contact Form (0 instances). *read*

### Similarity *measured* (50 captured pages, published CSS)

- **Sections:** 366 section uses across 50 pages, **45 distinct** section
  classes. Repeated sections are already components (Contact CTA on 37
  pages, FAQs 32, Social Proof 31…). Overlap between differently named
  sections is low; highest pairs: Contact CTA vs its /insights-contact copy,
  FAQs vs FAQ page main, Industry Hero vs RM Intro.
- **11 hero/page-header sections** (see MIGRATION-PLAN › Stage 6).
- **Classes:** 46 groups of single-class selectors with identical CSS (182
  classes); 138 pairs with ≥80% identical declarations. Lists in
  `docs/handoff/similarity/`.

## Speed *measured*

Median of 5 Lighthouse runs per page and mode (`docs/perf/LOG.md`):
mobile **41–56**, desktop **55–82** across the 10 key pages; mobile LCP
7.8–22.5 s; most pages 10–16 MB; the Work page **~98 MB**; CLS > 0.25 on six
page/mode pairs; TBT ≤ 233 ms.

## Visual baselines and noise floor *measured*

`pnpm wf:baseline save --live` on the 10 key pages at 1440, 820 and 390
(`baselines/`, kept out of git), then two `compare --live` runs with
nothing changed. The noise floor is the largest share of pixels that
differed between untouched runs; a later batch counts as visible only
above it.

| Page | 1440 | 820 | 390 | Source of the noise |
| --- | --- | --- | --- | --- |
| `/` | 0.0% | 0.0% | 0.0% | — |
| `/about` | 1.9% | 1.0% | 1.1% | Orbit gallery (scroll-driven), team cards |
| `/contact` | 0.0% | 0.0% | 0.0% | — |
| `/web-design` | 0.3% | 0.0% | 0.0% | services tabs |
| `/branding` | 0.1% | 0.0% | 0.1% | services tabs |
| `/our-work-portfolio` | 0.0% | 2.7% | 0.0% | project cards (Finsweet list render) |
| `/insights` | 0.0% | 0.0% | 0.0% | — |
| `/services` | 0.3%, height ±60 px | 0.0% | 0.0% | bottom of page (rows 9103–9162) |
| case study | 0.2% | 2.6% | 1.1% | case-next scroll section |
| post | 0.0% | 0.0% | 0.0% | — |

## Read-only checks *measured* (2026-10-19, `--live`)

Full output in `docs/audit/2026-10-19-*.txt`. These describe the site
**before** any change; later batches are compared against them. Fixing
them is not part of the parity work unless a decision says so.

- **Accessibility** (`wf:a11y --all-widths`, 10 key pages × 3 widths):
  38 serious/critical rule failures. Touch targets under 24 px (19:
  phone-number links in the footer and contact sections, author links on
  insight cards), links without discernible text (15: author links in
  insight cards and the newsletter slider, the mobile menu button),
  `aria-required-parent` (2, critical: CMS `listitem`s outside a `list`
  in Case Next and the Insights header), colour contrast (2:
  `.label-highlight.u-muted-50` text).
- **Links** (`wf:links --external`, first 50 pages): no internal 404s.
  92 links are empty or `#` (sub-service chips on service pages, "Read
  More +", award badges, sort controls, Privacy/T&C on Insights pages).
  External 4xx come from Facebook, X, LinkedIn, Indeed and similar
  bot-blocking sites (probably fine in a browser). One dead domain:
  `assetcomet.com` (linked from /branding/visual-identity).
- **Published HTML** (`wf:html`, key pages): 60 Webflow Tab links without
  `href` (Webflow's tab component; the template suggests button
  elements). 42 class names that no stylesheet defines (naming-only
  wrappers such as `s-services` and `sw-faqs`, the
  `js-close-dropdown` script hook, HubSpot/reCAPTCHA classes). Console:
  Cloudflare Turnstile CSP noise on the contact form.
- **SEO** (`wf:seo`, first 500 sitemap URLs): 244 findings. **211 posts
  have an empty `og:image`** (the Posts template binds `post-thubmnail`,
  which is empty on those items); 30 static pages have no `og:image`;
  3 posts have 2–4 `<h1>`. The rest are length notes (445 titles and
  251 descriptions outside the suggested length).
- **Heading outline** (`wf:outline`, Home; the script takes one path):
  one H1; four section overlines are H4s directly under H1/H2 ("skipped a
  level"): Selected Clients, Services, Industries, Common Questions.

## Not yet measured (Stage 0/1)

- PageSpeed via the PSI API: the keyless quota ran out; needs a key.
