# CMS field usage: per-field table

Generated 2026-10-20 from the Designer binding scan, page settings, page custom code and 66 live pages. See `2026-10-20-cms-field-usage.md` for method and findings.

Verdicts: **USED** · **UNUSED** (filled, but nothing on the site reads it) · **UNUSED + EMPTY** · **BOUND BUT EMPTY** (bound in the Designer, no content) · core = Name/Slug.

## Posts

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `description` | PlainText | 1769/1771 | USED | Meta Datas | insights: Paragraph.text; page settings (SEO/OG) |
| `date---published` | DateTime | 1771/1771 | USED | Filters & Sorts | T:Authors: Block.text; T:Authors: list (filter/sort, slug) |
| `date---updated` | DateTime | 1729/1771 | USED | Filters & Sorts | T:Posts: DOM.text |
| `post-thubmnail` | Image | 1093/1771 | USED | Main Content | T:Posts: Image.assetId; component S / Insights CTA: list (filter/sort, slug) |
| `post-content` | RichText | 1771/1771 | USED | Main Content | T:Posts: RichText.richText |
| `post-author` | Reference | 809/1771 | USED | Meta Datas | T:Authors: DOM.text; T:Categories: DOM.text |
| `category` | Reference | 1485/1771 | USED | Filters & Sorts | T:Authors: Block.text; T:Authors: list (filter/sort, slug) |
| `minutes-to-read` | Number | 1704/1771 | **UNUSED** | Meta Datas | filled on 1,704 posts, shown nowhere |
| `related-articles` | MultiReference | 539/1771 | USED | Meta Datas | live HTML |
| `featured` | Switch | 707/1771 | USED | DO NOT USE | filters 3 lists (Insights, Featured Articles, nav); group says "DO NOT USE" |
| `name` | PlainText | 1771/1771 | core | – | T:Authors: Paragraph.text; T:Categories: Paragraph.text |
| `slug` | PlainText | 1771/1771 | core | – |  |

## Authors

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `role-position` | PlainText | 9/9 | USED | – | T:Authors: DOM.text; T:Posts: DOM.text |
| `linkedin-profile` | Link | 2/9 | USED | – | live HTML |
| `avatar` | Image | 7/9 | USED | – | T:Authors: Image.assetId; T:Posts: Image.assetId |
| `bio` | RichText | 9/9 | USED | – | T:Authors: RichText.richText; T:Posts: RichText.richText |
| `company` | PlainText | 9/9 | USED | – | T:Authors: DOM.text; T:Posts: DOM.text |
| `name` | PlainText | 9/9 | core | – | T:Authors: Block.text; T:Authors: DOM.text |
| `slug` | PlainText | 9/9 | core | – |  |

## Categories

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `cover-image-tiny-size` | Image | 6/8 | USED | – | page settings (SEO/OG) |
| `meta-title` | PlainText | 8/8 | USED | – | page settings (SEO/OG) |
| `meta-description` | PlainText | 8/8 | USED | – | page settings (SEO/OG) |
| `name` | PlainText | 8/8 | core | – | T:Authors: Block.text; T:Categories: DOM.text |
| `slug` | PlainText | 8/8 | core | – |  |

## Badges - No Live Pages

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `badge` | Image | 9/9 | USED | – | live HTML |
| `badge-for-dark-background` | Image | 9/9 | USED | – | live HTML |
| `name` | PlainText | 9/9 | core | – |  |
| `slug` | PlainText | 9/9 | core | – |  |

## Partners - No Live Pages

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `logo` | Image | 30/30 | USED | – | insights-contact: Image.assetId |
| `sort-order` | Number | 25/30 | **UNUSED** | – | every Partners list is curated or unsorted |
| `name` | PlainText | 30/30 | core | – | insights-contact: Image.altText |
| `slug` | PlainText | 30/30 | core | – |  |

## FAQs • Pages - Filters

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `name` | PlainText | 23/23 | core | – |  |
| `slug` | PlainText | 23/23 | core | – |  |

## FAQs

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `sort-order` | Number | 743/743 | USED | – | T:Industries: S / FAQs.Sort (filter/sort, slug); T:SvcWeb: S / FAQs.Sort (filter/sort, slug) |
| `category` | MultiReference | 743/743 | USED | – | faq: list (filter/sort, slug) |
| `for-pages` | MultiReference | 335/743 | USED | – | branding: S / FAQs.Filters (filter/sort, slug); canada: S / FAQs.Filters (filter/sort, slug) |
| `answer` | RichText | 743/743 | USED | – | faq: RichText.richText |
| `industry` | Reference | 132/743 | USED | – | live HTML |
| `web-design-service` | Reference | 60/743 | USED | – | live HTML |
| `branding-service` | Reference | 84/743 | USED | – | live HTML |
| `ui-ux-service` | Reference | 36/743 | USED | – | live HTML |
| `seo-service` | Reference | 96/743 | USED | – | live HTML |
| `name` | PlainText | 743/743 | core | – | faq: Block.text |
| `slug` | PlainText | 743/743 | core | – |  |

