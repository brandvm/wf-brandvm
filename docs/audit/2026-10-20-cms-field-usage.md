# CMS field usage and field groups: brandvm.com

Read-only, **2026-10-20**. Follows `2026-10-20-cms-audit.md`. The per-field
table (all 348 fields, verdict, evidence, current group) is in
`2026-10-20-cms-field-usage-table.md`. Nothing was written to Webflow.

## Method

A field counts as **used** if anything on the site reads it. Six sources
were checked:

1. **Designer bindings** on 55 pages (every page except the 4 separator
   pages and 5 separator templates) and all 42 component definitions:
   element text/image/link/attribute bindings, component props bound to
   CMS, collection-list source, filters and sort. *measured*
2. **Filters and sorts passed into components as props** (`S | FAQs`,
   `S | Projects`). *measured*
3. **Page settings:** SEO title/description and Open Graph image tokens
   on the 10 live templates. *read*
4. **Page custom code** on the templates: no `{{wf}}` tokens. The Posts
   footer script reads the rendered page, not CMS fields. *read*
5. **Repo code:** no module reads a CMS field directly. *read*
6. **Live HTML** (66 pages: all static pages, 4 items per template, 6
   posts). The check is per item, on the item's own page, so text that
   appears elsewhere doesn't count. Reference fields were checked in reverse:
   are the referenced items the ones the page shows? *measured*

### What the MCP can't see (worked around with live HTML)

- **Conditional visibility conditions:** the MCP returns only
  `"conditional"` (63 elements), not the field it tests.
- **"Equals current item" filters:** e.g. FAQs on industry/service pages
  show an empty filter prop, yet every page shows exactly the 12 FAQs that
  reference it.
- **Lists sourced from a multi-reference field:** the MCP reports only the
  target collection (e.g. "Recommended" on Posts = Related Articles).
- **Bindings inside component definitions** and **children of component
  slots** (`G | Page Wrapper` slots on the service templates; tabs, jobs).
- Webflow publishes no `w-condition-invisible` markup for these, so the
  HTML can't show conditions either.

Fields that only these routes could confirm were checked by the reverse
test above; none is left as "unknown".

## Result

| Verdict | Fields |
|---|---|
| Used | 256 |
| Name / Slug | 42 |
| **Unused: filled, but nothing reads it** | **28** |
| **Unused and empty** | **14** |
| **Bound in the Designer but always empty** | **8** |

66 collection lists read the CMS (Posts 11, FAQs 7, Partners 7,
Industries 6, Case Studies 6, Services (No Pages) 5, Platforms 5, …).

### Unused, but filled: content nobody sees (fix or delete)

| Collection | Fields | What's happening |
|---|---|---|
| Services • SEO | all 12 `advantage-*` fields | Filled on 8/8 items; the SEO template has no section that renders them. Industries' advantage block *is* used. |
| Services • Web Design | `step-title-1…4` | The Process section shows static "Discover / Design / Development…" titles; the CMS titles ("Shopify Build", "Rebuild & Migrate"…) never appear. Descriptions are used. |
| Services • UI/UX | `step-title-1…4`, `step-description-1…4` | The whole Process block is static copy; tailored CMS process copy never appears. |
| Posts | `minutes-to-read` | Filled on 1,704 posts, shown nowhere. |
| Case Studies | `project-deliverables` | Filled 119/128, not rendered. |
| Case Studies | `project-title-byline-h1---3` | Not bound; duplicates tagline/name on 117/119. |
| Partners | `sort-order` | Every Partners list is curated or unsorted. |

Services • Branding and SEO bind their own `step-*` fields; Web Design and
UI/UX look like templates where the Process component was never wired to
the CMS. **Decide per template: wire the fields (the copy is already
written) or delete them.** For SEO advantage, either add the section or
delete the 12 fields.

### Unused and empty (safe to delete after a last look)

- Case Studies: `new-case-study-cover----case-study`,
  `new-preview-description----shared`, `featured-shot----work`,
  `home-feature-cover` (already in group "Old [Do Not Use/Edit]").
