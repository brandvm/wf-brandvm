// Home hero intro (Stage 4). Replaces IX3 "Page Load | Home" (i-fa832f3a)
// and the Home page-footer align script. Ported from the prototype in
// Brand Vision/Experimental/home-hero-preloader/improved/.
//
// Desktop: three windows open from the bottom onto ONE scene image, the
// scene settles 1.25 → 1, then each window wipes to its own panel image
// while the headline lines rise and the copy, CTAs and nav fade up (≈2.5s).
// Phone: the same three windows inside the square hero card, which then
// merge into the card (≈2.2s). Returning visits (this tab), late images
// (> 1.2s) and pages opened mid-scroll get a short fade; reduced motion
// gets an opacity-only fade.
//
// No scroll lock (D1): a scroll attempt during the intro plays the rest at
// 3× instead. The nav and CTAs stay clickable throughout.
//
// Markup contract (Webflow, see MANUAL-TODO "Home hero intro"):
//   section[data-hero]
//     [data-rig="desktop"] / [data-rig="phone"]   panel grids
//       [data-scene-img]                           the one scene image
//       .hero-panels-panel ×3                      the windows
//       .hero-panels-layer-discrete                panel images (desktop)
//     .hero-panels-fader                           legibility gradient
//     h1 [data-hero-line] > span                   one per headline line
//     [data-hero-reveal], [data-hero-cta] > *      copy and CTAs
//     svg clipPath#hero-windows / #hero-windows-phone, 3 empty paths each
//   [data-hero-nav]                                the nav (outside the hero)
// The module does nothing until that markup exists, so it is inert on the
// live Home page while IX3 still animates the hero.
//
// Frame 0 is held by CSS (styles.css §03, "Home hero intro") from first
// paint, keyed on html.w-mod-js, with a 4s CSS failsafe if this bundle
// never runs. html.is-hero-running hands control to GSAP; is-hero-done
// releases every gate rule.
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

const SEEN_KEY = 'bv-hero-intro-seen';
const IMAGE_BUDGET_MS = 1200;
const SCROLL_KEYS = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Spacebar']);

type Box = { x: number; y: number; w: number; h: number; rx: number };
type Rig = {
  name: 'desktop' | 'phone';
  sceneImg: HTMLImageElement | null;
  discrete: HTMLImageElement[];
  windows: { open: number }[];
  merge: { m: number };
  measure(): void;
  draw(): void;
  reset(): void;
  finish(): void;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function roundedRect(x: number, y: number, w: number, h: number, [tl, tr, br, bl]: number[]) {
  if (w <= 0 || h <= 0) return '';
  return `M${x + tl},${y}H${x + w - tr}A${tr},${tr} 0 0 1 ${x + w},${y + tr}V${y + h - br}A${br},${br} 0 0 1 ${x + w - br},${y + h}` +
    `H${x + bl}A${bl},${bl} 0 0 1 ${x},${y + h - bl}V${y + tl}A${tl},${tl} 0 0 1 ${x + tl},${y}Z`;
}

function makeRig(hero: HTMLElement, name: Rig['name'], clipId: string): Rig | null {
  const grid = hero.querySelector<HTMLElement>(`[data-rig="${name}"]`);
  const shapes = Array.from(document.querySelectorAll<SVGPathElement>(`#${clipId} path`));
  if (!grid) return null;
  const panels = Array.from(grid.querySelectorAll<HTMLElement>('.hero-panels-panel'));
  if (!panels.length || shapes.length < panels.length) return null;
  let boxes: Box[] = [];
  let G = { w: 0, h: 0 };
  const rig: Rig = {
    name,
    sceneImg: grid.querySelector<HTMLImageElement>('[data-scene-img]'),
    discrete: Array.from(grid.querySelectorAll<HTMLImageElement>('.hero-panels-layer-discrete')),
    windows: panels.map(() => ({ open: 0 })),
    merge: { m: 0 },
    measure() {
      const g = grid.getBoundingClientRect();
      G = { w: g.width, h: g.height };
      boxes = panels.map((p) => {
        const r = p.getBoundingClientRect();
        return { x: r.left - g.left, y: r.top - g.top, w: r.width, h: r.height, rx: parseFloat(getComputedStyle(p).borderTopLeftRadius) || 0 };
      });
      rig.draw();
    },
    draw() {
      const n = boxes.length;
      const m = rig.merge.m;
      boxes.forEach((b, i) => {
        // Merged target: an equal slice of the grid, overlapping neighbours
        // by 0.5px so no hairline shows.
        const left = (G.w * i) / n - (i > 0 ? 0.5 : 0);
        const right = (G.w * (i + 1)) / n + (i < n - 1 ? 0.5 : 0);
        const x = lerp(b.x, left, m);
        const w = lerp(b.w, right - left, m);
        const h = b.h * rig.windows[i].open;
        const y = b.y + b.h - h;
        const r = Math.min(b.rx, h / 2, w / 2);
        const inner = r * (1 - m);
        const tl = i === 0 ? r : inner;
        const tr = i === n - 1 ? r : inner;
        shapes[i].setAttribute('d', roundedRect(x, y, w, h, [tl, tr, tr, tl]));
      });
    },
    reset() {
      rig.windows.forEach((w) => (w.open = 0));
      rig.merge.m = 0;
      rig.draw();
    },
    finish() {
      rig.windows.forEach((w) => (w.open = 1));
      rig.merge.m = name === 'phone' ? 1 : 0;
      rig.draw();
    },
  };
  rig.measure();
  if ('ResizeObserver' in window) new ResizeObserver(rig.measure).observe(grid);
  return rig;
}

function decoded(imgs: (HTMLImageElement | null)[]) {
  const list = imgs.filter((img): img is HTMLImageElement => !!img);
  const all = Promise.all(list.map((img) => (img.decode ? img.decode().catch(() => undefined) : undefined))).then(() => true);
  const budget = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), IMAGE_BUDGET_MS));
  return Promise.race([all, budget]);
}

