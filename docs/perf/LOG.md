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
