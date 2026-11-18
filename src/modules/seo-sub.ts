// SEO sub-pages (the Services • SEO CMS template, /seo-agency/<slug>).
// Each is a no-op when its markup is absent, so no other page is affected.
//
//   .seo-sub-cards .sig-track  hero cards (CMS embed): cloned once (aria-hidden) so the
//                              phone marquee loops; styles in styles.css › "SEO sub-pages".
//   .seo-sub-vx                the page's diagram (CMS embed). Its CSS and JS are a separate
//                              bundle (seo-sub-viz.css/.js, generated from the prototype by
//                              seo-redesign/tools/build-webflow-sub.py), fetched from the same
//                              place as this bundle when the diagram nears the viewport.
//   [data-seo-acc]             the services accordion reuses seo-hub.ts (initAccordion).

// This bundle's own URL, read while it runs (it is gone by the time init runs).
const SELF = (document.currentScript as HTMLScriptElement | null)?.src || '';

function bundleUrl(file: string) {
  const self =
    SELF ||
    Array.from(document.scripts)
      .map((s) => s.src)
      .find((s) => /\/index\.js(\?|$)/.test(s)) ||
    '';
  if (!self) return '';
  const u = new URL(self);
  u.pathname = u.pathname.replace(/index\.js$/, file);
  return u.href;
}

function loadViz() {
  const css = bundleUrl('seo-sub-viz.css'), js = bundleUrl('seo-sub-viz.js');
  if (!css || !js) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = css;
  // run the diagrams only once their styles apply, so nothing is measured unstyled
  link.onload = () => {
    const s = document.createElement('script');
    s.src = js;
    s.async = true;
    document.body.appendChild(s);
  };
  document.head.appendChild(link);
}

export function initSeoSub() {
  document.querySelectorAll<HTMLElement>('.seo-sub-cards .sig-track').forEach((track) => {
    if (track.dataset.seoCloned) return;
    track.dataset.seoCloned = 'true';
    Array.from(track.children).forEach((card) => {
      const copy = card.cloneNode(true) as HTMLElement;
      copy.classList.add('clone');
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
    });
  });

  const vx = document.querySelector('.seo-sub-vx');
  if (!vx) return;
  if (!('IntersectionObserver' in window)) return loadViz();
  new IntersectionObserver(
    (entries, io) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        loadViz();
      }
    },
    { rootMargin: '800px 0px' },
  ).observe(vx);
}
