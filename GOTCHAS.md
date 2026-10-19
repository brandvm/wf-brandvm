# Gotchas

A running log of things that cost time on this project. Agents read it at
the start of every session and add to it when they hit something new (see
the Session protocol in `AGENTS.md`). Never delete an entry — update its
`Status` instead.

Lessons from earlier builds are in the skill, not here:
`.claude/skills/webflow-build/lessons/` (one file per area). Read the file
for the area you work in. Entries tagged `Scope: template-candidate` are
collected from client repos into those files.

## Entry format

```md
### YYYY-MM-DD · Short title
- Area: designer | css | loader | release | mcp | ci | js | perf
- Scope: project | template-candidate
- Symptom: what was observed
- Cause: why it happened
- Fix: what was done, or the workaround
- Status: open | fixed <sha> | upstreamed wf-template <sha>
- Found by: claude | codex | human
```

## This project

<!-- Add new entries here, newest first. -->

### 2026-10-19 · `wf:baseline compare` flagged every page as changed
- Area: perf
- Scope: template-candidate
- Symptom: with no change on the site, `compare` reported CHANGED on 27 of
  30 page/width pairs at 0.0% pixels, e.g. "height 9982→9754".
- Cause: it compared the saved PNG's height (the full page after
  scrolling) with `scrollHeight` measured before scrolling. Pages that grow
  as lazy content and scroll reveals load always differ.
- Fix: compare the new screenshot's PNG height with the saved PNG's.
  Afterwards only real pixel changes are flagged (noise floor in AUDIT.md).
- Status: fixed in this repo; to upstream to wf-template
- Found by: claude

### 2026-10-19 · `wf:* --live` measured staging, not the live domain
- Area: perf
- Scope: template-candidate
- Symptom: the `webflow-audit` skill runs every check with `--live`, but in
  template 0.6.0 only `seo`, `parity` and `install` read `liveUrl`.
  `perf`, `baseline`, `outline`, `a11y`, `links`, `html`, `film` and the
  rest built URLs from `stagingUrl`. With `--live` they only stopped
  swapping in the local bundle, so they checked `*.webflow.io`, not the
  custom domain.
- Cause: in `lib.mjs`, `--live` meant "the deployed bundle" (written
  before sites had a custom domain), while the audit skill means "the live
  domain".
- Fix: `perf.mjs` uses `liveUrl` with `--live`; `lib.mjs` `loadConfig()`
  points `stagingUrl` at `liveUrl` when `--live` is passed and `liveUrl`
  is set, so every script follows.
- Status: fixed in this repo; to upstream to wf-template
- Found by: claude

### 2026-10-19 · Keyless PageSpeed Insights API quota is shared and runs out
- Area: perf
- Scope: template-candidate
- Symptom: the first PSI API call of the day returned HTTP 429 "Queries per
  day" without a key.
- Cause: keyless requests share a small daily quota.
- Fix: use a PSI API key (`PSI_KEY` in `.env`, never committed) for PSI
  numbers; `pnpm wf:perf --live` (local Lighthouse) needs no key.
- Status: open (waiting for a key)
- Found by: claude

### 2026-10-19 · Live runs brandvm/brandvm 1.1.1, not the 1.1.2 the old repo records
- Area: release
- Scope: project
- Symptom: `brandvm/brandvm` README, AGENTS and `loader.html` say v1.1.2 is
  in production; the published footer code and config Embed load `@1.1.1`.
- Cause: the 1.1.2 snippets were never pasted/published in Webflow.
- Fix: decision D2 in `docs/handoff/DECISIONS.md`.
- Status: open
- Found by: claude
