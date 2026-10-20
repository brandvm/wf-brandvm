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
// built at once (in the same task as IX3's removal, so nothing flashes);
// the rest when they come within a screen, with one ScrollTrigger.refresh()
// per frame of builds (a from-state can change layout, e.g. the tabs menu's
// height).
//
// prefers-reduced-motion: play-once reveals are skipped (the content shows
// in its final state); scroll-linked ones keep tracking the scroll, without
// the smoothing lag.
//
// On everywhere since the IX3 deletion (2026-10-20, MANUAL-TODO H).
import { gsap, ScrollTrigger } from '../lib/gsap';
import { repoInteractions } from './ix-flag';
import { takeOverFromIx3 } from '../interactions/ix3-bridge';
import { buildTimeline, forModule, reducedMotion, type Interaction } from '../interactions/replay';

export function initIxScroll() {
  if (!repoInteractions()) return;
  const list = forModule('ix-scroll');
  takeOverFromIx3(list.map((x) => x.id), () => build(list));
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

function build(list: Interaction[]) {
  const reduce = reducedMotion();
  const mm = gsap.matchMedia();
  for (const ix of list) {
    const trigger = ix.triggers[0];
    if (!trigger.target) continue;
    const scrub = trigger.scrub ?? false;
    if (reduce && !scrub) continue;
    const elements = Array.from(document.querySelectorAll(trigger.target.selector));
    if (!elements.length) continue;
    const pos = (value?: string) => (value && trigger.clamp ? `clamp(${value})` : value);

    mm.add(ix.media ?? 'all', (context) => {
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
        const r = el.getBoundingClientRect();
        return r.top < innerHeight * 2 && r.bottom > -innerHeight;
      };
      const later = elements.filter((el) => {
        if (!near(el)) return true;
        make(el);
        return false;
      });
      if (!later.length) return;
      const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target);
          context.add(() => make(entry.target));
          queueRefresh();
        }
      }, { rootMargin: '100% 0px' });
      later.forEach((el) => io.observe(el));
      return () => io.disconnect();
    });
  }
  queueRefresh();
}
