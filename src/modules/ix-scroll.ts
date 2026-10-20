// IX3 scroll interactions, replayed with bundled GSAP + ScrollTrigger
// (Stage 4). Covers the 12 "wf:scroll" interactions in
// src/interactions/runtime.json: Section Header, Section All, Section Header
// Image, Process (desktop and mobile), Services Tabs Menu, Who We Are, Team
// Cards, About Method, Career Join, Case Next, RM Visual.
//
// Each matching trigger element gets its own timeline and ScrollTrigger,
// with IX3's start/end, clamp (both ends) and scrub; a trigger without scrub
// plays once on enter ("play none none none"), as IX3's do. Breakpoints
// where Webflow turned an interaction off become a gsap.matchMedia query,
// so resizing across one reverts or rebuilds it.
//
// Built lazily: elements within two screens of the viewport at start are
// built at once (before the first paint after boot, so nothing flashes);
// the rest when they come within a screen, with one ScrollTrigger.refresh()
// per frame of builds (a from-state can change layout, e.g. the tabs menu's
// height). Hidden elements (no layout box) also wait: the case-study
// template has 78 .case-next-main blocks and shows one after load, and a
// trigger measured while hidden gets start = end = 0 for good.
//
// Like IX3's own bodyResizeObserver, a change in the page's height (lazy
// images, content shown after load) re-measures every trigger, debounced,
// and re-scans for trigger elements: Finsweet List re-renders the
// case-study "next" list after load, replacing the nodes first seen.
//
// prefers-reduced-motion: play-once reveals are skipped (the content shows
// in its final state); scroll-linked ones keep tracking the scroll, without
// the smoothing lag.
//
// Replaced Webflow's IX3 on 2026-10-20 (IX3 deleted, release 1.4.1).
import { gsap, ScrollTrigger } from '../lib/gsap';
import { buildTimeline, forModule, reducedMotion, type Interaction } from '../interactions/replay';

export function initIxScroll() {
  build(forModule('ix-scroll'));
}

let refreshQueued = false;
function queueRefresh() {
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    ScrollTrigger.refresh();
  });
}

// Re-scans run after the page changes height (lazy images, Finsweet List
// re-rendering a CMS list, content shown after load) and on window load.
const rescans: Array<() => void> = [];

function build(list: Interaction[]) {
  const reduce = reducedMotion();
  const mm = gsap.matchMedia();
  for (const ix of list) {
    const trigger = ix.triggers[0];
    if (!trigger.target) continue;
    const selector = trigger.target.selector;
    const scrub = trigger.scrub ?? false;
    if (reduce && !scrub) continue;
    if (!document.querySelector(selector)) continue;
    const pos = (value?: string) => (value && trigger.clamp ? `clamp(${value})` : value);

    mm.add(ix.media ?? 'all', (context) => {
      // Elements already built or being watched in this media context. A
      // list re-render replaces the nodes, so elements are looked up again
      // on every scan instead of being held from the first one.
      const seen = new WeakSet<Element>();
      let active = true;
      const make = (el: Element) => {
        for (const timeline of ix.timelines) {
          const tl = buildTimeline(timeline, el, { paused: true });
          ScrollTrigger.create({
            id: `wfc_${ix.id}`,
            trigger: el,
            start: pos(trigger.start),
            end: pos(trigger.end),
            animation: tl,
            scrub: reduce ? true : scrub,
            toggleActions: trigger.actions ?? 'play none none none',
          });
        }
      };
      const near = (el: Element) => {
        if (!el.getClientRects().length) return false;
        const r = el.getBoundingClientRect();
        return r.top < innerHeight * 2 && r.bottom > -innerHeight;
      };
      const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || !entry.target.isConnected) continue;
          io.unobserve(entry.target);
          context.add(() => make(entry.target));
          queueRefresh();
        }
      }, { rootMargin: '100% 0px' });
      const scan = (now: boolean) => {
        if (!active) return;
        document.querySelectorAll(selector).forEach((el) => {
          if (seen.has(el)) return;
          seen.add(el);
          if (now && near(el)) make(el);
          else io.observe(el);
        });
      };
      // First scan in this task: nothing in view paints before its start
      // state. Later scans only observe; the observer builds what is near.
      scan(true);
      const rescan = () => context.add(() => scan(false));
      rescans.push(rescan);
      return () => {
        active = false;
        io.disconnect();
        rescans.splice(rescans.indexOf(rescan), 1);
      };
    });
  }
  queueRefresh();
  watchPageHeight();
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => rescans.forEach((f) => f()), { once: true });
  }
}

let resizeTimer = 0;
let lastHeight = 0;
let watching = false;
function watchPageHeight() {
  if (watching || typeof ResizeObserver === 'undefined') return;
  watching = true;
  lastHeight = document.body.scrollHeight;
  new ResizeObserver(() => {
    const height = document.body.scrollHeight;
    if (Math.abs(height - lastHeight) < 2) return;
    lastHeight = height;
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      rescans.forEach((f) => f());
      queueRefresh();
    }, 200);
  }).observe(document.body);
}
