// Entry point. Keep this file a manifest: one run() call per module.
// Feature code lives in src/modules/<name>.ts and exports an init
// function that no-ops when its selector is absent from the page.
import { initAriaRoles } from './modules/aria-roles';
import { initCDrop } from './modules/c-drop';
import { initCounter } from './modules/counter';
import { initDotMap } from './modules/dot-map';
import { initDropdownClose } from './modules/dropdown-close';
import { initEnvironmentSwitcher } from './modules/environment-switcher';
import { initFinsweet } from './modules/finsweet';
import { initFlareBorder } from './modules/flare-border';
import { initHeroIntro } from './modules/hero-intro';
import { initHubSpotForms } from './modules/hubspot-form';
import { initIndustryTilt } from './modules/industry-tilt';
import { initIxPointer } from './modules/ix-pointer';
import { initIxScroll } from './modules/ix-scroll';
import { initNav } from './modules/nav';
import { initNewsletter } from './modules/newsletter';
import { initOrbit } from './modules/orbit';
import { initPlaceholders } from './modules/placeholders';
import { initReadMore } from './modules/read-more';
import { initTabRotation } from './modules/tab-rotation';
// Self-starting on DOM ready, independently of Webflow (brandvm v1.1.2).
import './modules/lazy-videos';

// Each module runs in isolation: one that throws is logged and skipped,
// and every module after it still initializes.
function run(name: string, init: () => void) {
  try {
    init();
  } catch (error) {
    console.error(`[wfc] ${name} failed to initialize`, error);
  }
}

function boot() {
  // No pre-paint scroll lock on this site (D1), so nothing to release.
  run('environment-switcher', initEnvironmentSwitcher);
  // Stage 4: the Home hero intro starts on DOM ready, not after webflow.js,
  // so it can begin as soon as its images decode. Inert without [data-hero].
  run('hero-intro', initHeroIntro);
  // Stage 4: nav dropdowns and mobile menu, staging-only behind ?wfc-ix=repo.
  run('nav', initNav);
  // Stage 4: case-study C-drop, same flag. The FAQ, Services hub and filter
  // dropdowns need no JS (styles.css §03, on Webflow's .w--open).
  run('c-drop', initCDrop);
  // Stage 4: IX3 scroll and pointer interactions replayed from
  // src/interactions/runtime.json, same flag. Each takes its interactions
  // over from Webflow's IX3 runtime (ix3-bridge.ts) once that has started.
  run('ix-scroll', initIxScroll);
  run('ix-pointer', initIxPointer);
  // Starter fixes for markup Webflow publishes (conventions.md §9–11). Both
  // act only on data-aria-role / data-placeholder, which the site doesn't
  // use yet. unique-form-ids stays off for parity: it would rename the
  // duplicate `id="radio"` filters on /insights (a later, measured batch).
  run('aria-roles', initAriaRoles);
  run('placeholders', initPlaceholders);
}

// Site features, ported from brandvm/brandvm v1.1.2 in their original order.
// They start after webflow.js (Webflow.push), as they did there: some read
// Webflow's dropdowns and jQuery. The guard stops a second bundle copy from
// initializing them twice.
function bootSite() {
  if (window.__brandvmBooted) return;
  window.__brandvmBooted = true;
  run('newsletter', initNewsletter);
  run('flare-border', initFlareBorder);
  run('counter', initCounter);
  run('dot-map', initDotMap);
  run('read-more', initReadMore);
  run('dropdown-close', initDropdownClose);
  // Moved from Webflow page code (Stage 3, batch 3.2).
  run('orbit', initOrbit);
  run('industry-tilt', initIndustryTilt);
  // Batch 3.3: replaces the Flowbase app script and the HubSpot Embed scripts.
  run('tab-rotation', initTabRotation);
  run('hubspot-form', initHubSpotForms);
  // Batch 3.3c: Finsweet Attributes (list, socialshare), bundled and pinned,
  // replacing the CDN tag in site head code. Last, per the recipe.
  run('finsweet', initFinsweet);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
// Works whether the bundle arrives before or after Webflow's ready event.
// A page without Webflow's queue/API (tests, a stripped export) still boots
// the features once the DOM is ready, instead of throwing.
window.Webflow = window.Webflow || ([] as unknown as NonNullable<Window['Webflow']>);
if (typeof window.Webflow.push === 'function') window.Webflow.push(bootSite);
else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootSite, { once: true });
else bootSite();
