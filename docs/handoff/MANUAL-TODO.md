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
| C | S \| Contact CTA component › Embed with class "Hubspot Form", **both variants** (base, and the variant used on /contact) | — | Delete the whole `<script>…</script>` part. Keep only the form `<div>`: base keeps `<div class="hs-form-slot" data-hs-form=…>`; the /contact variant becomes `<div class="hs-form-slot" data-hs-form="7a162eb3-35f1-476d-8877-2d1bd30b0f28" data-hs-portal="22077182" data-hs-region="na1"></div>` (also drop its `v2.js` tag and inline `hbspt.forms.create`). Then tell Claude to verify and publish | The Embed's code differs per variant ("containsBindings"); the API can't read or write it | ☐ |
| D | Site settings › Apps (or the Flowbase account) | — | Uninstall / disable Flowbase "Auto Tab Rotation" booster. `tab-rotation.ts` takes over automatically (it stays off while Flowbase's script is on the page) | Installed by an app, not as site/page code; no API to remove it | ☐ |

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