## Case Studies

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `new-case-study-cover----case-study` | Image | 0/128 | **UNUSED + EMPTY** | Old [Do Not Use/Edit] |  |
| `tagline` | PlainText | 120/128 | USED | General | T:CaseStudies: Heading.text; T:Industries: Image.altText |
| `new-preview-description----shared` | PlainText | 0/128 | **UNUSED + EMPTY** | Old [Do Not Use/Edit] |  |
| `new-date-of-completion----shared` | DateTime | 117/128 | USED | Filters & Sorts | T:CaseStudies: list (filter/sort, slug); about: list (filter/sort, slug) |
| `new-live-website-link----shared` | Link | 88/128 | USED | General | T:CaseStudies: C / Button.Link; T:CaseStudies: prop C / Button.Link |
| `featured-shot----work` | Image | 0/128 | **UNUSED + EMPTY** | Old [Do Not Use/Edit] |  |
| `sort-order` | Number | 120/128 | USED | Filters & Sorts | branding: S / Projects.Filters (filter/sort, slug); branding: S / Projects.Sort (filter/sort, slug) |
| `home-feature-cover` | Image | 0/128 | **UNUSED + EMPTY** | Old [Do Not Use/Edit] |  |
| `services` | MultiReference | 119/128 | USED | Filters & Sorts | live HTML |
| `project-title-byline-h1---3` | PlainText | 119/128 | **UNUSED** | Old [Do Not Use/Edit] | duplicates tagline/name on 117 of 119 items; not bound |
| `meta-title` | PlainText | 120/128 | USED | SEO | page settings (SEO/OG) |
| `meta-description` | PlainText | 120/128 | USED | SEO | page settings (SEO/OG) |
| `thumbnail---full` | Image | 114/128 | USED | General | T:CaseStudies: Image.assetId; our-work-portfolio: Image.assetId |
| `thumbnail---square` | Image | 114/128 | USED | General | T:CaseStudies: Image.assetId; T:Industries: Image.assetId |
| `content-visuals---after-client-intro` | RichText | 101/128 | USED | Project Visuals | T:CaseStudies: RichText.richText |
| `content-visuals---after-project-highlight` | RichText | 100/128 | USED | Project Visuals | T:CaseStudies: RichText.richText |
| `content-visuals---after-project-challenges` | RichText | 100/128 | USED | Project Visuals | T:CaseStudies: RichText.richText |
| `content-visuals---after-project-approach` | RichText | 101/128 | USED | Project Visuals | T:CaseStudies: RichText.richText |
| `project-challenges` | RichText | 82/128 | USED | Project Information | T:CaseStudies: H / C Drop.Content; T:CaseStudies: prop H / C Drop.Content |
| `project-highlights` | RichText | 82/128 | USED | Project Information | T:CaseStudies: H / C Drop.Content; T:CaseStudies: prop H / C Drop.Content |
| `project-approach` | RichText | 82/128 | USED | Project Information | T:CaseStudies: H / C Drop.Content; T:CaseStudies: prop H / C Drop.Content |
| `project-duration` | PlainText | 76/128 | USED | General | T:CaseStudies: Block.text |
| `client-logo` | Image | 26/128 | USED | Client Information | T:CaseStudies: Image.assetId |
| `client-intro---title` | RichText | 119/128 | USED | Client Information | T:CaseStudies: C / Section Header.Paragraph; T:CaseStudies: prop C / Section Header.Paragraph |
| `client-intro---paragraph` | RichText | 106/128 | USED | Client Information | T:CaseStudies: C / Section Header.Headline; T:CaseStudies: prop C / Section Header.Headline |
| `industry-s` | MultiReference | 111/128 | USED | Filters & Sorts | live HTML |
| `platform-s-used` | MultiReference | 99/128 | USED | Filters & Sorts | live HTML |
| `project-deliverables` | PlainText | 119/128 | **UNUSED** | General | filled 119/128, not rendered on case study pages |
| `project-outcomes` | RichText | 82/128 | USED | Project Information | T:CaseStudies: H / C Drop.Content; T:CaseStudies: prop H / C Drop.Content |
| `thumbnail-video-link-mp4` | Link | 3/128 | USED | Videos | T:CaseStudies: DOM.attributes[src].value; our-work-portfolio: DOM.attributes[src] |
| `thumbnail-video-link-webm` | Link | 3/128 | USED | Videos | T:CaseStudies: DOM.attributes[src].value; our-work-portfolio: DOM.attributes[src] |
| `work-section-video-link-mp4` | Link | 2/128 | USED | Videos | live HTML |
| `work-section-video-link-webm` | Link | 2/128 | USED | Videos | live HTML |
| `name` | PlainText | 128/128 | core | – | T:CaseStudies: Block.text; T:CaseStudies: Image.altText |
| `slug` | PlainText | 128/128 | core | – |  |

## Services - No Live Pages

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `sort-order` | Number | 9/9 | USED | – | our-work-portfolio: list (filter/sort, slug); services: list (filter/sort, slug) |
| `link-to-services` | Link | 9/9 | USED | – | T:CaseStudies: DOM.attributes[href].value; T:CaseStudies: Link.link |
| `services-icon` | Image | 8/9 | USED | – | services: Image.assetId |
| `name` | PlainText | 9/9 | core | – | T:CaseStudies: Block.text; T:CaseStudies: DOM.attributes[aria-label].value |
| `slug` | PlainText | 9/9 | core | – |  |

