// G | Nav: mega-menu dropdowns and the mobile menu (Stage 4). Replaces the
// IX2 action lists "G Nav | Drop Open / Drop Open 2 / Drop Open 3 / Drop
// Close" and "Menu Open / Menu Close / Close 2 / Close 3".
//
// Dropdowns need no JS here: Webflow's dropdown component already sets
// .w--open, aria-expanded and handles Enter, Space, Escape and outside
// clicks; the overlay closes them through dropdown-close.ts. The motion is
// CSS keyed on .w--open (styles.css §03, "G | Nav"), with IX2's timing:
// height 0 → auto, chevron 180°, overlay fade, 400ms, content fading in
// 240ms later, ease cubic-bezier(.64,.05,0,1).
//
// Mobile menu (≤ 991px): .g-nav-menu-button opens, .g-nav-close-button
// closes; the panel slides in from the right over 1.2s (IX2's translateX
// −101%). Adds what IX2 never had: aria-expanded/aria-controls on the menu
// button, Escape to close, focus to the close button on open and back to
// the menu button on close.
//
// Staging only, behind ?wfc-ix=repo (ix-flag.ts), until the cutover.
import { repoInteractions } from './ix-flag';

const MOBILE = '(max-width: 991px)';

export function initNav() {
  if (!repoInteractions()) return;
  const menu = document.querySelector<HTMLElement>('.g-nav-menu');
  const openers = Array.from(document.querySelectorAll<HTMLElement>('.g-nav-menu-button'));
  const closers = Array.from(document.querySelectorAll<HTMLElement>('.g-nav-close-button'));
  if (!menu || !openers.length) return;

  if (!menu.id) menu.id = 'g-nav-menu';
  const media = window.matchMedia(MOBILE);
  let lastOpener: HTMLElement | null = null;

  const setOpen = (open: boolean, focus = true) => {
    menu.classList.toggle('is-open', open);
    openers.forEach((button) => button.setAttribute('aria-expanded', String(open)));
    if (open) {
      if (focus && closers[0]) closers[0].focus({ preventScroll: true });
    } else if (focus && lastOpener) {
      lastOpener.focus({ preventScroll: true });
    }
  };

  openers.forEach((button) => {
    button.setAttribute('role', 'button');
    button.setAttribute('aria-controls', menu.id);
    button.setAttribute('aria-expanded', 'false');
    if (!button.getAttribute('aria-label')) button.setAttribute('aria-label', 'Open menu');
    // Capture phase, stopped here: IX2's click handler (delegated above)
    // never sees it, and the "#" link never jumps.
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      lastOpener = button;
      setOpen(true);
    }, true);
  });
  closers.forEach((button) => {
    button.setAttribute('role', 'button');
    button.setAttribute('aria-controls', menu.id);
    if (!button.getAttribute('aria-label')) button.setAttribute('aria-label', 'Close menu');
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }, true);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false);
  });
  // A link inside the menu that stays on this page (an anchor) closes it.
  menu.addEventListener('click', (event) => {
    const link = (event.target as Element).closest('a[href^="#"]:not([href="#"])');
    if (link && menu.classList.contains('is-open')) setOpen(false, false);
  });
  // Back to desktop: the inline menu is always shown, so drop the state.
  const onChange = () => {
    if (!media.matches) setOpen(false, false);
  };
  if (media.addEventListener) media.addEventListener('change', onChange);
}