export function initHeroIntro() {
  const root = document.documentElement;
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero || root.classList.contains('is-hero-done')) return;
  const done = () => {
    root.classList.remove('is-hero-running');
    root.classList.add('is-hero-done');
  };

  gsap.registerPlugin(CustomEase);
  // The IX3 action's curve, so it still feels like the brand.
  const bv = CustomEase.create('bv', 'M0,0 C0.65,0.045 0,1 1,1');
  const phoneMQ = window.matchMedia('(max-width: 767px)');

  const desktop = makeRig(hero, 'desktop', 'hero-windows');
  const phone = makeRig(hero, 'phone', 'hero-windows-phone');
  const rig = phoneMQ.matches ? phone : desktop;
  const other = rig === phone ? desktop : phone;
  if (!rig) return done();
  if (other) other.finish(); // the hidden rig waits in its end state

  const scene = rig.sceneImg ? [rig.sceneImg] : [];
  const lines = Array.from(hero.querySelectorAll<HTMLElement>('[data-hero-line] > *'));
  const fader = Array.from(hero.querySelectorAll<HTMLElement>('.hero-panels-fader'));
  const nav = document.querySelector<HTMLElement>('[data-hero-nav]');
  const navs = nav ? [nav] : [];
  const allReveals = Array.from(hero.querySelectorAll<HTMLElement>('[data-hero-reveal], [data-hero-cta] > *'));
  // Only the CTA group shown at this breakpoint (hide_tablet / show_tablet).
  const reveals = allReveals.filter((el) => el.offsetParent);
  const content = [...lines, ...fader, ...navs, ...allReveals];

  let seen = false;
  try {
    seen = sessionStorage.getItem(SEEN_KEY) === '1';
  } catch (error) {
    /* storage blocked: treat as a first visit */
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Opened mid-page (anchor link, restored scroll): no intro story.
  const scrolled = window.scrollY > 4 || location.hash.length > 1;

  // Take over from the CSS gate: frame 0 stays as it is, the failsafe stops.
  root.classList.add('is-hero-running');

  const textIn = (tl: gsap.core.Timeline, at: number) => {
    // y: 0 matters: GSAP reads the gate's translateY(110%) as px `y`.
    tl.fromTo(lines, { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out' }, at)
      .fromTo(reveals, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' }, at + 0.25)
      .fromTo(navs, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, at + 0.35);
  };
  const textQuick = (tl: gsap.core.Timeline, duration: number, ease: string) => {
    tl.set(lines, { y: 0, yPercent: 0 }, 0)
      .fromTo([...lines, ...reveals, ...navs], { opacity: 0 }, { opacity: 1, duration, ease }, 0);
  };
  const open = (tl: gsap.core.Timeline, at: number, vars: gsap.TweenVars) =>
    tl.fromTo(rig.windows, { open: 0 }, { open: 1, onUpdate: rig.draw, ...vars }, at);

  const full = (tl: gsap.core.Timeline) => {
    open(tl, 0, { duration: 1.1, stagger: 0.08, ease: bv })
      .fromTo(scene, { opacity: 1, scale: 1.25, xPercent: 0 }, { scale: 1, duration: 2.1, ease: 'power3.out' }, 0)
      .fromTo(rig.discrete, { clipPath: 'inset(0% 0% 0% 100%)', scale: 1.12 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.05, stagger: 0.14, ease: bv }, 1.15)
      .to(scene, { xPercent: -4, duration: 1.4, ease: bv }, 1.15)
      .fromTo(fader, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 1.1);
    textIn(tl, 1.0);
  };
  const short = (tl: gsap.core.Timeline) => {
    tl.set(rig.windows, { open: 1, onComplete: rig.draw }, 0)
      .set(scene, { opacity: 0 }, 0)
      .fromTo(rig.discrete, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 0.7, stagger: 0.06, ease: 'power2.out' }, 0)
      .fromTo(fader, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.1);
    textIn(tl, 0.1);
  };
  const reducedDesktop = (tl: gsap.core.Timeline) => {
    tl.set(scene, { opacity: 0, scale: 1 }, 0)
      .set(rig.windows, { open: 1, onComplete: rig.draw }, 0)
      .fromTo(rig.discrete, { clipPath: 'none', opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 0)
      .set(fader, { opacity: 1 }, 0);
    textQuick(tl, 0.4, 'none');
  };
  const fullPhone = (tl: gsap.core.Timeline) => {
    open(tl, 0, { duration: 0.9, stagger: 0.07, ease: bv })
      .fromTo(scene, { opacity: 1, scale: 1.25, xPercent: 0 }, { scale: 1, duration: 1.7, ease: 'power3.out' }, 0)
      .fromTo(lines, { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out' }, 0)
      .fromTo(rig.merge, { m: 0 }, { m: 1, duration: 0.65, ease: 'power3.inOut', onUpdate: rig.draw }, 1.0)
      .fromTo(reveals, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 1.2)
      .fromTo(navs, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.3);
  };
  const shortPhone = (tl: gsap.core.Timeline, duration = 0.6, ease = 'power2.out') => {
    tl.set(rig.windows, { open: 1 }, 0)
      .set(rig.merge, { m: 1, onComplete: rig.draw }, 0)
      .fromTo(scene, { opacity: 0, scale: 1 }, { opacity: 1, duration, ease }, 0);
    textQuick(tl, duration, ease);
  };

  // No scroll lock: a scroll attempt plays the rest at 3×.
  let tl: gsap.core.Timeline | null = null;
  const hurry = (event: Event) => {
    if (!tl || !tl.isActive()) return;
    if (event instanceof KeyboardEvent) {
      const target = event.target as Element | null;
      if (!SCROLL_KEYS.has(event.key) || (target && target.closest && target.closest('input, select, textarea, [contenteditable]'))) return;
    }
    if (tl.timeScale() < 3) tl.timeScale(3);
  };
  const listen = (on: boolean) => {
    const method = on ? 'addEventListener' : 'removeEventListener';
    window[method]('wheel', hurry, { passive: true } as AddEventListenerOptions);
    window[method]('touchmove', hurry, { passive: true } as AddEventListenerOptions);
    window[method]('keydown', hurry);
  };
  const finish = () => {
    listen(false);
    done();
  };

  const start = (ready: boolean) => {
    rig.reset();
    tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        // The panel images now cover the windows: hand everything back to
        // static CSS. The clip stays (windows fully open).
        gsap.set([...rig.discrete, ...content], { clearProps: 'all' });
        finish();
        try {
          sessionStorage.setItem(SEEN_KEY, '1');
        } catch (error) {
          /* ignore */
        }
      },
      onInterrupt: finish,
    });
    const quick = seen || scrolled || !ready;
    if (rig.name === 'phone') {
      if (reduced) shortPhone(tl, 0.4, 'none');
      else if (quick) shortPhone(tl);
      else fullPhone(tl);
    } else if (reduced) reducedDesktop(tl);
    else if (quick) short(tl);
    else full(tl);
    listen(true);
    tl.play(0);
    (window as Window & { __heroTl?: gsap.core.Timeline }).__heroTl = tl;
  };

  // Crossing the breakpoint after the intro: show that layout's end state.
  const onBreakpoint = () => {
    if (!root.classList.contains('is-hero-done')) return;
    [desktop, phone].forEach((r) => {
      if (!r) return;
      r.measure();
      r.finish();
    });
  };
  if (phoneMQ.addEventListener) phoneMQ.addEventListener('change', onBreakpoint);

  // Start once the images can be seen (capped), not on window load.
  if (reduced || seen || scrolled) start(true);
  else decoded([rig.sceneImg, ...rig.discrete]).then(start);
}