## FAQ Cat. - Filters

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `name` | PlainText | 11/11 | core | – |  |
| `slug` | PlainText | 11/11 | core | – |  |

## Services • Web Designs

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `dropdown-images` | Image | 0/5 | **UNUSED + EMPTY** | Services Hub Page |  |
| `dropdown-content` | RichText | 0/5 | **UNUSED + EMPTY** | Services Hub Page |  |
| `meta-title` | PlainText | 5/5 | USED | SEO Settings | page settings (SEO/OG) |
| `cover-image` | Image | 5/5 | USED | Global & Required | T:SvcWeb: S / Service Hero.Background Image; T:SvcWeb: S / Service Hero.Background Image (Mobile) |
| `meta-description` | PlainText | 5/5 | USED | SEO Settings | page settings (SEO/OG) |
| `h1` | RichText | 5/5 | USED | Hero | T:SvcWeb: S / Service Hero.Headline; T:SvcWeb: prop S / Service Hero.Headline |
| `paragraph-1` | RichText | 5/5 | USED | Hero | T:SvcWeb: S / Service Hero.Main Paragraph; T:SvcWeb: prop S / Service Hero.Main Paragraph |
| `paragraph-2` | RichText | 5/5 | USED | Hero | T:SvcWeb: S / Service Hero.Second Paragraph; T:SvcWeb: prop S / Service Hero.Second Paragraph |
| `services-title` | RichText | 5/5 | USED | Services | live HTML |
| `services-sub-title` | RichText | 5/5 | USED | Services | live HTML |
| `process-title` | RichText | 5/5 | USED | Process | live HTML |
| `process-sub-title` | RichText | 5/5 | USED | Process | live HTML |
| `work-title` | RichText | 5/5 | USED | Work | live HTML |
| `work-sub-title` | RichText | 5/5 | USED | Work | live HTML |
| `industries-title` | RichText | 5/5 | USED | Industries | T:SvcWeb: S / Industries.Headline; T:SvcWeb: prop S / Industries.Headline |
| `industries-sub-title` | RichText | 5/5 | USED | Industries | T:SvcWeb: S / Industries.Paragraph; T:SvcWeb: prop S / Industries.Paragraph |
| `num-1` | Number | 5/5 | USED | Stats | T:SvcWeb: S / Why Choose.Stats 1 - Count To; T:SvcWeb: prop S / Why Choose.Stats 1 - Count To |
| `suffix-1` | PlainText | 5/5 | USED | Stats | T:SvcWeb: S / Why Choose.Stats 1 - Suffix (+,%); T:SvcWeb: prop S / Why Choose.Stats 1 - Suffix (+,%) |
| `label-1` | PlainText | 5/5 | USED | Stats | T:SvcWeb: S / Why Choose.Stats 1 - Label; T:SvcWeb: prop S / Why Choose.Stats 1 - Label |
| `num-2` | Number | 5/5 | USED | Stats | T:SvcWeb: S / Why Choose.Stats 2 - Count To; T:SvcWeb: prop S / Why Choose.Stats 2 - Count To |
| `suffix-2` | PlainText | 5/5 | USED | Stats | T:SvcWeb: S / Why Choose.Stats 2 - Suffix (+,%); T:SvcWeb: prop S / Why Choose.Stats 2 - Suffix (+,%) |
| `label-2` | PlainText | 5/5 | USED | Stats | T:SvcWeb: S / Why Choose.Stats 2 - Label; T:SvcWeb: prop S / Why Choose.Stats 2 - Label |
| `num-3` | Number | 5/5 | USED | Stats | T:SvcWeb: S / Why Choose.Stats 3 - Count To; T:SvcWeb: prop S / Why Choose.Stats 3 - Count To |
| `suffix-3` | PlainText | 5/5 | USED | Stats | T:SvcWeb: S / Why Choose.Stats 3 - Suffix (+,%); T:SvcWeb: prop S / Why Choose.Stats 3 - Suffix (+,%) |
| `label-3` | PlainText | 5/5 | USED | Stats | T:SvcWeb: S / Why Choose.Stats 3 - Label; T:SvcWeb: prop S / Why Choose.Stats 3 - Label |
| `step-title-1` | PlainText | 5/5 | **UNUSED** | Process | template shows static "Discover / Design / Development…" instead |
| `step-description-1` | RichText | 5/5 | USED | Process | live HTML |
| `step-title-2` | PlainText | 5/5 | **UNUSED** | Process |  |
| `step-description-2` | RichText | 5/5 | USED | Process | live HTML |
| `step-title-3` | PlainText | 5/5 | **UNUSED** | Process |  |
| `step-description-3` | RichText | 5/5 | USED | Process | live HTML |
| `step-title-4` | PlainText | 5/5 | **UNUSED** | Process |  |
| `step-description-4` | RichText | 5/5 | USED | Process | live HTML |
| `selected-works` | MultiReference | 5/5 | USED | Work | live HTML |
| `name` | PlainText | 5/5 | core | – | T:SvcWeb: S / Service Hero.Label; T:SvcWeb: prop S / Service Hero.Label |
| `slug` | PlainText | 5/5 | core | – |  |

