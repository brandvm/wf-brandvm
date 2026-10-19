// Entry point. Keep this file a manifest: one run() call per module.
// Feature code lives in src/modules/<name>.ts and exports an init
// function that no-ops when its selector is absent from the page.
import { initAriaRoles } from './modules/aria-roles';
import { initCounter } from './modules/counter';
import { initDotMap } from './modules/dot-map';
import { initDropdownClose } from './modules/dropdown-close';
import { initEnvironmentSwitcher } from './modules/environment-switcher';
import { initFlareBorder } from './modules/flare-border';
import { initNewsletter } from './modules/newsletter';
import { initPlaceholders } from './modules/placeholders';
import { initReadMore } from './modules/read-more';
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
