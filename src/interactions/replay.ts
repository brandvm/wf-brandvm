// Builds GSAP timelines from the decoded IX3 data (runtime.json, written by
// scripts/ix3-spec.mjs). Shared by ix-scroll.ts and ix-pointer.ts.
//
// Mapping, read from IX3's own runtime (webflow.schunk, buildTweensForAction,
// 2026-10-20) where it differs from lessons/js.md:
//   - type to / from / fromTo / set, [from, to] with null = the current value;
//   - an action with no position starts at 0 (timing.position ?? 0), it is
//     NOT appended; a position is absolute, in seconds;
//   - no duration is 0.5s, no ease is GSAP's default (power1.out);
//   - an action with no properties is skipped (it adds no time);
//   - every tween has force3D: true;
//   - custom eases are SVG paths in a 160 box, y down, which CustomEase
//     reads as they are.
import { gsap, CustomEase } from '../lib/gsap';
import runtime from './runtime.json';

export type Target = { selector: string; within: boolean };
export type Action = {
  id: string;
  targets: Target[];
  type: 'to' | 'from' | 'fromTo' | 'set';
  duration: number;
  position?: number;
  stagger?: { each?: number; amount?: number; grid?: string };
  ease: string | { custom: string };
  props: Record<string, [unknown, unknown]>;
};
export type Timeline = { id: string; role?: string; actions: Action[] };
export type Trigger = {
  type: string;
  target?: Target;
  clamp?: boolean;
  start?: string;
  end?: string;
  scrub?: number | null;
  actions?: string;
  control?: string;
  speed?: number;
  plugin?: { smoothness?: number; restingState?: { x: number; y: number }; hover?: string };
};
export type Interaction = {
  id: string;
  name: string;
  module: string;
  media?: string;
  triggers: Trigger[];
  timelines: Timeline[];
};

export const interactions = runtime as Interaction[];
export const forModule = (name: string) => interactions.filter((x) => x.module === name);

const customEases = new Map<string, string>();
function ease(value: Action['ease']) {
  if (typeof value === 'string') return value;
  let name = customEases.get(value.custom);
  if (!name) {
    name = `ix3-${customEases.size + 1}`;
    CustomEase.create(name, value.custom);
    customEases.set(value.custom, name);
  }
  return name;
}

// The elements an action animates: the trigger element itself, its
// descendants (within), or anywhere on the page.
export function resolve(targets: Target[], trigger: Element | null) {
  const out: Element[] = [];
  for (const t of targets) {
    if (t.selector === ':trigger') {
      if (trigger) out.push(trigger);
    } else if (t.within && trigger) {
      out.push(...Array.from(trigger.querySelectorAll(t.selector)));
    } else {
      out.push(...Array.from(document.querySelectorAll(t.selector)));
    }
  }
  return out;
}

export function buildTimeline(timeline: Timeline, trigger: Element | null, vars: gsap.TimelineVars = {}) {
  const tl = gsap.timeline(vars);
  for (const action of timeline.actions) {
    const at = action.position ?? 0;
    const keys = Object.keys(action.props);
    if (!keys.length) continue;
    const els = resolve(action.targets, trigger);
    if (!els.length) continue;
    const from: gsap.TweenVars = {};
    const values: gsap.TweenVars = {};
    for (const key of keys) {
      const [a, b] = action.props[key];
      if (a !== null && a !== undefined) from[key] = a;
      if (b !== null && b !== undefined) values[key] = b;
    }
    const timing: gsap.TweenVars = {
      force3D: true,
      duration: action.duration,
      ease: ease(action.ease),
      ...(action.stagger && { stagger: action.stagger as gsap.StaggerVars }),
    };
    const to = { ...values, ...timing };
    if (action.type === 'set') tl.set(els, { ...from, ...values, force3D: true }, at);
    else if (action.type === 'from') tl.from(els, { ...from, ...timing }, at);
    else if (action.type === 'fromTo') tl.fromTo(els, from, to, at);
    else tl.to(els, to, at);
  }
  return tl;
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
