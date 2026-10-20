// C-drop "Learn More / Learn Less" on the case-study pages (Stage 4).
// Replaces the IX2 action lists "C Drop Click Open / Close" (a-7/a-8):
// a click anywhere on .c-drop grows .c-drop-content from 80px to its full
// height over 740ms, swaps the .to-open/.to-close labels and clears the
// fader 240ms in; a second click reverses it.
//
// CSS can't animate to `auto`, so this measures the content, animates to
// that height through --c-drop-h, then lets go (auto) so it reflows with
// the viewport. Labels and fader are CSS on .is-open (styles.css §03,
// "C-drop"). Adds what IX2 never had: the toggle is a keyboard button with
// aria-expanded/aria-controls.
//
// On everywhere since the IX2 deletion (2026-10-20, ix-flag.ts). The
// stopPropagation below only mattered while IX2 ran; it goes in a cleanup.
import { repoInteractions } from './ix-flag';

const CLOSED = '80px';
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initCDrop() {
  if (!repoInteractions()) return;
  document.querySelectorAll<HTMLElement>('.c-drop').forEach((drop, index) => {
    const content = drop.querySelector<HTMLElement>('.c-drop-content');
    const toggle = drop.querySelector<HTMLElement>('.c-drop-toggle');
    if (!content || !toggle) return;

    if (!content.id) content.id = `c-drop-content-${index + 1}`;
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('aria-controls', content.id);
    toggle.setAttribute('aria-expanded', 'false');

    const settle = (event?: TransitionEvent) => {
      if (event && (event.target !== content || event.propertyName !== 'height')) return;
      if (drop.classList.contains('is-open')) content.style.setProperty('--c-drop-h', 'auto');
    };
    content.addEventListener('transitionend', settle);

    const setOpen = (open: boolean) => {
      // From auto (or the closed 80px) to a fixed pixel start, so the
      // transition has two numbers to run between.
      content.style.setProperty('--c-drop-h', `${content.getBoundingClientRect().height}px`);
      void content.offsetHeight;
      drop.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      content.style.setProperty('--c-drop-h', open ? `${content.scrollHeight}px` : CLOSED);
      if (open && reducedMotion()) settle();
    };

    // Capture phase, stopped here: IX2's delegated click handler never
    // sees it, so it doesn't run a-7/a-8 on top. Links inside the content
    // keep working and don't toggle.
    drop.addEventListener('click', (event) => {
      if ((event.target as Element).closest('a')) return;
      event.stopPropagation();
      setOpen(!drop.classList.contains('is-open'));
    }, true);
    toggle.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      setOpen(!drop.classList.contains('is-open'));
    });
  });
}
