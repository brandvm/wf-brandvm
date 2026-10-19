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

### 2026-10-19 · `wf:perf --live` measured staging, not the live domain
- Area: perf
- Scope: template-candidate
- Symptom: the `webflow-audit` skill says `pnpm wf:perf --live`, but
  `perf.mjs` (template 0.6.0) chose its base URL from `--prototype` or
  `stagingUrl` only, so `--live` was silently ignored.
- Cause: `perf.mjs` never read `liveUrl`; the other scripts (`seo`,
  `parity`, `install`) do.
- Fix: `perf.mjs` uses `liveUrl` with `--live`, and exits if it is missing,
  matching `seo.mjs`.
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
