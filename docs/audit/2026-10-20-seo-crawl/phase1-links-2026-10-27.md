# Phase 1: broken links in Posts rich text

Done **2026-10-27**: fixed and checked on staging (brandvm.webflow.io),
then published to www.brandvm.com the same day (see "Published to
production").
Decisions: D8 (no migration map; no clear live match → unlink, text kept)
and the approved `redirect-review.csv` for the two redirect chains.

## Scope and checks

- MCP `webflow-brandvm` lists one site: `68b9f0236581de795cba8ec2`
  (Brand Vision Marketing). The `.env` token used for the writes is a site
  token for the same site only (`/token/introspect`).
- The 44 distinct error URLs were re-checked live on 2026-10-27: all still
  4xx (43 × 404, 1 × 403).
- The 403 (a tweet embed pasted into an href on `/post/teslas-marketing-strategy`)
  is no longer in the CMS or on the live page: the post was rewritten
  since the crawl. Nothing to do.
- 65 links in 56 posts: the 63 remaining crawl links plus the
  two redirect-chain source links (item 2). **20 repointed, 45 unlinked** (plus one follow-up unlink, below: 66 links in 57 posts).
- Each post was re-read just before writing, only the planned `<a>` tags
  changed (visible text checked identical, re-read after the write), and
  `name`/`slug` were resent (GOTCHAS). Writes went to the staged item, then
  a site publish to the webflow.io subdomain only. All 56 staging pages
  checked afterwards; every new target returns 200.

## The draft value-proposition post

`/post/what-is-a-value-proposition-guide-and-top-examples` is a **draft** in
the CMS (since 2026-09-17) but still live from its 2026-09-15 publish. Its
CMS body is fixed, but drafts don't publish, so staging and live keep the
old version with the broken `branding` link.

Decision (Kajal, 2026-10-27): it stays a draft and should come off the site.
**Correction:** an earlier note here said Webflow removes it at the next
full publish. It does not: after two full staging publishes it still
returns 200 on brandvm.webflow.io. Taking it off needs an explicit
unpublish of the item.

Done 2026-10-27 (Kajal's go-ahead): the first unpublish was refused (409)
because the live `15-vision-mission-statement-examples` still listed it in
`related-articles`. So, in order: removed it from that post's
`related-articles` (3 → 2; old list in the backup and rollback files),
published that one post live (item publish, not a site publish; its only
pending change besides this was the "value proposition" unlink), then
unpublished the value-proposition item. The CMS item is kept, as a draft;
to bring it back, publish the item and restore the reference.

It stayed on www.brandvm.com and brandvm.com after the unpublish (the API
reported it not live and staging returned 404, but the custom domains kept
rendering it) until the full publish below: an item unpublish reaches the
custom domains only with the next publish to them.

Its one inbound body link, in `/post/15-vision-mission-statement-examples`
("value proposition"), was unlinked on staging the same day (row 66 of the
plan; backup and rollback entries as for the others). That post's live
version now has neither the link nor the card (checked on both sites). The crawl's other inlinks are list
pages, which update themselves.

## Published to production

2026-10-27 ~18:45 UTC, Kajal's go-ahead: full site publish to
www.brandvm.com, brandvm.com and the webflow.io subdomain (every staged
change on the site went with it). Checked at 18:49 UTC: the
value-proposition post returns 404 on all three hosts and is gone from
the sitemap; all 56 fixed posts return 200 on www with no old href left
and every repointed link present.

The redirects themselves (both chains, and the 130-row table) are Phase 2,
in Site settings → Publishing → 301 redirects.

## Rollback

- `docs/cms/posts-broken-links-rollback-2026-10-27.json`: per item, the
  anchor, the old href and the new href (`null` = unlinked).
- `docs/cms/posts-broken-links-backup-2026-10-27.jsonl`: the full original
  `post-content` of every changed post. To restore a post, PATCH it back
  (with `name` and `slug`) and publish.
- Script: `docs/cms/posts-broken-links.py` (test / apply / verify).
  Plan with every decision: `docs/cms/posts-broken-links-plan-2026-10-27.json`.

## Repointed (20)

| Post | Anchor | Old | New |
| --- | --- | --- | --- |
| google-ai-overviews-2026 | how to show up in AI search results | /post/how-to-show-up-in-ai-search-results | /post/ai-search-optimization-checklist |
| ai-app-builders-small-business-digital-foundation | improve your AI Visibility | /post/how-to-show-up-in-ai-search-results | /post/ai-visibility-brand-discovery-marketing-discipline |
| user-persona-template | designing for SEO with UX and UI essentials | /post/designing-seo-ux-ui-essentials | /post/the-intersection-of-ux-and-seo-why-your-website-design-matters-for-rankings |
| seo-2025-tips-tricks | PPC and SEO | /post/ppc-vs-seo-understanding | /post/ppc-vs-seo |
| small-business-web-design-guide | Webflow and WordPress comparison | /post/webflow-vs-wordpress-vs-wix-vs-squarespace | /post/webflow-vs-wordpress-vs-wix-vs-squarespace-seo-2025 |
| web-design-pricing-models-guide | website speed and ROI | /post/invest-website-speed-roi | /post/page-speed-mobile-conversion |
| buy-now-pay-later-bnpl-strategy | website speed ROI | /post/invest-website-speed-roi | /post/page-speed-mobile-conversion |
| immersive-experiential-branding-sensory-marketing | food and beverage marketing | /industry/food-beverage-marketing | /industry/food-and-beverage-marketing |
| godiva-rebrand-reinvention-2026 | food and beverage marketing | /industry/food-beverage-marketing | /industry/food-and-beverage-marketing |
| five-wellness-trends-shaping-marketing-2026 | food and beverage marketing | /industry/food-beverage-marketing | /industry/food-and-beverage-marketing |
| best-anti-ai-marketing-campaigns-2025 | food and beverage marketing | /industry/food-beverage-marketing | /industry/food-and-beverage-marketing |
| best-guerrilla-marketing-examples-ads | food and beverage marketing | /industry/food-beverage-marketing | /industry/food-and-beverage-marketing |
| web-development-vs-web-design-key-differences-and-how-they-collaborate | choosing a web designer | /post/choosing-a-web-designer | /post/how-to-choose-web-design-agency |
| is-digital-marketing-essential-for-your-plumbing-business | go through the portfolio of the web designer | /post/choosing-a-web-designer | /post/how-to-choose-web-design-agency |
| why-re-commerce-fastest-growing-model-high-value-goods | luxury branding | /post/luxury-branding | /post/luxury-brands-marketing |
| how-brand-storytelling-crosses-borders-using-streaming-creators-and-secure-tools-for-global-reach | storytelling | /post/how-to-write-brand-story-must-include | /post/brand-storytelling-narrative-framework |
| the-role-of-strategic-website-design-in-business-credibility | brand identity | /post/types-brand-identities-business-examples | /post/brand-identity-design-process |
| building-a-distinctive-brand-what-cash-home-buyers-in-portland-really-want | branding real estate agents | /post/branding-real-estate-agents | /post/real-estate-branding-guide |
| key-templates-for-effective-business-management | brand identity | /post/best-marketing-for-architecture-firms | /post/brand-identity-design-process |
| web-development-vs-web-design-key-differences-and-how-they-collaborate | web design trends | /post/2025-web-design-trends | /post/top-web-design-trends-in-2024 |

## Unlinked, text kept (45) — for Asheem

Possible links are suggestions only; none were applied. Six of these sit
in "related reading" lists of article titles (Rare Beauty, Microsoft): the
title now stands as plain text, where removing the line may read better.

| Post | Anchor | Old target | Possible link |
| --- | --- | --- | --- |
| what-is-local-seo-improve-seo | links from regionally significant sites | /post/link-building-2024 | /post/location-relevant-link-building-canada or /post/link-building-small-business-seo-compete-without-big-budget |
| brand-voice-playbook | branding terms | /post/most-important-branding-terms-examples |  |
| visual-identity-vs-brand-identity | the most important branding terms | /post/most-important-branding-terms-examples |  |
| the-2016-resurgence-trend-2026 | The Biggest Marketing Resurgences of 2025 | /post/biggest-marketing-resurgences-2025 | /post/rebranding-success-brands-comeback (anchor is a different title) |
| wireframe-vs-prototype-vs-mockup | The Importance of Low Fidelity Design in Web Design | /post/low-fidelity-design |  |
| influencer-marketing-guide | Creator brands | /post/most-successful-creator-brands-2025 | /post/celebrity-marketing-personal-branding? |
| from-brand-deals-to-real-brands-the-financial-stack-behind-creator-empires | Most Successful Creator Brands in 2025 | /post/most-successful-creator-brands-2025 |  |
| influencer-marketing-guide | TikTok for B2B | /post/tiktok-for-b2b-networking |  |
| lemme-marketing-strategy | Poosh marketing strategy | /post/poosh-marketing-strategy-wellness-blog |  |
| definition-answer-engine-optimization | high-quality content | /post/creating-content-2024 |  |
| seo-2025-tips-tricks | WordPress tools and plugins | /post/wordpress-plugins-2025 |  |
| how-ux-design-keeps-users-on-your-platform-longer | web design and UX performance | /post/mobile-ux-audit-fixes | /post/what-is-a-ux-audit? |
| buy-now-pay-later-bnpl-strategy | mobile UX audit | /post/mobile-ux-audit-fixes | /post/what-is-a-ux-audit or /post/mobile-ux-best-practices |
| what-is-brand-personality | Ford | /post/fords-marketing-strategy-tradition |  |
| content-marketing-tips-for-better-brand-awareness-and-audience-engagement | market research | /post/remarketing-tips |  |
| how-ai-can-enhance-your-ugc-marketing-efforts | personalization is seen to be pivotal | /post/remarketing-tips |  |
| emily-in-paris-season-5-collaborations | Iconic Brands in Movies: The Art of Product Placement | /post/brands-in-movies-product-placement-in-movies | /post/what-is-product-placement (anchor is a different title) |
| rare-beauty-business-model-marketing-strategy-2025 | The Branding and Marketing Genius of the Kardashian Family | /post/branding-marketing-kardashian-family |  |
| microsofts-marketing-strategy | The Branding and Marketing Genius of the Kardashian Family | /post/branding-marketing-kardashian-family |  |
| 818-tequila-marketing-strategies | Kardashian-Jenner family's broader approach to brand building | /post/branding-marketing-kardashian-family | /post/kim-kardashian-branding |
| rare-beauty-business-model-marketing-strategy-2025 | The Marketing Strategy of Walmart: A Store That Feels Like Home | /post/marketing-strategy-walmart |  |
| how-to-build-a-marketing-strategy-for-a-software-development-company | marketing strategy | /post/marketing-strategy-walmart |  |
| microsofts-marketing-strategy | The Marketing Strategy of Walmart: A Store That Feels Like Home | /post/marketing-strategy-walmart |  |
| signage-that-moves-shoppers-the-walmart-approach-to-in-store-conversion | BrandVM’s own Walmart marketing strategy overview | /post/marketing-strategy-walmart | /post/walmarts-logo-change (different topic) |
| rare-beauty-business-model-marketing-strategy-2025 | Drake’s Success and Marketing Tactics: The Story Behind The Invincible Genius | /post/drake-success-marketing-genius |  |
| microsofts-marketing-strategy | Drake’s Success and Marketing Tactics: The Story Behind The Invincible Genius | /post/drake-success-marketing-genius |  |
| what-is-a-value-proposition-guide-and-top-examples | branding | /post/modernized-branding-what-are-companies-doing-differently |  |
| the-role-of-learning-and-personal-growth-in-purpose-driven-branding | Branding | /post/modernized-branding-what-are-companies-doing-differently |  |
| web-development-vs-web-design-key-differences-and-how-they-collaborate | AI website builders | /post/ai-website-builders-pros-and-cons | /post/best-website-builders-pros-cons (not AI-specific) |
| zoom-marketing-strategy-brand-story | Brand Vision Insights | /post/zoom-ahead-marketing-advertisement |  |
| brands-with-low-advertising-spend | Rolls-Royce | /post/rolls-royces-strategy | /post/luxury-brands-marketing-strategies (if it covers Rolls-Royce) |
| non-fashion-brands-merch-food-status | Bearista cup drop analysis | /post/starbucks-drop-strategy-bearista-cups | /post/starbucks-marketing |
| pros-and-cons-of-custom-applications-vs-off-the-shelf-software | SaaS products | /post/saas-practices-marketing-and-branding |  |
| small-design-studios-global-talent | difference between hiring freelancers and an in-house team | /post/outsourcing-vs-in-house-teams-2025 | /post/marketing-agency-vs-in-house-team (not freelancers) |
| create-more-compromise-less-the-new-standard-in-branded-videos | For creative teams | /post/outsourcing-vs-in-house-teams-2025 |  |
| top-guerrilla-marketing-tactics | brand loyalty | /post/crafting-a-seamless-customer-journey-from-first-impression-to-brand-loyalty | /post/building-brand-loyalty-through-sustainability |
| how-to-simplify-digital-paperwork-while-staying-fully-privacy-compliant | create clear audit trails | /post/brand-audit-checklist-2025 |  |
| the-intersection-of-ux-and-seo-why-your-website-design-matters-for-rankings | improve discoverability and SEO | /post/tips-improving-online-visibility-business-seo-2025 |  |
| academic-brand-building-dissertation | boost your brand | /post/top-branding-ideas |  |
| what-people-are-saying-firsthand-experiences-with-tweetdelete | personal rebranding | /post/building-personal-brand-as-entrepreneur |  |
| everything-you-need-to-know-about-ringless-voicemail | proactive outreach | /post/lead-generation-strategies-inbound-vs-outbound |  |
| how-ai-is-reshaping-content-marketing-and-seo | AI-generated content | /post/artificial-intelligence-future-marketing |  |
| buying-youtube-views-in-2025-weighing-the-risks-and-rewards | marketing strategy | /post/artificial-intelligence-future-marketing |  |
| from-concept-to-shelf-the-science-behind-effective-packaging | Good packaging does more than hold a product | /post/branding-design-brand |  |
| online-psychology-insights-for-visual-identity-and-branding | purple is used by Twitch | /post/twitchs-marketing-strategy |  |