## Platforms - No Live Pages

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `image` | Image | 9/17 | USED | Services Hub Page | services: Image.assetId; web-design: Image.assetId |
| `page-link` | Link | 4/17 | USED | – | services: Link.link; web-design: Link.link |
| `description` | PlainText | 7/17 | USED | – | web-design: Block.text; web-development: Block.text |
| `name` | PlainText | 17/17 | core | – | T:CaseStudies: DOM.attributes[aria-label].value; T:CaseStudies: DOM.attributes[title].value |
| `slug` | PlainText | 17/17 | core | – |  |

## Industries

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `card-title` | RichText | 12/12 | USED | Card | industries: C / Industry Card.Headline; industries: prop C / Industry Card.Headline |
| `card-decription` | RichText | 12/12 | USED | Card | industries: C / Industry Card.Text; industries: prop C / Industry Card.Text |
| `card-cover` | Image | 12/12 | USED | Card | industries: C / Industry Card.Cover; industries: Image.assetId |
| `h1` | RichText | 11/12 | USED | Hero | T:Industries: S / Service Hero.Headline; T:Industries: prop S / Service Hero.Headline |
| `paragraph-1` | RichText | 11/12 | USED | Hero | T:Industries: S / Service Hero.Main Paragraph; T:Industries: prop S / Service Hero.Main Paragraph |
| `paragraph-2` | RichText | 11/12 | USED | Hero | T:Industries: S / Service Hero.Second Paragraph; T:Industries: prop S / Service Hero.Second Paragraph |
| `services-header-sub-title` | RichText | 11/12 | USED | Services | T:Industries: C / Section Header.Paragraph; T:Industries: prop C / Section Header.Paragraph |
| `case-studies-header-title` | RichText | 11/12 | USED | Case Studies | T:Industries: C / Section Header.Headline; T:Industries: prop C / Section Header.Headline |
| `case-studies-header-sub-title` | RichText | 11/12 | USED | Case Studies | T:Industries: C / Section Header.Paragraph; T:Industries: prop C / Section Header.Paragraph |
| `tab-title-1` | RichText | 11/12 | USED | Tab Services | T:Industries: C / Service Card.Headline; T:Industries: prop C / Service Card.Headline |
| `tab-sub-title-1` | RichText | 11/12 | USED | Tab Services | T:Industries: C / Service Card.Paragraph; T:Industries: prop C / Service Card.Paragraph |
| `tab-image-1` | Image | 11/12 | USED | Tab Services | T:Industries: C / Service Card.Background; T:Industries: prop C / Service Card.Background |
| `tab-title-2` | RichText | 11/12 | USED | Tab Services | T:Industries: C / Service Card.Headline; T:Industries: prop C / Service Card.Headline |
| `tab-sub-title-2` | RichText | 11/12 | USED | Tab Services | T:Industries: C / Service Card.Paragraph; T:Industries: prop C / Service Card.Paragraph |
| `tab-image-2` | Image | 11/12 | USED | Tab Services | T:Industries: C / Service Card.Background; T:Industries: prop C / Service Card.Background |
| `tab-title-3` | RichText | 11/12 | USED | Tab Services | T:Industries: C / Service Card.Headline; T:Industries: prop C / Service Card.Headline |
| `tab-sub-title-3` | RichText | 11/12 | USED | Tab Services | T:Industries: C / Service Card.Paragraph; T:Industries: prop C / Service Card.Paragraph |
| `tab-image-3` | Image | 11/12 | USED | Tab Services | T:Industries: C / Service Card.Background; T:Industries: prop C / Service Card.Background |
| `tab-title-4` | RichText | 11/12 | USED | Tab Services | T:Industries: C / Service Card.Headline; T:Industries: prop C / Service Card.Headline |
| `tab-sub-title-4` | RichText | 11/12 | USED | Tab Services | T:Industries: C / Service Card.Paragraph; T:Industries: prop C / Service Card.Paragraph |
| `tab-image-4` | Image | 11/12 | USED | Tab Services | T:Industries: C / Service Card.Background; T:Industries: prop C / Service Card.Background |
| `tab-title-5` | RichText | 11/12 | USED | Tab Services | T:Industries: C / Service Card.Headline; T:Industries: prop C / Service Card.Headline |
| `tab-sub-title-5` | RichText | 11/12 | USED | Tab Services | T:Industries: C / Service Card.Paragraph; T:Industries: prop C / Service Card.Paragraph |
| `tab-image-5` | Image | 11/12 | USED | Tab Services | T:Industries: C / Service Card.Background; T:Industries: prop C / Service Card.Background |
| `tab-title-6` | RichText | 5/12 | USED | Tab Services | T:Industries: C / Service Card.Headline; T:Industries: prop C / Service Card.Headline |
| `tab-sub-title-6` | RichText | 5/12 | USED | Tab Services | T:Industries: C / Service Card.Paragraph; T:Industries: prop C / Service Card.Paragraph |
| `tab-image-6` | Image | 5/12 | USED | Tab Services | T:Industries: C / Service Card.Background; T:Industries: prop C / Service Card.Background |
| `tab-title-7` | RichText | 0/12 | **BOUND BUT EMPTY** | Tab Services | T:Industries: C / Service Card.Headline; T:Industries: prop C / Service Card.Headline |
| `tab-sub-title-7` | RichText | 0/12 | **BOUND BUT EMPTY** | Tab Services | T:Industries: C / Service Card.Paragraph; T:Industries: prop C / Service Card.Paragraph |
| `tab-image-7` | Image | 0/12 | **BOUND BUT EMPTY** | Tab Services | T:Industries: C / Service Card.Background; T:Industries: prop C / Service Card.Background |
| `tab-title-8` | RichText | 0/12 | **BOUND BUT EMPTY** | Tab Services | T:Industries: C / Service Card.Headline; T:Industries: prop C / Service Card.Headline |
| `tab-sub-title-8` | RichText | 0/12 | **BOUND BUT EMPTY** | Tab Services | T:Industries: C / Service Card.Paragraph; T:Industries: prop C / Service Card.Paragraph |
| `tab-image-8` | Image | 0/12 | **BOUND BUT EMPTY** | Tab Services | T:Industries: C / Service Card.Background; T:Industries: prop C / Service Card.Background |
| `advantage-header-title` | RichText | 11/12 | USED | Advantage | T:Industries: C / Section Header.Headline; T:Industries: prop C / Section Header.Headline |
| `advantage-header-sub-title` | RichText | 11/12 | USED | Advantage | T:Industries: C / Section Header.Paragraph; T:Industries: prop C / Section Header.Paragraph |
| `advantage-background-image` | Image | 11/12 | USED | Advantage | T:Industries: Image.assetId |
| `advantage-card-title-1` | RichText | 11/12 | USED | Advantage | T:Industries: C / Heading.Headline; T:Industries: prop C / Heading.Headline |
| `advantage-card-sub-title-1` | RichText | 11/12 | USED | Advantage | T:Industries: C / Paragraph.Text; T:Industries: prop C / Paragraph.Text |
| `advantage-card-tag-1` | PlainText | 11/12 | USED | Advantage | T:Industries: Block.text |
| `advantage-card-title-2` | RichText | 11/12 | USED | Advantage | T:Industries: C / Heading.Headline; T:Industries: prop C / Heading.Headline |
| `advantage-card-sub-title-2` | RichText | 11/12 | USED | Advantage | T:Industries: C / Paragraph.Text; T:Industries: prop C / Paragraph.Text |
| `advantage-card-tag-2` | PlainText | 11/12 | USED | Advantage | T:Industries: Block.text |
| `advantage-card-title-3` | RichText | 11/12 | USED | Advantage | T:Industries: C / Heading.Headline; T:Industries: prop C / Heading.Headline |
| `advantage-card-sub-title-3` | RichText | 11/12 | USED | Advantage | T:Industries: C / Paragraph.Text; T:Industries: prop C / Paragraph.Text |
| `advantage-card-tag-3` | PlainText | 11/12 | USED | Advantage | T:Industries: Block.text |
| `hero-image` | Image | 12/12 | USED | Hero | T:Industries: S / Service Hero.Background Image; T:Industries: S / Service Hero.Background Image (Mobile) |
| `tab-label-1` | PlainText | 11/12 | USED | Tab Services | T:Industries: Block.text |
| `tab-label-2` | PlainText | 11/12 | USED | Tab Services | T:Industries: Block.text |
| `tab-label-3` | PlainText | 11/12 | USED | Tab Services | T:Industries: Block.text |
| `tab-label-4` | PlainText | 11/12 | USED | Tab Services | T:Industries: Block.text |
| `tab-label-5` | PlainText | 11/12 | USED | Tab Services | T:Industries: Block.text |
| `tab-label-6` | PlainText | 5/12 | USED | Tab Services | T:Industries: Block.text |
| `tab-label-7` | PlainText | 0/12 | **BOUND BUT EMPTY** | Tab Services | T:Industries: Block.text |
| `tab-label-8` | PlainText | 0/12 | **BOUND BUT EMPTY** | Tab Services | T:Industries: Block.text |
| `industry-link-if-different-from-default-cms-page` | Link | 12/12 | USED | – | T:CaseStudies: DOM.attributes[href].value; industries: C / Industry Card.Link |
| `selected-work` | MultiReference | 12/12 | USED | Case Studies | live HTML |
| `meta-title` | PlainText | 12/12 | USED | SEO | page settings (SEO/OG) |
| `meta-description` | PlainText | 12/12 | USED | SEO | page settings (SEO/OG) |
| `service-header-bubble-image` | Image | 12/12 | USED | Services | T:Industries: C / Heading With Image.Image; T:Industries: prop C / Heading With Image.Image |
| `name` | PlainText | 12/12 | core | – | T:CaseStudies: DOM.attributes[aria-label].value; T:CaseStudies: DOM.attributes[title].value |
| `slug` | PlainText | 12/12 | core | – |  |

