// Stage 4, step 1: decode every published IX3 interaction into
// src/interactions/spec.json, the input the ix-*.ts modules replay.
//
//   node scripts/ix3-spec.mjs            # from staging (brandvm.webflow.io)
//   node scripts/ix3-spec.mjs --site https://www.brandvm.com
//
// The published page chunks (webflow.<hash>.js) carry IX3 as plain JS
// literals: [{id:"i-…"}] interactions and [{id:"t-…"}] timelines. The
// chunk differs per page, so this reads every page in the sitemap (posts:
// the first 3, they share one template), decodes each distinct chunk with a
// tokenizer (nothing downloaded is executed) and merges them. Re-run after
// any IX3 change in Webflow; the diff of spec.json shows what changed.
//
// Facts the replay depends on (lessons/js.md "Moving off IX3", checked
// against the MCP's get_interaction on 2026-10-20):
//   - a step with no duration was published without the default 0.5s
//     (the MCP shows 0.5 for the same step); no ease means power1.out;
//   - tt: 0 to, 1 from, 2 fromTo, 3 set; a null end means the current value;
//   - actions marked hidden in the Designer are not published at all.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const site = arg('site', 'https://brandvm.webflow.io').replace(/\/$/, '');
const out = path.join(root, arg('out', 'src/interactions/spec.json'));

// Names from the MCP (data_interactions_tool list_interactions, 2026-10-20);
// the published chunk carries ids only.
const NAMES = {
  'i-068fbd43': 'Section Header Image',
  'i-258e7f03': 'Scroll | Section All',
  'i-568fa951': 'Process | Scroll',
  'i-56b2e49c': 'Who We Are Scroll',
  'i-59a7ff74': 'Career | Join Visual',
  'i-6bcd2f36': 'Project Link Hover',
  'i-746dfbf2': 'Scroll Services Tabs Menu',
  'i-76d04031': 'Scroll Case Next',
  'i-7a4acb26': 'Project | Cursor Move',
  'i-87ce1b77': 'RM Visual Scroll',
  'i-89ad4574': 'Scroll | Section Header',
  'i-a2f3343f': 'Scroll Team Cards',
  'i-ba5fa9bd': 'Scroll - About Method',
  'i-f0bb438b': 'Process Scroll | Mobile',
  'i-fa832f3a': 'Page Load | Home',
};
// Which repo module replays it (MIGRATION-PLAN Stage 4).
const MODULE = { 'wf:scroll': 'ix-scroll', 'wf:hover': 'ix-pointer', 'wf:mouse-move': 'ix-pointer', 'wf:load': 'ix-load' };
// IX3's ease table: index → GSAP name.
const EASES = ['none'];
for (const n of ['power1', 'power2', 'power3', 'power4']) EASES.push(`${n}.in`, `${n}.out`, `${n}.inOut`);
// Webflow breakpoints as media queries.
const BREAKPOINTS = {
  main: '(min-width: 992px)',
  medium: '(min-width: 768px) and (max-width: 991px)',
  small: '(min-width: 480px) and (max-width: 767px)',
  tiny: '(max-width: 479px)',
};
const TT = ['to', 'from', 'fromTo', 'set'];

