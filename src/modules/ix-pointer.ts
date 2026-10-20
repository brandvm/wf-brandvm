// IX3 pointer interactions, replayed with bundled GSAP (Stage 4):
//   - "Project Link Hover" (i-6bcd2f36): entering any .project-overlay-link
//     (delegated, so re-rendered list items work)
//     scales the page's one .project-link-cursor 0 → 1 (0.4s); leaving plays
//     it back at 3× speed.
//   - "Project | Cursor Move" (i-7a4acb26), desktop only: the cursor follows
//     the pointer across the viewport (x −50vw → 50vw, y −50vh → 50vh), as
//     IX3 does it: each axis is a paused timeline whose progress is the
//     pointer's position, smoothed with quickTo (smoothness 240 → 0.24s,
//     power2.out), and back to the resting point (50%, 50%) when the pointer
//     leaves the window. IX3's longer catch-up tween on the first move after
//     a leave is not reproduced (the cursor is hidden until a hover anyway).
//
// prefers-reduced-motion: the cursor still follows the pointer and still
// appears on hover (both are driven by the visitor), without smoothing.
//
// Replaced Webflow's IX3 on 2026-10-20 (IX3 deleted, release 1.4.1).
import { gsap } from '../lib/gsap';
import { buildTimeline, forModule, reducedMotion, type Interaction } from '../interactions/replay';

export function initIxPointer() {
  forModule('ix-pointer').forEach(build);
}

function build(ix: Interaction) {
  const trigger = ix.triggers[0];
  if (trigger.type === 'wf:hover') hover(ix);
  else if (trigger.type === 'wf:mouse-move') gsap.matchMedia().add(ix.media ?? 'all', () => follow(ix));
}

function hover(ix: Interaction) {
  const enter = ix.triggers.find((t) => t.control === 'play');
  const leave = ix.triggers.find((t) => t.control === 'reverse');
  if (!enter?.target) return;
  const selector = enter.target.selector;
  if (!document.querySelector(selector)) return;
  const tl = buildTimeline(ix.timelines[0], null, { paused: true });
  if (reducedMotion()) tl.duration(0.001);
  const speed = leave?.speed ?? 1;
  // Delegated, so links that Finsweet List (or any re-render) adds later
  // work too: mouseover/mouseout bubble, mouseenter/leave don't. Moving
  // between a link's own children doesn't count as entering or leaving.
  const linkOf = (node: EventTarget | null) => (node instanceof Element ? node.closest(selector) : null);
  document.addEventListener('mouseover', (event) => {
    const link = linkOf(event.target);
    if (link && linkOf(event.relatedTarget) !== link) tl.timeScale(1).play();
  });
  if (leave) {
    document.addEventListener('mouseout', (event) => {
      const link = linkOf(event.target);
      if (link && linkOf(event.relatedTarget) !== link) tl.timeScale(speed).reverse();
    });
  }
}

function follow(ix: Interaction) {
  const plugin = ix.triggers[0].plugin ?? {};
  const rest = { x: (plugin.restingState?.x ?? 50) / 100, y: (plugin.restingState?.y ?? 50) / 100 };
  const smoothing = reducedMotion() ? 0 : (plugin.smoothness ?? 50) / 1000;
  const axis = (role: string, start: number) => {
    const timeline = ix.timelines.find((t) => t.role === role);
    if (!timeline) return null;
    const tl = buildTimeline(timeline, null, { paused: true });
    const proxy = { p: start };
    tl.progress(start);
    if (!smoothing) return (p: number) => tl.progress(p);
    const to = gsap.quickTo(proxy, 'p', { duration: smoothing, ease: 'power2.out', onUpdate: () => { tl.progress(proxy.p); } });
    return (p: number) => { to(p); };
  };
  const setX = axis('mouseX', rest.x);
  const setY = axis('mouseY', rest.y);
  if (!setX && !setY) return;
  const clamp = gsap.utils.clamp(0, 1);
  const onMove = (event: PointerEvent) => {
    setX?.(clamp(event.clientX / Math.max(1, innerWidth)));
    setY?.(clamp(event.clientY / Math.max(1, innerHeight)));
  };
  const onLeave = () => {
    setX?.(rest.x);
    setY?.(rest.y);
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('mouseleave', onLeave);
  window.addEventListener('blur', onLeave);
  return () => {
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('mouseleave', onLeave);
    window.removeEventListener('blur', onLeave);
  };
}
