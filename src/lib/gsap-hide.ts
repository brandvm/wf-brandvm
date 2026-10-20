// Evaluated just before the GSAP plugins in ./gsap.ts (ES modules run in
// import order). See there.
const w = window as unknown as { gsap?: unknown; __wfcWebflowGsap?: unknown };
w.__wfcWebflowGsap = w.gsap;
w.gsap = undefined;

export {};
