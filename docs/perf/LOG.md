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
