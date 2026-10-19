// Stage 4 switch: repo interactions on staging only, behind a flag, while
// Webflow's IX2/IX3 still run on every page.
//
//   ?wfc-ix=repo   turn the repo versions on (remembered in this browser)
//   ?wfc-ix=off    back to Webflow's interactions
//
// Only on *.webflow.io (and the Designer preview). On the custom domain this
// always returns false, so visitors never see the repo versions until a
// family's cutover, when its module drops this check. While on, <html>
// carries .wfc-ix and the repo CSS for that family takes over from IX2's
// inline styles (styles.css §03).
const KEY = 'wfc-ix';
let cached: boolean | null = null;

export function repoInteractions() {
  if (cached !== null) return cached;
  cached = false;
  if (!/\.webflow\.io$|\.canvas\.webflow\.com$/.test(location.hostname)) return cached;
  const value = new URLSearchParams(location.search).get(KEY);
  try {
    if (value === 'repo') localStorage.setItem(KEY, 'repo');
    if (value === 'off') localStorage.removeItem(KEY);
    cached = value === 'repo' || (value !== 'off' && localStorage.getItem(KEY) === 'repo');
  } catch (error) {
    cached = value === 'repo';
  }
  if (cached) document.documentElement.classList.add('wfc-ix');
  return cached;
}
