# Plan: Screaming Frog handoff (crawl of 2026-10-20)

Phase 1 links live 2026-10-27 (`phase1-links-2026-10-27.md`). Phases 2 and 4 live 2026-10-27 (`phase2-4-2026-10-27.md`): redirects imported (`phase2-redirects-2026-10-27.md`, 0 mismatches), metadata fixes and unlinks published. The 17 pre-existing redirects to 404 pages fixed the same day (v2 import, 0 mismatches). Later the same day (Kajal): real-estate stays noindex; site-wide robots tag fixed; the 18 "live drafts" unpublished with their links, references and 3 redirects handled (v3 import, 0 mismatches). Open: the two orphan pages (not linked anywhere; link or drop from sitemap) and the Phase 5 re-crawl. Not urgent: nothing here blocks the speed work. The handoff
(`START-HERE-Asheem-SEO-Handoff.txt`, `Asheem-Technical-SEO-Handoff.html`)
and its evidence files are kept as received; `lighthouse-reports/` (23 MB)
stays local and out of git. The handoff authorizes no production changes:
every batch goes to staging, gets checked, and is published on a go-ahead.

## What the crawl found, and what we already know

| # | Finding | Count | Notes from this repo |
| --- | --- | --- | --- |
| 1 | Broken internal links | 64 links on 56 pages; 46 URLs return 4xx (45 × 404, 1 × 403) | All 64 sit in Posts rich text (`.post-body`). Top targets: `/industry/food-beverage-marketing` (5 links, 404 live today), `/post/marketing-strategy-walmart` (4), `/post/branding-marketing-kardashian-family` (3). |
| 2 | Redirects ending in a 404 | 2 | `/post/2025-web-design-trends` → `/post/current-web-design-trends`; `/post/twitchs-marketing-strategy` → `/post/kick-twitch-marketing-strategies-2025-streams` |
| 3 | Broad redirects to review | 128 of 144 land on `/insights` or a category | Relevance review, not a bulk fix |
| 4 | Indexability and depth | noindex on 3 URLs; 2 sitemap-only orphans; 1,014 pages at high depth | `/llms.txt` and `/insights/all` are likely intentional |
| 5 | No Article/BlogPosting found on 1,175 posts | — | **Partly a crawler artefact.** The Posts template builds BlogPosting in the browser (decision D4b, `docs/handoff/DECISIONS.md`); the crawl read raw HTML without running scripts. The raw HTML of a live post has the script but no JSON-LD node. The real question is whether to move it into the HTML (D4 was tried and reverted: entities and empty fields, see GOTCHAS 2026-10-19). |
| 6 | Mobile speed | Home 75, Web Design 68 (their Lighthouse 13.4, earlier on 2026-10-20) | Superseded: Home mobile is 92–94 since the evening changes; Web Design is 73 and in the mobile plan (optimization report, "Plan for the other pages") |
| 7 | Metadata and other flags | 1 missing description; 145 duplicate titles, 149 duplicate descriptions | Check pagination/parameter variants first (`?page=` on Insights lists) |
| 8 | Consent | — | Separate from the crawl. Same open items as the report: HubSpot banner → Google Consent Mode, Quebec, X pixel consent |

## Phases

1. **Links and redirects (items 1–2), Claude with a decision list.**
   - Re-crawl the 46 error URLs live first; the snapshot may be stale.
   - For each broken link: find the rich-text field (Posts collection),
     and a live page that matches the anchor and sentence. Change the
     href only when the match is clear. Everything else goes into a
     decision list for Asheem.
   - The 403: open it in a browser before treating it as gone.
   - Fix the two redirect chains at the redirect and in the source links.
   - Through the CMS API, one collection item at a time, resending the
     required fields (GOTCHAS "CMS item updates must resend every required
     field"). Rollback record: old and new href per item.
2. **Redirect relevance and indexability (items 3–4), Asheem decides.**
   - Claude prepares a table: original URL, original topic (from the slug
     and any archive), current destination, proposed destination or
     "keep" or "410". Asheem approves; redirects change in Webflow's
     301 settings (Site settings → Publishing).
   - Noindex on `/industry/real-estate-marketing`: Asheem's call.
   - The two orphans: a contextual link from a relevant page, or drop
     them from the sitemap.
3. **Article structured data (item 5), decision first.**
   - Options: (a) keep the browser-built script (Google runs it; other
     crawlers and AI tools may not); (b) CMS-bound JSON-LD in the template
     head with empty-field handling (D4's problems: HTML entities, empty
     author/image); (c) add BlogPosting to each item through an API that
     writes per-item schema, if the Webflow MCP can (to check).
   - Whatever is chosen: test old/new posts, with and without optional
     fields, different authors; Rich Results Test.
4. **Metadata and flags (item 7), batch later.**
   - The one missing description; duplicate titles/descriptions after
     separating real duplicates from `?page=` variants; heading order;
     image alt and dimensions in Posts rich text; external link errors
     checked in a normal browser. Security headers: review only, no
     blanket CSP.
5. **Verify.** Same licensed crawl, same exports, compared by URL.

## Open questions for Asheem

- Phase 1: is there a migration map for the old post slugs, or should
  unmatched links be removed?
- Phase 2: who approves the redirect table, and is a 410 acceptable for
  articles that were removed on purpose?
- Phase 3: option (a), (b) or (c)?

## Answers (2026-10-27, Kajal)

- No migration map for old post slugs: unmatched broken links are
  unlinked (text kept), not guessed.
- Redirects: the Screaming Frog export has current destinations only, no
  proposals. Proposed table: `redirect-review.csv` (130 URLs, re-checked
  live 2026-10-27: all still 301). Approved by Kajal 2026-10-27 (D8). Webflow can't serve
  410, so "remove" means deleting the 301 and letting the URL 404.
- Structured data: keep the browser-built script (option a, D8). Phase 3 is closed.