## Services • Branding

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `dropdown-images` | Image | 0/7 | **UNUSED + EMPTY** | Services Hub Page |  |
| `dropdown-content` | RichText | 0/7 | **UNUSED + EMPTY** | Services Hub Page |  |
| `cover-image` | Image | 7/7 | USED | Global & Required | T:SvcBranding: prop S / Service Hero.Background Image; T:SvcBranding: prop S / Service Hero.Background Image (Mobile) |
| `meta-title` | PlainText | 7/7 | USED | SEO Settings | page settings (SEO/OG) |
| `meta-description` | PlainText | 7/7 | USED | SEO Settings | page settings (SEO/OG) |
| `h1` | RichText | 7/7 | USED | Hero | T:SvcBranding: prop S / Service Hero.Headline |
| `paragraph-1` | RichText | 7/7 | USED | Hero | T:SvcBranding: prop S / Service Hero.Main Paragraph |
| `paragraph-2` | RichText | 7/7 | USED | Hero | T:SvcBranding: prop S / Service Hero.Second Paragraph |
| `services-title` | RichText | 7/7 | USED | Services | live HTML |
| `services-sub-title` | RichText | 7/7 | USED | Services | live HTML |
| `process-title` | RichText | 7/7 | USED | Process | live HTML |
| `process-sub-title` | RichText | 7/7 | USED | Process | live HTML |
| `step-title-1` | PlainText | 7/7 | USED | Process | live HTML |
| `step-description-1` | RichText | 7/7 | USED | Process | live HTML |
| `step-title-2` | PlainText | 7/7 | USED | Process | live HTML |
| `step-description-2` | RichText | 7/7 | USED | Process | live HTML |
| `step-title-3` | PlainText | 7/7 | USED | Process | live HTML |
| `step-description-3` | RichText | 7/7 | USED | Process | live HTML |
| `step-title-4` | PlainText | 7/7 | USED | Process | live HTML |
| `step-description-4` | RichText | 7/7 | USED | Process | live HTML |
| `work-title` | RichText | 7/7 | USED | Work | live HTML |
| `work-sub-title` | RichText | 7/7 | USED | Work | live HTML |
| `industries-title` | RichText | 7/7 | USED | Industries | T:SvcBranding: prop S / Industries.Headline |
| `industries-sub-title` | RichText | 7/7 | USED | Industries | T:SvcBranding: prop S / Industries.Paragraph |
| `num-1` | Number | 7/7 | USED | Stats | T:SvcBranding: prop S / Why Choose.Stats 1 - Count To |
| `suffix-1` | PlainText | 7/7 | USED | Stats | T:SvcBranding: prop S / Why Choose.Stats 1 - Suffix (+,%) |
| `label-1` | PlainText | 7/7 | USED | Stats | T:SvcBranding: prop S / Why Choose.Stats 1 - Label |
| `num-2` | Number | 7/7 | USED | Stats | T:SvcBranding: prop S / Why Choose.Stats 2 - Count To |
| `suffix-2` | PlainText | 7/7 | USED | Stats | T:SvcBranding: prop S / Why Choose.Stats 2 - Suffix (+,%) |
| `label-2` | PlainText | 7/7 | USED | Stats | T:SvcBranding: prop S / Why Choose.Stats 2 - Label |
| `num-3` | Number | 7/7 | USED | Stats | T:SvcBranding: prop S / Why Choose.Stats 3 - Count To |
| `suffix-3` | PlainText | 7/7 | USED | Stats | T:SvcBranding: prop S / Why Choose.Stats 3 - Suffix (+,%) |
| `label-3` | PlainText | 7/7 | USED | Stats | T:SvcBranding: prop S / Why Choose.Stats 3 - Label |
| `selected-works` | MultiReference | 7/7 | USED | Work | live HTML |
| `name` | PlainText | 7/7 | core | – | T:SvcBranding: prop S / Service Hero.Label; sitemap: Block.text |
| `slug` | PlainText | 7/7 | core | – |  |