- All four Services collections: `dropdown-images`, `dropdown-content`
  (group "Services Hub Page" says they're used on /services; they're not,
  and they're empty).
- Services • Tabs: `tab-color-for-mobile`. Accordions:
  `bubble-image-for-later`.

### Bound but always empty

Industries `tab-*-7` and `tab-*-8` (8 fields) are bound on the template,
so the tabs exist in the design but no industry fills them (tab 6: 5 of 12).
Deleting them means removing tabs 7–8 from the template first.

### Group labels that are wrong

- **Posts `featured` is in a group named "DO NOT USE", but three lists
  filter on it:** `S | Insights` and the nav's Insights list *exclude*
  featured posts, and `S | Featured Articles` shows *only* featured ones.
  With 707 posts flagged, this flag decides what appears on /insights. The
  earlier audit's "reset featured" stands, but the group label must change
  first, or the next editor will ignore it.
- Case Studies' "Old [Do Not Use/Edit]" holds `project-title-byline-h1---3`
  (correct: unused) and four empty fields (correct).
- Platforms' only group is "Services Hub Page", but `image`, `page-link`
  and `description` are also used on /web-design and /web-development.

### Also confirmed

- FAQs: all 6 reference fields are used (industry/service pages match by
  current item; static pages by `for-pages`). The /faq page filters on the
  6 *topic* categories only, so the 5 *page-type* category values on 707
  FAQs are read by nothing (supports the Option-field change in the first
  audit).
- `selected-work(s)` on Industries and all Services, Case Studies
  `services` / `industry-s` / `platform-s-used`, Services • Tabs
  references and `sort-order`, Posts `related-articles`, Jobs options: used.

## Field groups today

| Collection | Groups |
|---|---|
| Posts | Filters & Sorts · Meta Datas · Main Content · DO NOT USE |
| Case Studies | Filters & Sorts · SEO · General · Videos · Client Information · Project Information · Project Visuals · Old [Do Not Use/Edit] |
| Services ×4 | SEO Settings · Global & Required · Services Hub Page · Hero · Services · Process · Work · Industries · (Advantage) · Stats |
| Industries | SEO · Hero · Services · Tab Services · Advantage · Case Studies · Card |
| Services • Tabs | Main Content · Filters (`short-tab-label` ungrouped) |
| Accordions | Filters & Sorts · Content · Button (Optional) |
| Platforms | Services Hub Page (1 of 3 fields) |
| 11 others | none (Authors, Categories, Badges, Partners, FAQs, both FAQ filter collections, Services (No Pages), Orbit, Team, Jobs) |

Problems: the same idea has four names (SEO / SEO Settings, Filters &
Sorts / Filters, Meta Datas, Main Content / Content / General); group order
differs per collection; only 3 group descriptions exist; two "do not use"
groups disagree with reality; the "where is this used" knowledge lives
only in people's heads.

## Proposed standard (template-candidate)

One fixed set of groups, always in this order, each with a description
that says **where the fields show up**. Only the groups a collection needs.

| # | Group | Holds | Description pattern |
|---|---|---|---|
| 1 | **Card** | What a list shows: card title, excerpt, thumbnail, cover | "Shown in lists on: /insights, nav, …" |
| 2 | **Page · <Section>** | One group per template section, in page order (Page · Hero, Page · Process, …) | "Template section <component name>" |
| 3 | **Relations & Filters** | References, multi-references, sort order, Switch/Option fields lists filter on | "Decides which lists show this item and in what order: …" |
| 4 | **SEO & Sharing** | Meta title, meta description, OG image | "Page settings of the template" |
| 5 | **Settings** | Overrides and internal flags (e.g. custom URL) | what each overrides |
| 6 | **Deprecated · remove after YYYY-MM-DD** | Fields waiting for deletion | why, and what replaced it |

Rules that go with it:

- A field that nothing reads goes to **Deprecated** the day that's found,
  never into a vague "Old" group.
- A field in **Card** or **Relations & Filters** gets help text naming the
  list(s) that use it (e.g. Posts `featured`: "On = shown only in Featured
  Articles, hidden from /insights").
- Group names never carry the collection name; the same name means the
  same thing in every collection.

Applied to brandvm, e.g. **Posts**: Card (`post-thubmnail`, `description`)
· Page · Article (`post-content`, `date---published`, `date---updated`)
· Relations & Filters (`category`, `post-author`, `related-articles`,
`featured`) · Deprecated (`minutes-to-read`, unless it gets displayed).
**Services ×4**: Card (`cover-image`) · Page · Hero / Services / Process /
Work / Industries / Stats (/ Advantage) · Relations & Filters
(`selected-works`) · SEO & Sharing · Deprecated (`dropdown-*`, and the
unused `step-*` / `advantage-*` if not wired).

## Applied 2026-10-20: field groups

The standard above is now live in the CMS editor on 19 collections (the two
FAQ filter collections hold only Name/Slug, which can't be grouped). Only
groups changed: no field, item, page or binding was touched, and nothing
needs publishing.

- Spec, by field slug: `docs/cms/field-groups.json`.
- Previous groups, with field ids: `docs/cms/field-groups-backup-2026-10-20.json`.
  To roll back a collection, send its `collectionFieldGroups` back with
  `update_collection_field_groups`.
- "Deprecated · review by 2026-11-20" holds the 42 unused fields (28
  filled, 14 empty; Industries tabs 7–8 stay in Page · Services because
  they're bound). Nothing is deleted; decide per field by that date.
- Field help text (e.g. on Posts `featured`) wasn't changed; the group
  descriptions carry that information for now.

## Templatizing it in wf-template (proposal, not done)

The template (`conventions.md` §11 CMS) has no rules on field groups or
field naming today. Proposed, as a later template batch:

1. **`conventions.md` §11**: the group standard and rules above.
2. **A spec file per project**, e.g. `docs/cms/field-groups.json`:
   `{ "<collection slug>": [ { "group": "Card", "description": "…",
   "fields": ["slug-a", "slug-b"] } ] }`, written by slug so it survives
   between sites. An agent applies it with `update_collection_field_groups`
   (maps slugs → field ids, replaces the full group list, so a re-run is
   safe).
3. **Starter presets** for the collections most sites have (Posts,
   Authors, Categories, Case Studies, Team, FAQs, Jobs): recommended fields
   plus their groups, used when planning collections (§11 already says
   "plan the collections before the template page is built").
4. **webflow-audit skill**: this field-usage method, including the MCP
   blind spots above, so the next audit doesn't rediscover them. Logged in
   `GOTCHAS.md` as template-candidate.

Steps 1–3 need the template workspace's own process (plan shown first,
nothing client-specific, a tagged release).
