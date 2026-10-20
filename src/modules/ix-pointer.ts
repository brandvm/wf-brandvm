// IX3 pointer interactions, replayed with bundled GSAP (Stage 4):
//   - "Project Link Hover" (i-6bcd2f36): entering any .project-overlay-link
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
// On everywhere since the IX3 deletion (2026-10-20, MANUAL-TODO H).
import { gsap } from '../lib/gsap';
import { repoInteractions } from './ix-flag';
import { takeOverFromIx3 } from '../interactions/ix3-bridge';
import { buildTimeline, forModule, reducedMotion, type Interaction } from '../interactions/replay';

export function initIxPointer() {
  if (!repoInteractions()) return;
  const list = forModule('ix-pointer');
  takeOverFromIx3(list.map((x) => x.id), () => list.forEach(build));
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
  const links = Array.from(document.querySelectorAll(enter.target.selector));
  if (!links.length) return;
  const tl = buildTimeline(ix.timelines[0], null, { paused: true });
  if (reducedMotion()) tl.duration(0.001);
  const speed = leave?.speed ?? 1;
  links.forEach((link) => {
    link.addEventListener('mouseenter', () => tl.timeScale(1).play());
    if (leave) link.addEventListener('mouseleave', () => tl.timeScale(speed).reverse());
  });
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
