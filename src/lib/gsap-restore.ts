// Evaluated just after the GSAP plugins in ./gsap.ts. See there.
const w = window as unknown as { gsap?: unknown; __wfcWebflowGsap?: unknown };
w.gsap = w.__wfcWebflowGsap;
delete w.__wfcWebflowGsap;

export {};
