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

function create(el: HTMLElement) {
  if (!el || el.dataset.hsInited) return;
  el.dataset.hsInited = '1';
  if (!el.id) el.id = 'hs-form-slot-t' + ++count;
  ensureJS()
    .then(() => {
      (window as HubSpotWindow).hbspt!.forms!.create({
        region: el.dataset.hsRegion || 'na1',
        portalId: el.dataset.hsPortal || '',
        formId: el.dataset.hsForm || '',
        target: '#' + el.id,
        // Releases the space styles.css reserves for the slot until the form
        // has rendered (Contact mobile CLS).
        onFormReady: () => el.classList.add('is-ready'),
      } as unknown as Record<string, string>);
    })
    .catch(() => {
      delete el.dataset.hsInited;
    });
  // If HubSpot never reports ready (blocked, offline), don't hold the space.
  setTimeout(() => el.classList.add('is-ready'), 8000);
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
