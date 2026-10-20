# PageSpeed log

One block per major step. Every number is the **median of 5 Lighthouse
runs** with the score's range, run with `pnpm wf:perf --live --runs 5` on
the same machine (Lighthouse 12, simulated mobile / desktop preset). A
change smaller than the range is noise. The raw runs are saved next to this
file.

PageSpeed Insights (Google's servers) numbers are added once a `PSI_KEY` is
available (the keyless quota ran out on 2026-10-19).

## 2026-10-19 · Baseline: live site before any change

`brandvm/brandvm@1.1.1`, all Webflow IX2/IX3 on. Raw:
`2026-10-19-baseline-live.json`.

| Page | Mode | Score (range) | LCP | FCP | TBT | CLS | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | mobile | 54 (33–64) | 7.8 s | 4.5 s | 162 ms | 0.005 | 10.0 MB |
| `/` | desktop | 68 (60–83) | 2.0 s | 1.2 s | 0 ms | 0.313 | 11.0 MB |
| `/about` | mobile | 41 (34–53) | 18.2 s | 7.3 s | 155 ms | 0.488 | 14.4 MB |
| `/about` | desktop | 76 (48–79) | 2.7 s | 1.3 s | 0 ms | 0.001 | 15.9 MB |
| `/contact` | mobile | 41 (36–51) | 15.7 s | 6.1 s | 233 ms | 0.276 | 3.1 MB |
| `/contact` | desktop | 61 (57–65) | 2.3 s | 1.0 s | 0 ms | 0.409 | 4.0 MB |
| `/web-design` | mobile | 53 (33–54) | 22.4 s | 7.2 s | 167 ms | 0.006 | 11.0 MB |
| `/web-design` | desktop | 82 (54–87) | 1.9 s | 1.2 s | 0 ms | 0.008 | 11.2 MB |
| `/branding` | mobile | 49 (40–65) | 10.1 s | 2.5 s | 169 ms | 0.49 | 9.9 MB |
| `/branding` | desktop | 78 (55–83) | 3.0 s | 1.1 s | 0 ms | 0.025 | 10.3 MB |
| `/our-work-portfolio` | mobile | 54 (48–61) | 20.8 s | 7.0 s | 164 ms | 0.004 | **98.1 MB** |
| `/our-work-portfolio` | desktop | 55 (53–82) | 2.3 s | 0.9 s | 0 ms | 0.729 | **98.3 MB** |
| `/insights` | mobile | 56 (51–67) | 22.5 s | 4.7 s | 136 ms | 0.001 | 3.1 MB |
| `/insights` | desktop | 79 (70–85) | 1.2 s | 0.9 s | 0 ms | 0.328 | 3.9 MB |
| `/services` | mobile | 56 (55–59) | 20.0 s | 7.4 s | 137 ms | 0.001 | 10.0 MB |
| `/services` | desktop | 75 (57–83) | 2.6 s | 1.2 s | 0 ms | 0 | 9.9 MB |
| case study | mobile | 52 (46–54) | 18.6 s | 9.0 s | 218 ms | 0 | 12.7 MB |
| case study | desktop | 78 (56–86) | 2.2 s | 0.9 s | 8 ms | 0.106 | 12.2 MB |
| post | mobile | 55 (45–59) | 14.9 s | 4.7 s | 166 ms | 0.162 | 2.7 MB |
| post | desktop | 71 (69–71) | 4.5 s | 0.8 s | 0 ms | 0.043 | 2.9 MB |

Case study: `/case-studies/accounting-advisory-firm-website`; post:
`/post/10-essential-marketing-metrics`.

What stands out (measured):

- **Mobile is 41–56 on every page; LCP 8–22 s.** FCP is 2.5–9 s, so the
  first paint itself is late, not only the hero image. The wide ranges
  (Home 33–64) are typical of pages gated by IX3's hide-until-ready.
- **The Work page transfers ~98 MB** on load, about 10× any other page. To
  check first in Stage 5 (likely autoplaying or unlazy case-study videos).
- **Page weight 10–16 MB** on most service/marketing pages.
- **CLS above 0.25** on Home, Contact, Work and Insights (desktop) and on
  About, Contact and Branding (mobile).
- TBT is low (≤ 233 ms); main-thread JS is not the bottleneck today.

## 2026-10-19 · After Stage 2: loader v1.0.0 live

`brandvm/wf-brandvm@1.0.0` (parity port of brandvm v1.1.2 + template
loader), all Webflow IX2/IX3 still on. Raw: `2026-10-19-stage2-live.json`.
From this run on, analytics beacons (GA/Ads/X/HubSpot collect calls) are
blocked in Lighthouse; the tag scripts still load. Beacons fire after load,
so the effect on these numbers is small, but the comparison with the
baseline is not perfectly like-for-like.

| Page | Mode | Score before → after (range) | LCP | TBT | CLS | Transfer |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | mobile | 54 → **56** (55–57) | 7.8 → 19.8 s | 162 → 145 ms | 0.005 → 0.005 | 10.0 → 9.7 MB |
| `/` | desktop | 68 → **84** (81–92) | 2.0 → 2.0 s | 0 → 0 ms | 0.313 → 0.003 | 11.0 → 10.5 MB |
| `/about` | mobile | 41 → **56** (54–65) | 18.2 → 18.1 s | 155 → 140 ms | 0.488 → 0.001 | 14.4 → 14.1 MB |
| `/about` | desktop | 76 → **79** (77–81) | 2.7 → 2.4 s | 0 → 0 ms | 0.001 → 0.001 | 15.9 → 15.6 MB |
| `/contact` | mobile | 41 → **52** (42–52) | 15.7 → 20.0 s | 233 → 203 ms | 0.276 → 0.032 | 3.1 → 2.9 MB |
| `/contact` | desktop | 61 → **87** (82–88) | 2.3 → 1.8 s | 0 → 0 ms | 0.409 → 0.013 | 4.0 → 3.7 MB |
| `/web-design` | mobile | 53 → **55** (54–64) | 22.4 → 20.9 s | 167 → 172 ms | 0.006 → 0.006 | 11.0 → 10.6 MB |
| `/web-design` | desktop | 82 → **89** (83–92) | 1.9 → 1.6 s | 0 → 0 ms | 0.008 → 0.008 | 11.2 → 10.8 MB |
| `/branding` | mobile | 49 → **56** (55–61) | 10.1 → 20.0 s | 169 → 158 ms | 0.49 → 0.001 | 9.9 → 9.7 MB |
| `/branding` | desktop | 78 → **81** (77–81) | 3.0 → 2.6 s | 0 → 0 ms | 0.025 → 0.025 | 10.3 → 10.2 MB |
| `/our-work-portfolio` | mobile | 54 → **55** (54–63) | 20.8 → 15.9 s | 164 → 149 ms | 0.004 → 0.004 | 98.1 → 97.9 MB |
| `/our-work-portfolio` | desktop | 55 → **83** (82–83) | 2.3 → 1.9 s | 0 → 0 ms | 0.729 → 0.003 | 98.3 → 97.9 MB |
| `/insights` | mobile | 56 → **56** (54–65) | 22.5 → 23.1 s | 136 → 169 ms | 0.001 → 0.001 | 3.1 → 3.2 MB |
| `/insights` | desktop | 79 → **92** (87–92) | 1.2 → 1.2 s | 0 → 0 ms | 0.328 → 0.001 | 3.9 → 4.0 MB |
| `/services` | mobile | 56 → **57** (56–60) | 20.0 → 18.4 s | 137 → 148 ms | 0.001 → 0.001 | 10.0 → 9.7 MB |
| `/services` | desktop | 75 → **84** (83–86) | 2.6 → 2.2 s | 0 → 0 ms | 0 → 0 | 9.9 → 9.9 MB |
| case study | mobile | 52 → **51** (38–52) | 18.6 → 16.4 s | 218 → 275 ms | 0 → 0.001 | 12.7 → 12.2 MB |
| case study | desktop | 78 → **89** (68–90) | 2.2 → 1.7 s | 8 → 9 ms | 0.106 → 0 | 12.2 → 12.2 MB |
| post | mobile | 55 → **53** (51–63) | 14.9 → 19.5 s | 166 → 236 ms | 0.162 → 0.001 | 2.7 → 2.7 MB |
| post | desktop | 71 → **71** (69–71) | 4.5 → 4.4 s | 0 → 0 ms | 0.043 → 0 | 2.9 → 2.9 MB |

What changed (measured):

- **Layout shift gone.** The old config Embed swapped the stylesheet
  `href` directly, so pages re-rendered unstyled for a moment; the template
  loader swaps without a gap. Desktop CLS 0.31–0.73 → ≤ 0.013 (Home,
  Contact, Work, Insights); mobile About/Branding/Contact 0.28–0.49 → ≤ 0.03.
- **Desktop scores up** on 9 of 10 pages (largest: Work 55 → 83, Contact
  61 → 87, Home 68 → 84; the post is flat at 71). Mobile scores up on 7
  pages (About 41 → 56, Contact 41 → 52), down 1–2 on the case study and
  the post; score ranges are much tighter.
- **Mobile LCP: worse median on 4 pages, open.** Home 7.8 → 19.8 s,
  Branding 10.1 → 20.0 s, Contact 15.7 → 20.0 s, post 14.9 → 19.5 s;
  better on Work, Services and the case study. The LCP element is the same
  (Home: the hero image) and the time is almost all *render delay*: the
  element waits to be shown (IX3's page-load reveal). Mobile LCP was
  already two-mode in the baseline (Home 5.1–20.9 s); two single runs
  right after gave 7.8 s and 19.9 s. So the median moved from the fast mode
  to the slow one; whether the new loader causes that is **not yet shown**.
  Next: 10+ runs per page, and a trace of what the hero reveal waits on
  (the IX3 reveal, the hero-panels page script, the stylesheet swap).
- **Not changed:** page weight (Work still ~98 MB). Stages 4–5.

## 2026-10-19 · Stage 3, batches 3.1 and 3.2 live (v1.1.0)

3.1 removed six duplicate CSS Embeds (a few hundred bytes of inline CSS on
CMS pages): not measured, below Lighthouse's noise. 3.2 moved the About
Orbit (≈ 12 KB inline JS + CSS) and the Industries tilt into the bundle
and dropped a dead registered script on About. Raw:
`2026-10-19-stage3-batch32-live.json`.

| Page | Mode | Score (range) | LCP | TBT | CLS | Transfer | vs Stage 2 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/about` | mobile | 55 (54–56) | 18.3 s | 168 ms | 0.001 | 14.1 MB | 56 → 55, inside the range |
| `/about` | desktop | 80 (79–82) | 2.4 s | 0 ms | 0.001 | 15.6 MB | 79 → 80, inside the range |
| `/industries` | mobile | 59 (57–64) | 17.7 s | 186 ms | 0.017 | 4.6 MB | first measurement |
| `/industries` | desktop | 70 (69–71) | 6.4 s | 34 ms | 0 | 6.6 MB | first measurement |

No measurable change, as expected: these batches move code, they don't
remove work. Industries desktop LCP (6.4 s) is the slowest desktop LCP
measured so far; added to the Stage 5 list.

## 2026-10-19 · Stage 3, batch 3.3 live (v1.3.0)

Flowbase tab rotation, the HubSpot loader and Finsweet Attributes moved
into the bundle (3.3a–c). All ten pages, compared with the Stage 2 run.
Raw: `2026-10-19-stage3-batch33-live.json`.

| Page | Mode | Score Stage 2 → now (range) | LCP | TBT | Transfer |
| --- | --- | --- | --- | --- | --- |
| `/` | mobile | 56 → 57 (54–72) | 19.8 → 18.7 s | 145 → 190 ms | 9.7 MB |
| `/` | desktop | 84 → 85 (83–86) | 2.0 → 2.0 s | 0 ms | 10.5 MB |
| `/about` | mobile | 56 → 56 (54–66) | 18.1 → 11.4 s | 140 → 183 ms | 14.0 MB |
| `/about` | desktop | 79 → 80 (77–85) | 2.4 → 2.4 s | 0 ms | 15.6 MB |
| `/contact` | mobile | 52 → 51 (50–62) | 20.0 → 14.1 s | 203 → 291 ms | 2.9 MB |
| `/contact` | desktop | 87 → 86 (82–92) | 1.8 → 1.8 s | 0 ms | 3.7 MB |
| `/web-design` | mobile | 55 → 56 (52–86) | 20.9 → 18.8 s | 172 → 166 ms | 10.6 MB |
| `/web-design` | desktop | 89 → 86 (83–91) | 1.6 → 1.8 s | 0 ms | 10.9 MB |
| `/branding` | mobile | 56 → 57 (54–67) | 20.0 → 18.9 s | 158 → 185 ms | 9.7 MB |
| `/branding` | desktop | 81 → 78 (77–80) | 2.6 → 2.7 s | 0 ms | 10.2 MB |
| `/our-work-portfolio` | mobile | 55 → 56 (54–64) | 15.9 → 16.5 s | 149 → 150 ms | 97.9 MB |
| `/our-work-portfolio` | desktop | 83 → **76** (74–83) | 1.9 → 2.4 s | 0 ms | 98.5 MB |
| `/insights` | mobile | 56 → 56 (53–77) | 23.1 → 22.8 s | 169 → 196 ms | 3.1 MB |
| `/insights` | desktop | 92 → 92 (89–92) | 1.2 → 1.3 s | 0 ms | 4.0 MB |
| `/services` | mobile | 57 → 65 (56–68) | 18.4 → 7.3 s | 148 → 155 ms | 9.7 MB |
| `/services` | desktop | 84 → 87 (84–89) | 2.2 → 2.1 s | 0 ms | 9.9 MB |
| case study | mobile | 51 → 54 (41–58) | 16.4 → 16.6 s | 275 → 225 ms | 12.2 MB |
| case study | desktop | 89 → 85 (80–89) | 1.7 → 1.8 s | 9 ms | 12.2 MB |
| post | mobile | 53 → 57 (50–61) | 19.5 → 12.1 s | 236 → 214 ms | 2.6 MB |
| post | desktop | 71 → 71 (68–72) | 4.4 → 4.3 s | 0 ms | 2.9 MB |

What it shows (measured):

- **Mostly inside the noise**, as expected for a batch that moves code.
  CLS is unchanged everywhere.
- **Work desktop 83 → 76**, below Stage 2's whole range (82–83); LCP 1.9 →
  2.4 s. Work is the page Finsweet List runs on, so the bundled List is
  the first suspect. To re-measure (10 runs) before blaming it: the range
  still reaches 83.
- **Mobile LCP medians moved to the fast mode on several pages** (Services
  18.4 → 7.3 s, About 18.1 → 11.4 s, post 19.5 → 12.1 s, Contact 20.0 →
  14.1 s). Mobile LCP is two-mode (see Stage 2), so this is not a gain
  from 3.3; it says the Stage 2 "regression" is the same coin flip.
- Mobile TBT is up 30–90 ms on Home, About, Contact and Branding; small and
  within run-to-run variation seen before, watch in the next run.

### 2026-10-19 · Work page re-measured (10 runs)

Desktop **82 (81–88)**, LCP 1.9 s; mobile 54 (50–59), LCP 18.4 s; 100 MB.
Back at Stage 2's 83: the 76 in the batch 3.3 run was noise, not Finsweet.
Raw: `2026-10-19-work-10runs-live.json`.

## 2026-10-20 · Stage 4: all interactions in the repo (1.4.1, live)

Every Webflow IX2/IX3 interaction deleted and Webflow's GSAP turned off;
the bundle runs all interactions on its own GSAP + ScrollTrigger. All ten
pages, compared with the Stage 3 batch 3.3 run. Raw:
`2026-10-20-stage4-live.json`.

Release caveat: the live HTML said `RELEASE = "1.4.1"` when the run
started, and `"1.4.2"` when it ended (a single check run after it loaded
`wf-brandvm@1.4.2/dist/index.js`). Some of these pages were measured on
1.4.1 and some on 1.4.2; we can't tell which from the runs. PageSpeed
Insights: not run (no `PSI_KEY` in `.env`).

| Page | Mode | Score 3.3 → now (range) | LCP | TBT | CLS | Transfer |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | mobile | 57 → 62 (35–81) | 18.7 → 7.1 s | 190 → 239 ms | 0.005 → 0.005 | 9.7 → 9.7 MB |
| `/` | desktop | 85 → 82 (81–84) | 2.0 → 2.0 s | 0 → 0 ms | 0.006 → 0.003 | 10.5 → **15.4 MB** |
| `/about` | mobile | 56 → 58 (52–65) | 11.4 → 12.8 s | 183 → 163 ms | 0.001 → 0.001 | 14.0 → 14.0 MB |
| `/about` | desktop | 80 → 83 (79–84) | 2.4 → 2.2 s | 0 → 0 ms | 0.001 → 0.001 | 15.6 → **20.7 MB** |
| `/contact` | mobile | 51 → 52 (48–60) | 14.1 → 7.8 s | 291 → 267 ms | 0.032 → **0.275** | 2.9 → 3.1 MB |
| `/contact` | desktop | 86 → 84 (81–90) | 1.8 → 1.9 s | 0 → 0 ms | 0.013 → 0.013 | 3.7 → **8.4 MB** |
| `/web-design` | mobile | 56 → 61 (58–63) | 18.8 → 7.2 s | 166 → 187 ms | 0.004 → 0.004 | 10.6 → 10.5 MB |
| `/web-design` | desktop | 86 → 85 (84–89) | 1.8 → 1.8 s | 0 → 0 ms | 0.008 → 0.015 | 10.9 → **15.7 MB** |
| `/branding` | mobile | 57 → 62 (61–63) | 18.9 → 9.4 s | 185 → 176 ms | 0.001 → 0 | 9.7 → 9.7 MB |
| `/branding` | desktop | 78 → **70** (67–71) | 2.7 → **6.7 s** | 0 → 4 ms | 0.025 → 0.025 | 10.2 → **15.1 MB** |
| `/our-work-portfolio` | mobile | 56 → 58 (56–64) | 16.5 → 8.6 s | 150 → 155 ms | 0.004 → 0.005 | 97.9 → 97.9 MB |
| `/our-work-portfolio` | desktop | 76 → 74 (68–78) | 2.4 → 2.9 s | 0 → 0 ms | 0.002 → 0.004 | 98.5 → **102.8 MB** |
| `/insights` | mobile | 56 → **70** (68–90) | 22.8 → 5.1 s | 196 → 151 ms | 0 → 0.001 | 3.1 → 3.1 MB |
| `/insights` | desktop | 92 → 92 (91–93) | 1.3 → 1.4 s | 0 → 0 ms | 0.001 → 0.001 | 4.0 → **8.9 MB** |
| `/services` | mobile | 65 → 70 (60–81) | 7.3 → 9.0 s | 155 → 135 ms | 0.001 → 0.001 | 9.7 → 9.7 MB |
| `/services` | desktop | 87 → 78 (76–88) | 2.1 → 3.1 s | 0 → 0 ms | 0 → 0 | 9.9 → **14.8 MB** |
| case study | mobile | 54 → 55 (47–65) | 16.6 → 8.7 s | 225 → 132 ms | 0.001 → 0.001 | 12.2 → 12.1 MB |
| case study | desktop | 85 → 80 (58–88) | 1.8 → 2.8 s | 9 → 0 ms | 0 → 0 | 12.2 → **17.2 MB** |
| post | mobile | 57 → 62 (58–68) | 12.1 → 12.6 s | 214 → 164 ms | 0.001 → 0.001 | 2.6 → 2.6 MB |
| post | desktop | 71 → 73 (70–75) | 4.3 → 5.2 s | 0 → 0 ms | 0 → 0.001 | 2.9 → **7.8 MB** |

Case study: `/case-studies/accounting-advisory-firm-website`; post:
`/post/10-essential-marketing-metrics`.

What it shows (measured):

- **Desktop transfer is up ~5 MB on every page; mobile is not.** That's
  not the bundle. A check run on the post (desktop, 96 requests, 7.8 MB;
  mobile 62 requests, 2.6 MB) shows **24 images from the nav dropdown's
  Industries panel (`.g-n-d-industries-image`, ~5.2 MB, largest Food &
  Beverage 1.26 MB, Education 0.82 MB) now load on page load**. They are
  `loading="lazy"`, so the dropdown panel is probably no longer
  `display: none` at load (IX used to hide it; now it looks hidden in a
  way Chrome's lazy-loading still counts as near the viewport). To fix in
  the repo: hide the closed panel with `display: none` / `content-visibility`,
  or move the images out until the panel opens. The images themselves are
  also too big for thumbnails (Stage 5).
- **Webflow's GSAP files and IX chunks no longer load.** On the post the
  only Webflow script left is `webflow.js` (20 KB transferred); the bundle
  `index.js` is 93 KB transferred. The script doesn't count requests, and
  the 3.3 run has no request list, so there is no measured before/after for
  the script bytes alone; the 5 MB image jump hides them.
- **Branding desktop 78 → 70 (67–71), LCP 2.7 → 6.7 s (6.5–7.3 s)**: the
  whole range is below 3.3's (77–80). A real regression. First suspects:
  the hero reveal now done by the bundle, and image bandwidth competing
  with the dropdown images.
- **Contact mobile CLS 0.032 → 0.275 (0.087–0.276)**: above 3.3 on every
  run, back to baseline level (0.276). A real regression. Likely an element
  the bundle reveals or sizes after first paint.
- **Services desktop 87 → 78 (76–88)** and **case study desktop 85 → 80
  (58–88)**: medians are lower and LCP is up 1 s, but both ranges still
  reach the old median. Probably the extra images; re-measure after the
  dropdown fix before calling it.
- **Mobile is better or flat on all ten pages.** The largest change is
  Insights 56 → 70 (68–90; the old range 53–77 reached 68–77 only once).
  Mobile LCP medians are in the fast mode on 7 pages (Home 18.7 → 7.1 s,
  Web Design 18.8 → 7.2 s, Insights 22.8 → 5.1 s, Branding 18.9 → 9.4 s,
  Work 16.5 → 8.6 s, Contact 14.1 → 7.8 s, case study 16.6 → 8.7 s), and
  Branding and Web Design have tight ranges (9.1–9.7 s, 6.1–9.1 s). That
  fits IX3's hide-until-ready reveal being gone, but mobile LCP was
  two-mode before (see Stage 2), so it needs a 10-run check before it is
  called a gain.
- Inside the noise: the other desktop scores (Home, About, Contact, Web
  Design, Work, Insights, post) and TBT everywhere. Home mobile had one
  run with TBT 1,081 ms and score 35; the median is 239 ms.

**Follow-up, same day (1.4.3):**

- The nav regression is fixed in the repo: closed mega-menu panels stay
  `display: none` until the visitor heads for the nav (pointer, focus or
  touch in it, or the mobile menu opening). On staging, nav-panel images
  requested at load went from 39 to 0; they load when the nav is used. The
  dropdown animation is unchanged (same heights at 400 ms and 1 s).
- Video: the two testimonial videos in "S | Why Choose" had `autoplay`,
  which overrides `preload="none"`, so ~3.5 MB downloaded at load on 59
  pages even when off screen (and on phones also for the hidden one).
  Changed in the Designer (MCP) to the lazy pattern the case-study videos
  use (`data-bv-lazy-video`, no autoplay): 0 MB of video at load on
  staging; they load 300 px ahead and play while visible.
- To re-measure after 1.4.3 is live: all desktop pages (transfer should
  drop ~5–8 MB), Branding desktop LCP, Contact mobile CLS.

### 2026-10-20 · After 1.4.3 (nav images + videos)

1.4.3 holds the closed nav mega-menu panels out of layout until the visitor
heads for the nav, and stops two testimonial videos from autoplay-downloading
at load. Compared with the Stage 4 run. Live HTML said `RELEASE = "1.4.3"`
before the run. `pnpm wf:perf --live --runs 5`: all ten pages desktop, plus
mobile for Contact and Branding (the other mobile pages weren't re-run). Raw:
`2026-10-20-after-1.4.3-live.json`. PageSpeed Insights: not run.

| Page | Mode | Score Stage 4 → now (range) | LCP | TBT | CLS | Transfer |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | desktop | 82 → 88 (59–89) | 2.0 → 2.0 s | 0 → 0 ms | 0.003 → 0.003 | 15.4 → **3.8 MB** |
| `/about` | desktop | 83 → 81 (62–87) | 2.2 → 2.2 s | 0 → 0 ms | 0.001 → 0.001 | 20.7 → **9.0 MB** |
| `/contact` | mobile | 52 → 46 (44–53) | 7.8 → 8.2 s | 267 → 218 ms | 0.275 → **0.276** | 3.1 → 3.1 MB |
| `/contact` | desktop | 84 → 90 (65–94) | 1.9 → 1.5 s | 0 → 0 ms | 0.013 → 0.013 | 8.4 → **3.5 MB** |
| `/web-design` | desktop | 85 → 87 (59–96) | 1.8 → 2.0 s | 0 → 0 ms | 0.015 → 0.015 | 15.7 → **4.2 MB** |
| `/branding` | mobile | 62 → 70 (63–71) | 9.4 → 9.0 s | 176 → 131 ms | 0 → 0.001 | 9.7 → **2.9 MB** |
| `/branding` | desktop | 70 → **85** (60–86) | 6.7 → **2.6 s** | 4 → 0 ms | 0.025 → 0.025 | 15.1 → **3.5 MB** |
| `/our-work-portfolio` | desktop | 74 → 86 (67–87) | 2.9 → 1.7 s | 0 → 0 ms | 0.004 → 0.003 | 102.8 → 100.0 MB |
| `/insights` | desktop | 92 → 94 (93–97) | 1.4 → 1.3 s | 0 → 0 ms | 0.001 → 0.001 | 8.9 → **3.9 MB** |
| `/services` | desktop | 78 → 90 (65–93) | 3.1 → 1.9 s | 0 → 0 ms | 0 → 0 | 14.8 → **3.1 MB** |
| case study | desktop | 80 → 94 (58–98) | 2.8 → 1.6 s | 0 → 0 ms | 0 → 0 | 17.2 → **12.4 MB** |
| post | desktop | 73 → 85 (68–89) | 5.2 → 2.4 s | 0 → 0 ms | 0.001 → 0.001 | 7.8 → **2.8 MB** |

Case study: `/case-studies/accounting-advisory-firm-website`; post:
`/post/10-essential-marketing-metrics`. Transfer in MB = KB / 1000, as in
Stage 4.

What it shows (measured):

- **Desktop transfer is down ~5 MB on every page except the portfolio, and
  ~11.6 MB on pages with testimonial videos.** Pages with no `<video>` in the
  live HTML (Contact, Insights, case study, post) dropped 4.8–5.0 MB: that's
  the nav images. Pages with videos (`/` 4, About 3, Web Design 4, Branding 4,
  Services 2) dropped 11.5–11.7 MB: nav images plus ~6.6 MB of video.
  Branding mobile dropped 6.8 MB (videos only; mobile never loaded the nav
  images). Desktop is now about the same as mobile, or lighter.
- **Portfolio desktop only dropped 2.8 MB (range 99.5–102.1 MB).** It is
  still ~100 MB, almost all images in the grid, so the nav saving is lost in
  the noise there. Image sizes (Stage 5) are the fix.
- **Branding desktop is back: 70 → 85, LCP 6.7 → 2.6 s (2.3–4.6 s)**, near
  the 2.7 s of 3.3. The Stage 4 regression was bandwidth taken by the nav
  images and videos, not the hero reveal.
- **Desktop scores are up on 8 of 10 pages** (About 83 → 81 and Web Design
  85 → 87 are within range). The post went 73 → 85, LCP 5.2 → 2.4 s.
- **The desktop ranges are wide at the bottom** (low end 58–68 on most pages).
  Each page had one slow run (LCP about 3.5–5 s, FCP 2–4 s), likely a
  cold CDN or connection. The medians and the upper ends are steady.
- **Contact mobile CLS is still 0.276 (0.275–0.276): not fixed by 1.4.3.**
  Lighthouse `layout-shifts` names `div.contact-cta-left.is_bottom` (the
  phone/email block) for three shifts (0.189 + 0.051 + 0.036). Lighthouse
  gives no root cause. A layout-shift observer at 412 × 823 shows the block
  at y = 640 (in view) at about 0.5 s, then pushed out of view (final
  y = 1572). That happens when the HubSpot form fills `.contact-cta-right`
  (now 1096 px tall). The `.hs-form-slot` is empty in the HTML and has no
  reserved height. `src/modules/hubspot-form.ts` loads v2.js when the slot
  is within 600 px, which is right away on Contact. On mobile the form sits
  above `.is_bottom`, so everything below it jumps. Fix: reserve the form's
  height (a `min-height` on `.hubspot-form` / `.hs-form-slot` for the
  Contact form at mobile widths, ~1000 px). A smaller ±150 px flicker of
  the badge carousel (`.contact-badge-carousel`) also happens just before.
  The cause may be the same, but that's not confirmed.
- Branding mobile LCP is still 9.0 s (8.9–9.3 s). That's unchanged, and
  wasn't in scope for 1.4.3.

## 2026-10-20 · Home toward 95 (staging, not yet live)

Lighthouse 12 CLI, default simulated throttling, Home only. Live =
www.brandvm.com on 1.4.5; staging = brandvm.webflow.io after the changes
below. The first run after each staging publish is a cold cache (55–65)
and is left out of the medians. Staging fires no GTM tags (hostname
triggers), so its TBT is ~0; live TBT is 150–290 ms from GA4, Ads and
HubSpot. Expect live to land a few points under staging.

| | Live before (median) | Staging after (median of 4–5) |
| --- | --- | --- |
| Mobile score | 60–63 | **93** (93, 93, 93, 76) |
| Mobile FCP / LCP | 4.2 s / 7.2–8.4 s | 2.2 s / 2.8 s |
| Desktop score | 85–87 | **94** (93–94) |
| Desktop FCP / LCP | 1.1–1.2 s / 2.1–2.2 s | 1.0 s / 1.5 s |

What each suspect cost, measured on live with Lighthouse request blocking
(mobile score, 2 runs): baseline 60/63; no tags (GTM, HubSpot, X, Ahrefs)
66/66, TBT → 0; no eager award badges 67/85; no Inter font 82/82; no
repo bundle 62/63. The HubSpot ads pixel alone: TBT 210–270 → 80 ms.

Changes (all in Webflow except the Finsweet module):

- Award badge carousel images (component C | Badge Carousel, two images)
  and the three desktop-only hero panel images: `loading="lazy"` (custom
  attribute). The panels are hidden below 768 px, so phones no longer
  download them.
- Home head code: hero preloads with `fetchpriority="high"`, one per
  breakpoint (phone hero card ≤ 767 px, right panel ≥ 768 px), and a
  preconnect to the font host.
- Fonts: Inter (345 → 89 KB), Inter Italic (379 → 98 KB) and Instrument
  Serif (TTF 35 → 25 KB WOFF2) replaced with Latin subsets (U+0000–017F,
  punctuation, arrows, €, ™, ≤ ≥; default OpenType features + tnum, case;
  both variable axes kept). Screenshots of 5 pages × 2 widths: text
  renders the same. Originals: `docs/handoff/rollback/fonts-2026-10-20/`.
- Service cards (Branding, UI/UX): 4000 px JPGs (320 / 136 KB, no srcset)
  → 1600 px WebP (85 / 32 KB).
- `finsweet.ts`: attributes start when their elements are within two
  screens, or on first input. On Home, the list nest fetched 7 case-study
  pages (343 KB) at load.
- Site head (loader piece 1): preconnect to GitHub Pages, whose stylesheet
  (Embed 2a) blocks rendering on every domain.

Tried and reverted: preloading the Inter file (mobile 93 → 82, FCP
3.3 s; see GOTCHAS); a custom `sizes` on the hero panels (rejected).

Still in the way of 95 (mobile FCP 2.2 s is the limit): the document
itself (76 KB compressed, 2,870 elements), the render-blocking GitHub
Pages stylesheet, lazy images within the browser's lazy margin (client
logos, case-study images), and on live the tags' blocking time. Open:
MANUAL-TODO K (hero panel sizes) and L (HubSpot ads pixel).

Raw reports: scratchpad only (not committed).
