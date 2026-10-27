# Phase 2: redirect changes for Webflow

Approved 2026-10-27 (D8, `redirect-review.csv`). Applied as a **CSV import
in Site settings → Publishing → 301 redirects**, which **replaces every
existing redirect**. They take effect at the next publish.

**Import this file:** `redirects/webflow-import-2026-10-27.csv` (595 rows).

It is built from Webflow's own export of the same day
(`redirects/webflow-export-2026-10-27.csv`, 648 rows), not from the crawl,
which only saw 130:

- 557 rows kept byte-for-byte as exported (same header `source,target`,
  Webflow's `%`-escaped sources, the 9 wildcard rules, `/ads.txt` and the
  verification `.txt` file);
- 38 rows with the approved new target (tables below);
- 53 rows dropped, so those URLs return 404 (Webflow can't serve 410).

All 130 table rows were found in the export with the table's current
target. No row in the import redirects to another redirect or to itself.

Already done (on staging, 2026-10-27): every post link to the 53 dropped
URLs is unlinked, text kept (122 links in 47 posts; plan, backup and
rollback in `docs/cms/posts-broken-links-*-2026-10-27-redirects.*`).

**Rollback:** import `redirects/webflow-export-2026-10-27.csv` (the state
before this change) and publish.

**Check after publishing:** `python3 check-redirects.py` checks every import
row (301 to its target, first hop) and every dropped row (404). Before the
import it reports exactly the 91 approved changes and 548 rows as they are.

## Follow-up: 17 existing redirects that landed on 404 pages (v2)

These were outside the approved table and went live unchanged in the first
import (live 20:17 UTC). Proposed fix, Kajal's request 2026-10-27:
**`redirects/webflow-import-2026-10-27-v2.csv`** (594 rows), built from the
first import, which `check-redirects.py` confirmed matches the live site
row for row. If anyone has edited redirects in Webflow since, export again
first and rebuild. 16 rows get a live target, `/ads.txt` is dropped; the
other 578 rows are byte-identical. Every new target returns 200 directly
and is published (not a draft); no chains or loops.

| Old path | Was (404) | New target | Why |
| --- | --- | --- | --- |
| `/business-directory/legal/top-car-accident-lawyers-in-austin` | /post/law-firm-marketing-strategy-roi | `/industry/law-marketing` | Other legal directory rows already go here |
| `/business-directory/legal/top-personal-injury-lawyers-in-dallas` | same | `/industry/law-marketing` | same |
| `/business-directory/legal/top-slip-and-fall-lawyers-in-austin` | same | `/industry/law-marketing` | same |
| `/business-directory/legal/top-chicago-real-estate-lawyers` | same | `/industry/law-marketing` | same |
| `/business-directory/legal/top-austin-real-estate-lawyers` | same | `/industry/law-marketing` | same |
| `/business-directory/legal/top-personal-injury-law-firms-in-toronto` | /post/top-personal-injury-law-firms-in-toronto | `/industry/law-marketing` | No Toronto list; Seattle's is a different city |
| `/post/top-marketing-strategies-for-law-firms-attracting-the-right-clients` | /post/law-firm-marketing-strategy-roi | `/post/legal-marketing-best-marketing-law-firms` | Same topic |
| `/post/best-thanksgiving-campaigns-all-time` | /post/marketing-american-thanksgiving-history | `/post/best-holiday-ads-christmas-2025` | Closest holiday-campaign roundup |
| `/post/best-thanksgiving-marketing-campaigns-all-time` | same | `/post/best-holiday-ads-christmas-2025` | same |
| `/post/richest-twitch-streamers-2025-net-worth` | /post/kick-twitch-marketing-strategies-2025-streams | `/post/celebrities-marketing-monetization` | Where `most-followed-twitch-streamers-2025` already goes |
| `/post/branding-practices-for-real-estate-agents` | /post/branding-real-estate-agents | `/post/real-estate-branding-guide` | Same topic (also the Phase 1 repoint) |
| `/post/how-to-write-a-business-plan-real-results` | /post/how-to-write-a-business-plan-2025 | `/insights/marketing-agency` | No business-plan article; category |
| `/post/lebron-james-impact-on-sports` | /post/lebron-james-impact-on-marketing | `/post/sports-marketing-guide` | Where the other athlete rows go |
| `/post/most-wimbledon-titles-record-holders` | /post/wimbledon-marketing (unpublished draft) | `/post/sports-marketing-guide` | same |
| `/post/the-best-ai-advancements-in-2025` | /post/brands-integrated-ai-in-2025-ai-agents | `/post/the-rise-of-ai-tools-that-can-what-businesses-need-to-know` | Where the approved table sends the other AI-tools rows |
| `/post/most-subscribed-youtubers-2025-top-10` | /post/most-successful-creator-brands-2025 | `/post/youtube-marketing-guide-brands` | Closest YouTube article |
| `/ads.txt` | raw.githubusercontent.com/…/ads.txt (gone) | **dropped** → 404 | No ads.txt exists to point at; a 404 reads the same to ad crawlers as the broken redirect does now. If the site runs ads, upload an ads.txt and add the row back |

`check-redirects.py` now checks against v2; before the v2 import it reports
exactly these 17. Rollback: import `redirects/webflow-import-2026-10-27.csv`.

**Live 2026-10-27:** Kajal imported v2 and the site was published. Checked
afterwards on www and staging: 585 redirects and 54 removed URLs (incl.
`/ads.txt`), **0 not as imported**.

## Edit: change the target (38)

| Old path (keep) | Current target | New target |
| --- | --- | --- |
| `/insights/social-media-impact-on-marketing` | /insights/social-media | `/post/social-media-marketing-2025` |
| `/post/2025-web-design-trends` | /post/current-web-design-trends | `/post/top-web-design-trends-in-2024` |
| `/post/barbie-movie` | /insights/our-work-portfolio | `/post/rebranding-barbie-how-the-doll-stayed-relevant` |
| `/post/best-ai-tools-for-2025-need` | /insights | `/post/the-rise-of-ai-tools-that-can-what-businesses-need-to-know` |
| `/post/best-ai-tools-of-2024` | /insights | `/post/the-rise-of-ai-tools-that-can-what-businesses-need-to-know` |
| `/post/black-friday-2023` | /insights/our-work-portfolio | `/post/how-to-create-a-holiday-ecommerce-strategy-maximize-your-sales` |
| `/post/boosting-brand-awareness-and-engagement-online` | /insights/branding | `/post/content-marketing-tips-for-better-brand-awareness-and-audience-engagement` |
| `/post/brand-reputation-crisis-communication` | /insights/branding | `/post/digital-reputation-brand-trust-modern-brands` |
| `/post/brands-reputation-tips` | /insights/branding | `/post/digital-reputation-brand-trust-modern-brands` |
| `/post/brandsthatworkwithmicroinfluencers` | /insights/social-media | `/post/influencer-marketing-guide` |
| `/post/business-strategy-restaurant` | /insights/marketing-agency | `/post/marketing-and-branding-restaurant-cafe` |
| `/post/business-travel-security-essentials-proven-safety-methods-that-work` | /insights | `/post/business-travel-security-brand-risk` |
| `/post/celebrity-alcohol-brands` | /insights | `/post/biggest-celebrity-owned-brands` |
| `/post/coquette-aesthetic` | /insights/branding | `/post/sell-an-aesthetic-marketing` |
| `/post/elon-musks-cybertruck` | /insights | `/post/teslas-marketing-strategy` |
| `/post/goop-empire-gwyneth-paltrows-business` | /insights/our-work-portfolio | `/post/biggest-celebrity-owned-brands` |
| `/post/high-rank-seo` | /insights/seo-agency | `/post/how-fast-get-first-page-google` |
| `/post/holiday-marketing-campaigns` | /insights/our-work-portfolio | `/post/best-holiday-ads-christmas-2025` |
| `/post/how-to-maximize-social-media-for-business-growth` | /insights/social-media | `/post/social-media-marketing-engagement-growth` |
| `/post/improve-brand-awareness` | /insights/branding | `/post/17-ways-to-improve-brand-visibility` |
| `/post/kylie-jenner-branding` | /insights/our-work-portfolio | `/post/celebrity-marketing-personal-branding` |
| `/post/marketing-trends-2023` | /insights/marketing-agency | `/post/2026-marketing-trends` |
| `/post/nba-marketing-strategies` | /insights/our-work-portfolio | `/post/most-successful-sports-marketing-campaigns` |
| `/post/nickelodeon-rebrands` | /insights/branding | `/post/rebrands-2024` |
| `/post/pricing-strategy-guide` | /insights/marketing-agency | `/post/psychology-of-pricing-strategies` |
| `/post/professional-website-design-services-business-growth-revenue` | /insights/web-design | `/post/website-design-essentials-business-website-2025` |
| `/post/small-businesses-guide-seo` | /insights/seo-agency | `/post/how-can-seo-help-small-businesses-compete-with-big-brands` |
| `/post/social-media-platform-best-business` | /insights/social-media | `/post/social-media-marketing-for-small-businesses` |
| `/post/spotify-wrapped-2024` | /insights | `/post/spotifys-marketing-strategy-personalization-community` |
| `/post/stand-out-on-instagram-2022` | /insights/social-media | `/post/instagram-marketing-strategy` |
| `/post/tesla-cyberbeer` | /insights/our-work-portfolio | `/post/teslas-marketing-strategy` |
| `/post/tesla-fires-marketers` | /insights/our-work-portfolio | `/post/teslas-marketing-strategy` |
| `/post/tiktok-creators-cash-in` | /insights/social-media | `/post/how-tiktok-creators-build-social-presence` |
| `/post/top-10-march-madness-ads-of-all-time` | /insights/our-work-portfolio | `/post/most-successful-sports-marketing-campaigns` |
| `/post/unconventional-brand-collaborations` | /insights/our-work-portfolio | `/post/iconic-brand-collaborations` |
| `/post/why-brand-trust-is-your-most-valuable-marketing-asset` | /insights/branding | `/post/6-signals-instantly-increase-brand-trust-online` |
| `/post/why-hire-marketing-team-pr-campaign` | /insights/marketing-agency | `/post/pr-campaigns-vs-marketing-campaigns` |
| `/post/youtube-affiliate-hub` | /insights/social-media | `/post/youtube-marketing-guide-brands` |

## Delete (53)

| Old path | Current target |
| --- | --- |
| `/post/twitchs-marketing-strategy` | /post/kick-twitch-marketing-strategies-2025-streams |
| `/post/15-fast-food-restaurants-most-worldwide-locations` | /insights |
| `/post/20-of-the-best-universities-for-finance-in-the-world` | /insights |
| `/post/ai-transformed-the-internet-2023` | /insights |
| `/post/apple-intelligence-siri` | /insights |
| `/post/apple-intelligent-search` | /insights |
| `/post/apple-invites-event-planning-app-2025` | /insights |
| `/post/best-camera-phone-2025-top-10` | /insights |
| `/post/best-crm-apps-customer-relationship-management` | /insights/marketing-agency |
| `/post/best-halloween-costume-ideas-2025` | /insights |
| `/post/best-halloween-movies-2025` | /insights |
| `/post/best-jewelry-brands-special-statement` | /insights |
| `/post/best-self-help-podcasts-transform-life-2025` | /insights |
| `/post/biggest-canadian-fast-food-chains` | /insights |
| `/post/building-your-real-estate-empire` | /insights |
| `/post/crm-software-solutions` | /insights/marketing-agency |
| `/post/cybersecurity-101` | /insights |
| `/post/cybersecurity-basics-protecting-yourself-online` | /insights |
| `/post/geofencing-vs-gps-tracking` | /insights |
| `/post/googles-gemini-ai-intelligence` | /insights |
| `/post/gracie-abrams-remarkable-rise-from-opening-act-to-star` | /insights |
| `/post/grammy-awards-nominations-everything-need-to-know` | /insights |
| `/post/highest-paid-hockey-players-2025` | /insights |
| `/post/history-of-google` | /insights |
| `/post/jobs-at-risk-or-rising-industries-and-jobs-affected-by-ai` | /insights |
| `/post/largest-american-fast-food-chains` | /insights |
| `/post/logan-pauls-journey` | /insights |
| `/post/messis-arrival-in-mls` | /insights |
| `/post/most-anticipated-games-2025` | /insights |
| `/post/most-expensive-celebrity-watches-top-10` | /insights |
| `/post/most-watched-tv-shows-2025-global-ranking` | /insights |
| `/post/novak-djokovic-net-worth-2025` | /insights |
| `/post/oldest-country-in-the-world` | /insights |
| `/post/opening-links-securely` | /insights |
| `/post/outer-banks-season-4-finale` | /insights |
| `/post/roger-federer-net-worth` | /insights |
| `/post/serena-williams-net-worth` | /insights |
| `/post/tech-startups-redefining-investment` | /insights |
| `/post/tesla-cybercab-robovan-optimus` | /insights |
| `/post/teslas-cheaper-model-2025` | /insights |
| `/post/top-10-best-phones-2025` | /insights |
| `/post/top-10-business-universities-world` | /insights |
| `/post/top-10-cities-in-north-america-with-a-booming-real-estate-market` | /insights |
| `/post/top-10-largest-fast-food-chains-u-s` | /insights |
| `/post/top-10-tim-burton-movies` | /insights |
| `/post/top-15-highest-rated-canadian-universities-2025` | /insights |
| `/post/top-15-highest-rated-law-schools-2025` | /insights |
| `/post/top-15-highest-rated-universities-2025` | /insights |
| `/post/top-15-highest-rated-universities-in-united-states-2025` | /insights |
| `/post/top-ten-historic-cities-world` | /insights |
| `/post/ultimate-old-money-style-guide` | /insights/branding |
| `/post/virtual-reality-entertainment` | /insights |
| `/post/virtual-universe-augmented-virtual-and-mixed-reality` | /insights |
