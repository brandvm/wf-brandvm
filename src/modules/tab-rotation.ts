// Auto-rotating Webflow Tabs, driven by the same attributes as Flowbase's
// "Auto Tab Rotation" booster it replaces (Stage 3, batch 3.3a), so the
// Designer markup stays as it is:
//   [fb-tabs]                 on the Tabs element
//   fb-tabs-speed="15000"     ms per tab (default 5000)
//   fb-tabs-progress="true"   writes --fb-tab-progress (0–100%) on the
//                             current tab link, for a progress bar
//   fb-tabs-pauseable="true"  pauses while hovered or touched
// Used on About ("Our Work" client tabs). Starts after `load`, like the
// booster. A tab the visitor clicks or focuses restarts the timer from it.
const PROGRESS = '--fb-tab-progress';

function flag(el: Element, name: string) {
  const value = el.getAttribute(name);
  return value !== null && value !== '' && value !== 'false';
}

function rotate(root: HTMLElement) {
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('.w-tab-link'));
  if (!links.length) return;
  const speed = Number(root.getAttribute('fb-tabs-speed')) || 5000;
  const progress = flag(root, 'fb-tabs-progress');
  let current = links.find((link) => link.classList.contains('w--current'));

  let remaining = speed;
  let started = 0;
  let timer = 0;
  let frame = 0;

  const stop = () => {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    timer = frame = 0;
  };
  const tick = () => {
    if (!current) return;
    const left = started + remaining - Date.now();
    current.style.setProperty(PROGRESS, Math.ceil(((speed - left) * 100) / speed) + '%');
    frame = requestAnimationFrame(tick);
  };
  const resume = () => {
    if (timer) return;
    started = Date.now();
    timer = window.setTimeout(next, remaining);
    if (progress) frame = requestAnimationFrame(tick);
  };
  const pause = () => {
    if (!started) return;
    remaining -= Date.now() - started;
    started = 0;
    stop();
  };
  const restart = () => {
    stop();
    remaining = speed;
    started = 0;
    resume();
  };
  // Select the next tab through Webflow's own click handler; drop the href
  // for the click so the page doesn't jump to the pane's anchor.
  function next() {
    if (!current) return;
    const target = links[(links.indexOf(current) + 1) % links.length];
    const href = target.getAttribute('href');
    target.removeAttribute('href');
    target.click();
    if (href !== null) target.setAttribute('href', href);
  }
  const select = (link: HTMLAnchorElement) => {
    if (link !== current) {
      if (progress) current?.style.removeProperty(PROGRESS);
      current = link;
    }
    restart();
  };

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      // Our own synthetic click must not reach other listeners above the
      // link (as with the booster); Webflow's tab handler is on the link.
      if (!event.isTrusted) event.stopPropagation();
      select(link);
    }, { passive: true });
    link.addEventListener('focus', () => { if (link !== current) select(link); }, { passive: true });
  });

  if (flag(root, 'fb-tabs-pauseable')) {
    root.addEventListener('mouseenter', pause, { passive: true });
    root.addEventListener('mouseleave', resume, { passive: true });
    root.addEventListener('touchstart', pause, { passive: true });
    root.addEventListener('touchend', resume, { passive: true });
    root.addEventListener('touchcancel', resume, { passive: true });
  }
  if (current) resume();
}

export function initTabRotation() {
  // While the Flowbase app still injects its script, let it run alone, so
  // tabs never rotate twice as fast during the switch-over.
  if (document.querySelector('script[src*="boosters-tab-rotation"]')) return;
  const roots = Array.from(document.querySelectorAll<HTMLElement>('[fb-tabs]'))
    .filter((root) => !root.hasAttribute('data-tab-rotation'));
  if (!roots.length) return;
  const start = () => roots.forEach((root) => {
    root.setAttribute('data-tab-rotation', '');
    rotate(root);
  });
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}