## Services • UI/UX

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `dropdown-images` | Image | 0/3 | **UNUSED + EMPTY** | Services Hub Page |  |
| `dropdown-content` | RichText | 0/3 | **UNUSED + EMPTY** | Services Hub Page |  |
| `cover-image` | Image | 3/3 | USED | Global & Required | T:SvcUIUX: prop S / Service Hero.Background Image; T:SvcUIUX: prop S / Service Hero.Background Image (Mobile) |
| `meta-title` | PlainText | 3/3 | USED | SEO Settings | page settings (SEO/OG) |
| `meta-description` | PlainText | 3/3 | USED | SEO Settings | page settings (SEO/OG) |
| `h1` | RichText | 3/3 | USED | Hero | T:SvcUIUX: prop S / Service Hero.Headline |
| `paragraph-1` | RichText | 3/3 | USED | Hero | T:SvcUIUX: prop S / Service Hero.Main Paragraph |
| `paragraph-2` | RichText | 3/3 | USED | Hero | T:SvcUIUX: prop S / Service Hero.Second Paragraph |
| `services-title` | RichText | 3/3 | USED | Services | live HTML |
| `services-sub-title` | RichText | 3/3 | USED | Services | live HTML |
| `process-title` | RichText | 3/3 | USED | Process | live HTML |
| `process-sub-title` | RichText | 3/3 | USED | Process | live HTML |
| `step-title-1` | PlainText | 3/3 | **UNUSED** | Process | template shows static process copy instead |
| `step-description-1` | RichText | 3/3 | **UNUSED** | Process |  |
| `step-title-2` | PlainText | 3/3 | **UNUSED** | Process |  |
| `step-description-2` | RichText | 3/3 | **UNUSED** | Process |  |
| `step-title-3` | PlainText | 3/3 | **UNUSED** | Process |  |
| `step-description-3` | RichText | 3/3 | **UNUSED** | Process |  |
| `step-title-4` | PlainText | 3/3 | **UNUSED** | Process |  |
| `step-description-4` | RichText | 3/3 | **UNUSED** | Process |  |
| `work-title` | RichText | 3/3 | USED | Work | live HTML |
| `work-sub-title` | RichText | 3/3 | USED | Work | live HTML |
| `industries-title` | RichText | 2/3 | USED | Industries | T:SvcUIUX: prop S / Industries.Headline |
| `industries-sub-title` | RichText | 2/3 | USED | Industries | T:SvcUIUX: prop S / Industries.Paragraph |
| `num-1` | Number | 2/3 | USED | Stats | T:SvcUIUX: prop S / Why Choose.Stats 1 - Count To |
| `suffix-1` | PlainText | 2/3 | USED | Stats | T:SvcUIUX: prop S / Why Choose.Stats 1 - Suffix (+,%) |
| `label-1` | PlainText | 2/3 | USED | Stats | T:SvcUIUX: prop S / Why Choose.Stats 1 - Label |
| `num-2` | Number | 2/3 | USED | Stats | T:SvcUIUX: prop S / Why Choose.Stats 2 - Count To |
| `suffix-2` | PlainText | 2/3 | USED | Stats | T:SvcUIUX: prop S / Why Choose.Stats 2 - Suffix (+,%) |
| `label-2` | PlainText | 2/3 | USED | Stats | T:SvcUIUX: prop S / Why Choose.Stats 2 - Label |
| `num-3` | Number | 2/3 | USED | Stats | T:SvcUIUX: prop S / Why Choose.Stats 3 - Count To |
| `suffix-3` | PlainText | 2/3 | USED | Stats | T:SvcUIUX: prop S / Why Choose.Stats 3 - Suffix (+,%) |
| `label-3` | PlainText | 2/3 | USED | Stats | T:SvcUIUX: prop S / Why Choose.Stats 3 - Label |
| `selected-works` | MultiReference | 3/3 | USED | Work | live HTML |
| `name` | PlainText | 3/3 | core | – | T:SvcUIUX: prop S / Service Hero.Label; sitemap: Block.text |
| `slug` | PlainText | 3/3 | core | – |  |

