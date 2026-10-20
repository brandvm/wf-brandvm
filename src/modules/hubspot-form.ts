// HubSpot forms, loaded on approach (Stage 3, batch 3.3b). Ported from the
// loader that sat in the Contact CTA Embed (35 pages); the Contact page now
// uses the same slot instead of its render-blocking v2.js tag.
//
// Markup (in a Webflow Embed or a Div with attributes):
//   <div class="hs-form-slot" data-hs-form="<form id>"
//        data-hs-portal="<portal id>" data-hs-region="na1"></div>
// HubSpot's v2.js loads once, when the first slot comes within 600px of the
// viewport (data-hs-load="idle": when the browser is idle instead).
// [data-hs-inited] marks a slot as taken, so the old Embed script and this
// module never create the same form twice.
const SRC = 'https://js.hsforms.net/forms/embed/v2.js';

type HubSpotWindow = typeof window & {
  hbspt?: { forms?: { create(options: Record<string, string>): void } };
};

let loading: Promise<void> | null = null;
let count = 0;

function ensureJS(): Promise<void> {
  const w = window as HubSpotWindow;
  if (w.hbspt && w.hbspt.forms) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const ready = () => (w.hbspt && w.hbspt.forms ? resolve() : setTimeout(ready, 40));
    if (document.querySelector('script[src*="js.hsforms.net/forms/embed/v2.js"]')) return ready();
    const s = document.createElement('script');
    s.src = SRC;
    s.defer = true;
    s.onload = ready;
    s.onerror = () => {
      loading = null;
      reject();
    };
    document.body.appendChild(s);
  });
  return loading;
}

// styles.css reserves the form's height on the slot until .is-ready, so
// nothing below jumps when the form renders (Contact mobile CLS). Release
// only once the rendered form is as tall as the reservation: HubSpot's
// onFormReady can fire before its fields have their final height, and
// releasing then made the block below jump up and back (live, 1.4.4).
// Also released on submit (the thank-you message is shorter).
//
// If the form never comes (a blocker stops HubSpot, or it fails), closing
// the space would shift the page too (~0.28), so the space stays and shows
// how to reach Brand Vision instead (Kajal, option 1, 2026-10-20). A form
// that arrives late after all replaces it.
const FALLBACK_MS = 8000;
const FALLBACK_HTML =
  '<p class="hs-form-fallback-title">The contact form couldn\u2019t load.</p>' +
  '<p>Email <a href="mailto:info@brandvm.com">info@brandvm.com</a> or call ' +
  '<a href="tel:+18888322917">+1 (888) 832-2917</a> and we\u2019ll get back to you.</p>';

function holdSpace(el: HTMLElement) {
  let done = false;
  let fallback: HTMLElement | null = null;
  const formHeight = () =>
    Array.from(el.children).filter((c) => c !== fallback).reduce((h, c) => h + c.getBoundingClientRect().height, 0);
  const release = () => {
    if (done) return;
    done = true;
    fallback?.remove();
    fallback = null;
    el.classList.add('is-ready');
    observer?.disconnect();
  };
  const check = () => {
    const reserved = parseFloat(getComputedStyle(el).minHeight) || 0;
    if (formHeight() >= reserved - 24) release();
  };
  const showFallback = () => {
    if (done || fallback || formHeight() > 40) return;
    fallback = document.createElement('div');
    fallback.className = 'hs-form-fallback';
    fallback.setAttribute('role', 'status');
    fallback.innerHTML = FALLBACK_HTML;
    el.appendChild(fallback);
  };
  const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null;
  if (observer) {
    observer.observe(el);
    new MutationObserver((_, mo) => {
      Array.from(el.children).forEach((c) => observer.observe(c));
      if (done) mo.disconnect();
    }).observe(el, { childList: true });
  }
  setTimeout(showFallback, FALLBACK_MS);
  return { release, showFallback };
}

function create(el: HTMLElement) {
  if (!el || el.dataset.hsInited) return;
  el.dataset.hsInited = '1';
  if (!el.id) el.id = 'hs-form-slot-t' + ++count;
  const space = holdSpace(el);
  ensureJS()
    .then(() => {
      (window as HubSpotWindow).hbspt!.forms!.create({
        region: el.dataset.hsRegion || 'na1',
        portalId: el.dataset.hsPortal || '',
        formId: el.dataset.hsForm || '',
        target: '#' + el.id,
        onFormSubmitted: space.release,
      } as unknown as Record<string, string>);
    })
    .catch(() => {
      delete el.dataset.hsInited;
      space.showFallback();
    });
}

export function initHubSpotForms() {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-hs-form]')).filter((el) => !el.dataset.hsInited);
  if (!els.length) return;
  els.forEach((el) => {
    if (el.dataset.hsLoad === 'idle') {
      const run = () => create(el);
      'requestIdleCallback' in window ? window.requestIdleCallback(run, { timeout: 4000 }) : setTimeout(run, 2500);
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            create(e.target as HTMLElement);
            obs.unobserve(e.target);
          }
        });
      }, { rootMargin: '600px 0px' });
      io.observe(el);
    } else {
      create(el);
    }
  });
}
