// Stage 4 switch, now always on. While Webflow's IX2/IX3 still ran, the
// repo interactions were staging-only behind ?wfc-ix=repo. On 2026-10-20
// every IX2 and IX3 interaction was deleted in Webflow and its GSAP turned
// off (MANUAL-TODO F, G, H), so the repo versions run everywhere.
//
// <html> still gets .wfc-ix: the repo CSS for the nav, dropdowns and C-drop
// (styles.css §03) is keyed on it, so that CSS only takes over once this
// bundle runs. Its !important rules were there to beat IX2's inline styles
// and can go in a cleanup batch.
let added = false;

export function repoInteractions() {
  if (!added) {
    document.documentElement.classList.add('wfc-ix');
    added = true;
  }
  return true;
}
