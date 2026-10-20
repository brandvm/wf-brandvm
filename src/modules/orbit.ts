// @ts-nocheck -- ported verbatim from the About page footer code (Stage 3,
// batch 3.2). Typing it is a later cleanup; behaviour must stay identical.
// Orbit gallery on About: a scroll-driven card orbit on desktop (bundled
// GSAP + ScrollTrigger from src/lib/gsap.ts since Webflow's GSAP was turned
// off, 2026-10-20), a swipeable row on phones and with reduced
// motion. CSS in styles.css §04 "Orbit gallery". Guarded by
// [data-orbit-ready], so it never initializes twice.
import { gsap, ScrollTrigger } from '../lib/gsap';

export function initOrbit() {
(function () {
  function initOrbit() {
    var section = document.querySelector('.s-orbit');
    if (!section || section.hasAttribute('data-orbit-ready')) return;

    var titleEl = section.querySelector('.orbit-title');
    var track = section.querySelector('.orbit-track');
    var originals = [].slice.call(section.querySelectorAll('.orbit-card'));

    if (!titleEl || !track || !originals.length) return;
    section.setAttribute('data-orbit-ready', '');

    /* Lift the original CMS cards into the track. */
    originals.forEach(function (card) {
      track.appendChild(card);
    });

    var originalStyles = originals.map(function (card) {
      return card.getAttribute('style');
    });

    var trackAttrs = {};
    ['role', 'aria-label', 'tabindex', 'data-lenis-prevent'].forEach(function (name) {
      trackAttrs[name] = track.getAttribute(name);
    });

    var titleParent = titleEl.parentNode;
    var titleNext = titleEl.nextSibling;
    var trackId = track.id;
    var titleId = titleEl.id;

    function restoreAttr(el, name, value) {
      if (value === null) el.removeAttribute(name);
      else el.setAttribute(name, value);
    }

    function sweepBroken() {
      [].forEach.call(track.querySelectorAll('img'), function (img) {
        if (img.complete && img.naturalWidth === 0) {
          img.style.display = 'none';
        }
      });
    }

    track.addEventListener('error', function (e) {
      if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
      }
    }, true);

    window.addEventListener('load', sweepBroken, { once: true });
    sweepBroken();

    function inTrack() {
      return [].slice.call(track.children).filter(function (el) {
        return el.classList.contains('orbit-card');
      });
    }

    function readVal(el, attr, sel, dflt) {
      var v = el.getAttribute(attr);

      if (!v) {
        var n = el.querySelector(sel);
        if (n) v = n.textContent;
      }

      return (v || '').replace(/\s+/g, ' ').trim() || dflt;
    }

    /* ===== MOBILE: NORMAL SCROLL + SWIPEABLE IMAGE ROW ===== */

    function startGallery() {
      section.classList.add('orbit-is-gallery');

      /* Put the headline before the gallery in reading order. */
      track.parentNode.insertBefore(titleEl, track);

      /* Keep the existing story anchor above the image row. */
      if (trackId && !titleId) {
        track.removeAttribute('id');
        titleEl.id = trackId;
      }

      track.setAttribute('role', 'region');
      track.setAttribute('aria-label', 'Our story photo gallery');
      track.setAttribute('tabindex', '0');
      track.setAttribute('data-lenis-prevent', '');

      return function () {
        track.scrollLeft = 0;
        section.classList.remove('orbit-is-gallery');

        Object.keys(trackAttrs).forEach(function (name) {
          restoreAttr(track, name, trackAttrs[name]);
        });

        if (trackId && !titleId) {
          titleEl.removeAttribute('id');
          track.id = trackId;
        }

        titleParent.insertBefore(titleEl, titleNext);
      };
    }

    /* ===== DESKTOP: ORIGINAL ORBIT ANIMATION ===== */

    function startDesktop() {

      var CFG = {
        maxCardW: 0.55,
        maxCardH: 0.62,
        gapRatio: 0.826,
        minCards: 22,
        hold: 0.07,
        arc: 0.355,
        arcJitter: 0.050,
        arcRange: 0.470,
        minOnScreen: 0.55,
        scaleMin: 0.86,
        scaleSpread: 1.35,
        tilt: 9,
        ease: 0.11,
        clearance: 18
      };

      /* Heights remain relative to the track's Designer font size. */
      var HEIGHTS = {
        small: 7.5,
        medium: 20,
        large: 26.25
      };

      var RATIOS = {
        '1:1': 1,
        '3:4': 3 / 4,
        '4:5': 4 / 5,
        '4:3': 4 / 3
      };

      function rnd(i) {
        var x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
        return x - Math.floor(x);
      }

      function bow(x, r) {
        return Math.pow(
          Math.cos(Math.min(Math.abs(x) / r, 1) * Math.PI / 2),
          2
        );
      }

      var state = [];
      var W = 0;
      var H = 0;
      var span = 0;
      var range = 0;
      var widest = 0;
      var titleW = 0;
      var titleH = 0;

      function measure() {
        W = window.innerWidth;
        H = window.innerHeight;
        range = CFG.arcRange * W;

        var em = parseFloat(getComputedStyle(track).fontSize) || 16;
        var t = titleEl.getBoundingClientRect();

        titleW = t.width / 2;
        titleH = t.height / 2;

        var n = inTrack().length;

        while (n < CFG.minCards) {
          var clone = originals[n % originals.length].cloneNode(true);
          clone.setAttribute('data-orbit-clone', '');
          clone.setAttribute('aria-hidden', 'true');
          track.appendChild(clone);
          n++;
        }

        sweepBroken();

        var all = inTrack();
        widest = 0;

        state = all.map(function (el, i) {
          var hKey = readVal(
            el, 'data-h', '.orbit-size', 'medium'
          ).toLowerCase();

          var rKey = readVal(
            el, 'data-ar', '.orbit-ratio', '1:1'
          );

          var h = Math.round((HEIGHTS[hKey] || HEIGHTS.medium) * em);
          var w = Math.round(h * (RATIOS[rKey] || 1));

          var shrink = Math.min(
            1,
            CFG.maxCardW * W / w,
            CFG.maxCardH * H / h
          );

          if (shrink < 1) {
            w = Math.round(w * shrink);
            h = Math.round(h * shrink);
          }

          el.style.width = w + 'px';
          el.style.height = h + 'px';

          if (w > widest) widest = w;

          var tilt = (rnd(i + 99) * 2 - 1) * CFG.tilt;
          var rad = Math.abs(tilt * Math.PI / 180);
          var hw = (w * Math.cos(rad) + h * Math.sin(rad)) / 2;
          var hh = (h * Math.cos(rad) + w * Math.sin(rad)) / 2;

          var ay = (CFG.arc + (rnd(i) * 2 - 1) * CFG.arcJitter) * H;
          var xEdge = titleW + hw;
          var r = Math.max(range, xEdge * 1.9);
          var clear = (titleH + hh + CFG.clearance) / bow(xEdge, r);
          var roof = H / 2 + hh - CFG.minOnScreen * h;

          ay = Math.min(
            Math.max(ay, clear),
            Math.max(roof, hh)
          );

          return {
            el: el,
            w: w,
            h: h,
            tilt: tilt,
            hw: hw,
            hh: hh,
            ay: ay,
            r: r,
            dir: i % 2 === 0 ? -1 : 1,
            base: 0,
            parked: false
          };
        });

        var x = 0;

        state.forEach(function (s, i) {
          if (i) {
            x += (state[i - 1].w + s.w) / 2 * CFG.gapRatio;
          }
          s.base = x;
        });

        span = x + (state.length ? state[state.length - 1].w : 0);
      }

      measure();

      var targetP = 0;
      var currentP = 0;

      var trigger = ScrollTrigger.create({
        id: 'orbit-drift',
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',

        onUpdate: function (self) {
          targetP = self.progress;
        },

        onRefresh: function (self) {
          measure();
          currentP = targetP = self.progress;
          render();
        }
      });

      function render() {
        var p = Math.max(
          0,
          Math.min(1, (currentP - CFG.hold) / (1 - 2 * CFG.hold))
        );

        var startX = W / 2 + widest;
        var total = span + W + 2 * widest;
        var dist = p * total;

        for (var i = 0; i < state.length; i++) {
          var s = state[i];
          var x = startX + s.base - dist;

          if (x > W / 2 + s.hw || x < -(W / 2 + s.hw)) {
            if (!s.parked) {
              s.el.style.transform = 'translate3d(-9999px,0,0)';
              s.parked = true;
            }
            continue;
          }

          s.parked = false;

          var y = s.dir * s.ay * bow(x, s.r);
          var k = CFG.scaleMin +
            (1 - CFG.scaleMin) * bow(x, range * CFG.scaleSpread);

          s.el.style.transform =
            'translate3d(' +
            (W / 2 + x - s.w / 2).toFixed(2) + 'px,' +
            (H / 2 + y - s.h / 2).toFixed(2) + 'px,0) ' +
            'rotate(' + s.tilt.toFixed(2) + 'deg) ' +
            'scale(' + k.toFixed(4) + ')';
        }
      }

      var raf = 0;
      currentP = targetP = trigger.progress;

      function tick() {
        currentP += (targetP - currentP) * CFG.ease;
        render();
        raf = requestAnimationFrame(tick);
      }

      tick();

      var rt;

      function onResize() {
        clearTimeout(rt);
        rt = setTimeout(function () {
          ScrollTrigger.refresh();
        }, 150);
      }

      window.addEventListener('resize', onResize);

      /* Fully stop desktop animation before switching to mobile. */
      return function () {
        cancelAnimationFrame(raf);
        clearTimeout(rt);
        window.removeEventListener('resize', onResize);
        trigger.kill();

        inTrack().forEach(function (card) {
          if (card.hasAttribute('data-orbit-clone')) {
            card.remove();
          }
        });

        originals.forEach(function (card, i) {
          restoreAttr(card, 'style', originalStyles[i]);
        });
      };
    }

    /* Change 767px to 991px to include tablets. */
    var mobile = window.matchMedia('(max-width: 767px)');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var stop = null;
    var galleryMode = null;

    function syncMode() {
      var useGallery =
        mobile.matches ||
        reducedMotion.matches ||
        !gsap ||
        !ScrollTrigger;

      if (useGallery === galleryMode) return;
      if (stop) stop();

      galleryMode = useGallery;
      stop = useGallery ? startGallery() : startDesktop();

      /* Refresh other scroll sections after the section height changes. */
      if (ScrollTrigger) {
        ScrollTrigger.refresh();
      }
    }

    function watch(query) {
      if (query.addEventListener) {
        query.addEventListener('change', syncMode);
      } else {
        query.addListener(syncMode);
      }
    }

    watch(mobile);
    watch(reducedMotion);
    syncMode();

    window.addEventListener('load', syncMode, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrbit, { once: true });
  } else {
    initOrbit();
  }
})();
}
