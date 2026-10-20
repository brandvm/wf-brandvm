# Latin-subset site fonts (2026-10-20)

The four font files installed in Webflow on 2026-10-20 (Home performance
work, docs/perf/LOG.md). Originals: `docs/handoff/rollback/fonts-2026-10-20/`.

Made with fonttools (`pyftsubset`), both variable axes (opsz, wght) kept:

```
--unicodes="U+0000-017F,U+0192,U+02BB-02BC,U+02C6-02C7,U+02D8-02DD,U+0300-0308,U+0327,U+0329,U+2000-206F,U+20AC,U+20B9,U+2113,U+2122,U+2190-2199,U+2212,U+2215,U+2248,U+2260,U+2264-2265,U+FEFF,U+FFFD"
--layout-features+=tnum,case --flavor=woff2
```

| File | Original | Subset |
| --- | --- | --- |
| InterVariable.woff2 | 345 KB | 89 KB |
| InterVariable-Italic.woff2 | 379 KB | 98 KB |
| InstrumentSerif-Italic.woff2 | 69 KB TTF | 25 KB |
| InstrumentSerif-Regular.woff2 | 68 KB TTF | 24 KB |

Characters outside these ranges (Cyrillic, Greek, Vietnamese, CJK) fall
back to the next font in the stack.
