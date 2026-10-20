# Status

Every request in the brief's own words, with its state. States: not
started, in progress, on staging, live, dropped (and why).

| # | Request (your wording) | State | Stage | Date |
| --- | --- | --- | --- | --- |
| 1 | "make new repo brandvision in Github from wf-template" | done: `brandvm/wf-brandvm` (the name `brandvision` is taken by the Astro prototype; you chose `wf-brandvm`) | 0 | 2026-10-19 |
| 2 | "stage 1 should be make a plan based on lessons and skills in wf-template to migrate current website code and behind the scenes as to follow wf-template" | plan approved 2026-10-19; Stage 1 done; Webflow backup and branch protection in place; open: Flowbase install location | 1 | 2026-10-19 |
| 3 | "make new repo when used in website work as it is currently visually and functionally but still keeping it optimizable" | live: `wf-brandvm@1.3.0` on www.brandvm.com (Stage 2 parity + Stage 3 batches 3.1–3.3; 3.4 Posts schema stays in Webflow, D4b) | 2–3 | 2026-10-19 |
| 4 | "Save all pages HD screenshot of current state of website, CMS template pages can use only two screenshots" | done: 50 pages × desktop @2x + mobile @3x, `Brand Vision/screenshots/2026-10-19-live/` | 0 | 2026-10-19 |
| 5 | "see which sections/elements/components/etc. are same or similar can be optimized by reducing the use of classes, component types, etc." (not a goal in itself) | analysis done (`AUDIT.md` › Similarity); waiting on your Figma review | 6 | 2026-10-19 |
| 6 | "In Figma … mark the plan for this in website screenshot … make a new page in that file" | done: page "Migration & Optimization Plan — 2026-10-19", 19 pages covering all 45 section types; waiting on your review | 0 | 2026-10-19 |
| 7 | "moving all IX, IX2 and IX3 animation/interaction to repo so I can delete all Webflow's animation and interaction" | on staging: every IX2 and IX3 interaction deleted in Webflow and GSAP turned off (Kajal, 2026-10-20); the repo versions (nav, FAQ, S HUB, filter, C-drop, 12 scroll + 2 pointer, orbit on bundled GSAP) run without a flag. Live with the next release + production publish (MANUAL-TODO I). Home hero intro (E) still waits for its Webflow build | 4 | 2026-10-20 |
| 8 | "keep a track of pagespeed score after every major improvement" | in progress: `docs/perf/LOG.md` has baseline, Stage 2, 3.1/3.2 and 3.3 (10 pages, 5 runs each); open: Work desktop 83 → 76 to re-measure, mobile LCP two-mode | all | 2026-10-19 |

