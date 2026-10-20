// Hands an IX3 interaction over from Webflow's runtime to a repo module.
//
// Webflow's IX3 instance (Webflow.require('ix3').getInstance()) has a
// remove(ids) that unbinds just those interactions, kills their
// ScrollTriggers and clears the inline styles they wrote, leaving every
// other interaction and other ScrollTriggers (orbit.ts) alone. destroy()
// would not: it kills every ScrollTrigger on Webflow's copy of GSAP.
//
// IX3 starts after webflow.js and loads its interactions around window
// load, binding them over a few frames, so the bundle may run first. Wait
// until the page has loaded and the instance's interaction count has held
// for 3 frames (a remove() during loading is undone by the bindings still
// to come), remove, then build in the same frame so nothing paints between
// IX3's start state and the repo's. Give up after WAIT_MS and build anyway.
//
// Only while Webflow still publishes these interactions (the flag phase).
// At a family's cutover its module calls build directly: waiting for load
// would show content before its start state.
type Ix3Instance = { interactions?: Map<string, unknown>; remove(ids: string[]): void };
type Ix3Module = { getInstance?: () => Ix3Instance | null | undefined };

const WAIT_MS = 6000;

// The bundle loads async and can run before webflow.js, so ask only after
// Webflow's ready queue runs. A page without IX3 registers no 'ix3' module.
function ix3Module(): Ix3Module | null {
  try {
    const webflow = window.Webflow as unknown as { require?: (name: string) => Ix3Module | undefined };
    return webflow?.require?.('ix3') ?? null;
  } catch (error) {
    return null;
  }
}

export function takeOverFromIx3(ids: string[], build: () => void) {
  const start = performance.now();
  let lastSize = -1;
  let steady = 0;
  const attempt = () => {
    const mod = ix3Module();
    const ix3 = mod?.getInstance?.();
    const size = ix3?.interactions?.size ?? 0;
    steady = size && size === lastSize ? steady + 1 : 0;
    lastSize = size;
    if (ix3 && size && steady >= 3 && document.readyState === 'complete') {
      const present = ids.filter((id) => ix3.interactions!.has(id));
      if (present.length) ix3.remove(present);
      build();
    } else if (mod && performance.now() - start < WAIT_MS) {
      requestAnimationFrame(attempt);
    } else {
      build();
    }
  };
  // Same queue as index.ts: webflow.js runs what was pushed before it.
  window.Webflow = window.Webflow || ([] as unknown as NonNullable<Window['Webflow']>);
  if (typeof window.Webflow.push === 'function') window.Webflow.push(attempt);
  else attempt();
}