## Services • SEO

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `dropdown-images` | Image | 0/8 | **UNUSED + EMPTY** | Services Hub Page |  |
| `dropdown-content` | RichText | 0/8 | **UNUSED + EMPTY** | Services Hub Page |  |
| `cover-image` | Image | 8/8 | USED | Global & Required | T:SvcSEO: prop S / Service Hero.Background Image; T:SvcSEO: prop S / Service Hero.Background Image (Mobile) |
| `meta-title` | PlainText | 8/8 | USED | SEO Settings | page settings (SEO/OG) |
| `meta-description` | PlainText | 8/8 | USED | SEO Settings | page settings (SEO/OG) |
| `advantage-header-title` | RichText | 8/8 | **UNUSED** | Advantage | all 12 advantage fields filled on 8/8 items, no section renders them |
| `advantage-header-sub-title` | RichText | 8/8 | **UNUSED** | Advantage |  |
| `advantage-background-image` | Image | 8/8 | **UNUSED** | Advantage |  |
| `advantage-card-title-1` | RichText | 8/8 | **UNUSED** | Advantage |  |
| `advantage-card-sub-title-1` | RichText | 8/8 | **UNUSED** | Advantage |  |
| `advantage-card-tag-1` | PlainText | 8/8 | **UNUSED** | Advantage |  |
| `advantage-card-title-2` | RichText | 8/8 | **UNUSED** | Advantage |  |
| `advantage-card-sub-title-2` | RichText | 8/8 | **UNUSED** | Advantage |  |
| `advantage-card-tag-2` | PlainText | 8/8 | **UNUSED** | Advantage |  |
| `advantage-card-title-3` | RichText | 8/8 | **UNUSED** | Advantage |  |
| `advantage-card-sub-title-3` | RichText | 8/8 | **UNUSED** | Advantage |  |
| `advantage-card-tag-3` | PlainText | 8/8 | **UNUSED** | Advantage |  |
| `h1` | RichText | 8/8 | USED | Hero | T:SvcSEO: prop S / Service Hero.Headline |
| `paragraph-1` | RichText | 8/8 | USED | Hero | T:SvcSEO: prop S / Service Hero.Main Paragraph |
| `paragraph-2` | RichText | 8/8 | USED | Hero | T:SvcSEO: prop S / Service Hero.Second Paragraph |
| `services-title` | RichText | 8/8 | USED | Services | live HTML |
| `services-sub-title` | RichText | 8/8 | USED | Services | live HTML |
| `process-title` | RichText | 8/8 | USED | Process | live HTML |
| `process-sub-title` | RichText | 8/8 | USED | Process | live HTML |
| `step-title-1` | PlainText | 8/8 | USED | Process | live HTML |
| `step-description-1` | RichText | 8/8 | USED | Process | live HTML |
| `step-title-2` | PlainText | 8/8 | USED | Process | live HTML |
| `step-description-2` | RichText | 8/8 | USED | Process | live HTML |
| `step-title-3` | PlainText | 8/8 | USED | Process | live HTML |
| `step-description-3` | RichText | 8/8 | USED | Process | live HTML |
| `step-title-4` | PlainText | 8/8 | USED | Process | live HTML |
| `step-description-4` | RichText | 8/8 | USED | Process | live HTML |
| `work-title` | RichText | 8/8 | USED | Work | live HTML |
| `work-sub-title` | RichText | 8/8 | USED | Work | live HTML |
| `industries-title` | RichText | 8/8 | USED | Industries | T:SvcSEO: prop S / Industries.Headline |
| `industries-sub-title` | RichText | 8/8 | USED | Industries | T:SvcSEO: prop S / Industries.Paragraph |
| `num-1` | Number | 8/8 | USED | Stats | T:SvcSEO: prop S / Why Choose.Stats 1 - Count To |
| `suffix-1` | PlainText | 8/8 | USED | Stats | T:SvcSEO: prop S / Why Choose.Stats 1 - Suffix (+,%) |
| `label-1` | PlainText | 8/8 | USED | Stats | T:SvcSEO: prop S / Why Choose.Stats 1 - Label |
| `num-2` | Number | 8/8 | USED | Stats | T:SvcSEO: prop S / Why Choose.Stats 2 - Count To |
| `suffix-2` | PlainText | 8/8 | USED | Stats | T:SvcSEO: prop S / Why Choose.Stats 2 - Suffix (+,%) |
| `label-2` | PlainText | 8/8 | USED | Stats | T:SvcSEO: prop S / Why Choose.Stats 2 - Label |
| `num-3` | Number | 8/8 | USED | Stats | T:SvcSEO: prop S / Why Choose.Stats 3 - Count To |
| `suffix-3` | PlainText | 8/8 | USED | Stats | T:SvcSEO: prop S / Why Choose.Stats 3 - Suffix (+,%) |
| `label-3` | PlainText | 8/8 | USED | Stats | T:SvcSEO: prop S / Why Choose.Stats 3 - Label |
| `selected-works` | MultiReference | 8/8 | USED | Work | live HTML |
| `name` | PlainText | 8/8 | core | – | T:SvcSEO: prop S / Service Hero.Label; sitemap: Block.text |
| `slug` | PlainText | 8/8 | core | – |  |