// ---- decode -------------------------------------------------------------
function balanced(s, i) {
  let depth = 0;
  let quote = null;
  for (let j = i; j < s.length; j++) {
    const c = s[j];
    if (quote) {
      if (c === '\\') j++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'" || c === '`') quote = c;
    else if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') {
      if (--depth === 0) return s.slice(i, j + 1);
    }
  }
  throw new Error('unbalanced literal');
}

const TOKEN = /\s+|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|!0|!1|-?\d*\.?\d+(?:e[-+]?\d+)?|[A-Za-z_$][\w$]*|[[\]{}:,]/y;
function literalToJson(src) {
  const parts = [];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < src.length) {
    const at = TOKEN.lastIndex;
    const m = TOKEN.exec(src);
    if (!m) throw new Error(`unexpected token at ${at}: ${src.slice(at, at + 40)}`);
    let t = m[0];
    if (/^\s/.test(t)) continue;
    if (t === '!0') t = 'true';
    else if (t === '!1') t = 'false';
    else if (t[0] === "'") t = JSON.stringify(t.slice(1, -1).replace(/\\'/g, "'"));
    else if (/^-?\.\d/.test(t)) t = t.replace('.', '0.');
    else if (/^[A-Za-z_$]/.test(t) && !['true', 'false', 'null'].includes(t)) {
      if (!/^\s*:/.test(src.slice(TOKEN.lastIndex))) throw new Error(`identifier value ${t}`);
      t = JSON.stringify(t);
    }
    parts.push(t);
  }
  return JSON.parse(parts.join(''));
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}
async function pool(items, size, fn) {
  const results = [];
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]).catch((error) => ({ error }));
    }
  }));
  return results;
}

const sitemap = await fetchText(`${site}/sitemap.xml`);
const all = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const urls = [...all.filter((u) => !/\/post\//.test(u)), ...all.filter((u) => /\/post\//.test(u)).slice(0, 3)];
console.log(`ix3-spec: ${urls.length} pages from ${site}`);

const chunkPages = new Map();
const ix3Chunks = [];
const htmlOf = new Map();
await pool(urls, 12, async (url) => {
  const html = await fetchText(url.replace(/^https?:\/\/[^/]+/, site));
  const pagePath = new URL(url).pathname.replace(/\/$/, '') || '/';
  htmlOf.set(pagePath, html);
  for (const m of html.matchAll(/https:\/\/cdn\.prod\.website-files\.com\/[^"]+\/js\/webflow\.[0-9a-f]{8}\.[0-9a-f]+\.js/g)) {
    if (!chunkPages.has(m[0])) chunkPages.set(m[0], new Set());
    chunkPages.get(m[0]).add(pagePath);
  }
});

const interactions = new Map();
const timelines = new Map();
const pagesOf = new Map();
for (const [url, pages] of chunkPages) {
  const js = await fetchText(url);
  const i = js.indexOf('[{id:"i-');
  if (i < 0) continue;
  ix3Chunks.push({ file: url.split('/').pop(), pages: pages.size });
  const list = literalToJson(balanced(js, i));
  const tls = literalToJson(balanced(js, js.indexOf('[{id:"t-')));
  for (const x of list) {
    const seen = interactions.get(x.id);
    if (seen && JSON.stringify(seen) !== JSON.stringify(x)) console.warn(`ix3-spec: ${x.id} differs between chunks`);
    interactions.set(x.id, x);
    if (!pagesOf.has(x.id)) pagesOf.set(x.id, new Set());
    pages.forEach((p) => pagesOf.get(x.id).add(p));
  }
  for (const t of tls) timelines.set(t.id, t);
}

// Pages whose published HTML has the trigger element: every class of a
// class trigger in one class attribute, or the attribute selector's text.
function pagesWith(tgt) {
  if (!tgt) return null;
  const [kind, value] = tgt;
  const test = kind === 'wf:class'
    ? (html) => value.some((v) => {
        const names = v.split('.');
        return [...html.matchAll(/class="([^"]*)"/g)].some((m) => names.every((n) => m[1].split(/\s+/).includes(n)));
      })
    : kind === 'wf:attribute'
      ? (html) => html.includes(value.slice(1, -1).replace(/"/g, '"'))
      : null;
  if (!test) return null;
  return [...htmlOf].filter(([, html]) => test(html)).map(([p]) => p).sort();
}

// ---- normalize ----------------------------------------------------------
// "section.s-rm-intro" is a combo class: .section.s-rm-intro
const cls = (names) => names.map((n) => `.${n}`).join(', ');
function selector([kind, value]) {
  if (kind === 'wf:class') return cls(value);
  if (kind === 'wf:attribute' || kind === 'wf:selector') return value;
  if (kind === 'wf:trigger-only') return ':trigger';
  if (kind === 'wf:viewport') return ':viewport';
  throw new Error(`unknown target ${kind}`);
}
function target(t) {
  const [, , options = {}] = t;
  return { selector: selector(t), within: options.relationship === 'within' };
}
function ease(e) {
  if (e === undefined) return 'power1.out';
  if (typeof e === 'number') return EASES[e] ?? `ix3-ease-${e}`;
  if (e.type === 'customEase') return { custom: e.bezierCurve.trim() };
  return e;
}
function action(a) {
  const t = a.timing ?? {};
  const props = {};
  for (const [, group] of Object.entries(a.properties ?? {})) {
    for (const [prop, value] of Object.entries(group)) {
      if (value === null) continue;
      const pct = (v) => (prop === 'opacity' && typeof v === 'string' && v.endsWith('%') ? parseFloat(v) / 100 : v);
      props[prop] = Array.isArray(value) ? value.map(pct) : [null, pct(value)];
    }
  }
  return {
    id: a.id,
    targets: a.targets.map(target),
    type: TT[a.tt ?? 0],
    duration: t.duration ?? 0.5,
    ...(t.position !== undefined && { position: t.position }),
    ...(t.stagger && { stagger: t.stagger }),
    ease: ease(t.ease),
    props,
  };
}
function trigger([kind, config, tgt]) {
  const out = { type: kind, ...(tgt && { target: target(tgt) }) };
  if (config.scrollTriggerConfig) {
    const { clamp, start, end, scrub, enter, leave, enterBack, leaveBack } = config.scrollTriggerConfig;
    Object.assign(out, { clamp, start, end, scrub, actions: [enter, leave, enterBack, leaveBack].join(' ') });
  }
  if (config.control) out.control = config.control;
  if (config.speed) out.speed = config.speed;
  if (config.pluginConfig) out.plugin = config.pluginConfig;
  return out;
}

const spec = [...interactions.values()].sort((a, b) => a.id.localeCompare(b.id)).map((x) => {
  const off = (x.conditionalPlayback ?? []).filter((c) => c.type === 'breakpoint' && c.behavior === 'dont-animate');
  const pages = [...pagesOf.get(x.id)].sort();
  const usedOn = pagesWith(x.triggers[0][2]);
  return {
    id: x.id,
    name: NAMES[x.id] ?? x.id,
    module: MODULE[x.triggers[0][0]] ?? 'unknown',
    scope: x.scope.type === 'pages' ? 'pages' : x.scope.type,
    ...(x.scope.componentId && { componentId: x.scope.componentId }),
    loadsOn: x.scope.type === 'pages' ? pages : x.scope.type,
    ...(usedOn && { usedOn }),
    triggers: x.triggers.map(trigger),
    ...(off.length && { offAt: off.flatMap((c) => c.breakpoints.map((b) => BREAKPOINTS[b])) }),
    timelines: x.timelineIds.map((id) => {
      const tl = timelines.get(id);
      return {
        id,
        ...(tl.triggerMetadata?.role && { role: tl.triggerMetadata.role }),
        actions: (tl.actions ?? []).map(action),
      };
    }),
  };
});

const missing = spec.filter((x) => !NAMES[x.id]).map((x) => x.id);
if (missing.length) console.warn(`ix3-spec: new interactions without a name: ${missing.join(', ')}`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({
  source: `${site} published webflow.*.js chunks (scripts/ix3-spec.mjs)`,
  chunks: ix3Chunks.sort((a, b) => b.pages - a.pages),
  interactions: spec,
}, null, 2) + '\n');
console.log(`ix3-spec: ${spec.length} interactions → ${path.relative(root, out)}`);
