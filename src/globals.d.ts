import type Swiper from 'swiper';

declare global {
  interface Window {
    WFC?: {
      staging: boolean;
      dev: boolean;
      devBase: string;
      stag: string;
      // The pinned release tag from the head snippet, or null before the
      // first release.
      release: string | null;
      // Base URL production loads from: the jsDelivr tag, or staging while
      // release is null.
      prod: string;
      // Set before script execution, including when a fallback URL is used.
      source?: string;
    };
    // Webflow's queue before webflow.js runs, its API after.
    Webflow?: { push(callback: () => void): unknown; env?(mode: string): boolean };
    // Supplied by Webflow's own scripts; not bundled.
    jQuery?: JQueryStatic;
    // Loaded at runtime from jsDelivr by the newsletter slider module.
    Swiper?: typeof Swiper;
    DotMap?: {
      init: (svg: SVGSVGElement, options?: Partial<import('./modules/dot-map').DotMapOptions>) => unknown;
      boot(): void;
      parseDots(path: string): unknown[];
    };
    __brandvmBooted?: boolean;
    __bvLazyVideosStarted?: boolean;
  }
}