## Orbit Images

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `image` | Image | 11/11 | USED | – | about: Image.assetId |
| `order` | Number | 11/11 | USED | – | about: list (filter/sort, slug) |
| `height` | Option | 11/11 | USED | – | about: Block.text |
| `ratio` | Option | 11/11 | USED | – | about: Block.text |
| `name` | PlainText | 11/11 | core | – |  |
| `slug` | PlainText | 11/11 | core | – |  |

## Team

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `position` | PlainText | 16/16 | USED | – | about: Block.text |
| `photo` | Image | 16/16 | USED | – | live HTML |
| `order` | Number | 16/16 | USED | – | about: list (filter/sort, slug) |
| `name` | PlainText | 16/16 | core | – | about: Block.text |
| `slug` | PlainText | 16/16 | core | – |  |

## Jobs

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `job-type` | Option | 3/3 | USED | – | live HTML |
| `job-hours` | Option | 3/3 | USED | – | live HTML |
| `job-location` | PlainText | 3/3 | USED | – | live HTML |
| `job-description` | PlainText | 3/3 | USED | – | live HTML |
| `job-link` | Link | 3/3 | USED | – | live HTML |
| `name` | PlainText | 3/3 | core | – |  |
| `slug` | PlainText | 3/3 | core | – |  |

## Services • Tabs

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `title` | RichText | 128/128 | USED | Main Content | live HTML |
| `sub-title` | RichText | 128/128 | USED | Main Content | live HTML |
| `image` | Image | 84/128 | USED | Main Content | live HTML |
| `sort-order` | Number | 128/128 | USED | Main Content | live HTML |
| `service` | Reference | 30/128 | USED | Filters | live HTML |
| `service-branding` | Reference | 40/128 | USED | Filters | live HTML |
| `service-seo` | Reference | 44/128 | USED | Filters | live HTML |
| `service-ui-ux` | Reference | 14/128 | USED | Filters | live HTML |
| `button-link-if-any` | Link | 13/128 | USED | Main Content | live HTML |
| `tab-color-for-mobile` | PlainText | 0/128 | **UNUSED + EMPTY** | Main Content |  |
| `short-tab-label` | PlainText | 128/128 | USED | – | live HTML |
| `name` | PlainText | 128/128 | core | – |  |
| `slug` | PlainText | 128/128 | core | – |  |

## Services Accordions

| Field | Type | Filled | Verdict | Current group | Evidence / note |
|---|---|---|---|---|---|
| `dropdown-content` | RichText | 22/22 | USED | Content | services: RichText.richText |
| `button-label` | PlainText | 8/22 | USED | Button (Optional) | live HTML |
| `button-link` | Link | 22/22 | USED | Button (Optional) | services: C / Button.Link; services: prop C / Button.Link |
| `related-to-services` | Reference | 19/22 | USED | Filters & Sorts | services: list (filter/sort, slug) |
| `bubble-image-for-later` | Image | 0/22 | **UNUSED + EMPTY** | Content |  |
| `sort-order` | Number | 22/22 | USED | Filters & Sorts | services: list (filter/sort, slug) |
| `name` | PlainText | 22/22 | core | – | services: Block.text |
| `slug` | PlainText | 22/22 | core | – |  |
