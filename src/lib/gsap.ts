// The bundle's one GSAP entry point. Import gsap and its plugins from here,
// never from 'gsap/…' directly.
//
// GSAP's plugin files end with `_getGSAP() && gsap.registerPlugin(Plugin)`,
// and _getGSAP() falls back to window.gsap. When this bundle runs after
// Webflow's own GSAP (IX3 loads it on every page with interactions), a plain
// import would register the bundled ScrollTrigger / Observer / CustomEase on
// Webflow's core and replace window.ScrollTrigger, under IX3 and orbit.ts.
// So window.gsap is hidden while the plugins evaluate (gsap-hide, then the
// plugins, then gsap-restore, in this order), and they are registered on the
// bundled core instead. GOTCHAS 2026-10-20.
import './gsap-hide';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './gsap-restore';

gsap.registerPlugin(CustomEase, ScrollTrigger);

export { gsap, CustomEase, ScrollTrigger };
