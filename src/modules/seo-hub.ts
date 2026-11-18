// SEO hub (/seo-agency) redesign: three behaviours, each a no-op when its
// markup is absent, so no other page is affected.
//
//   [data-seo-shader]   <canvas> in the hero background Embed: WebGL ribbed-glass
//                       shader (seo-hub-frag.ts). The poster image under it is the
//                       fallback when WebGL is off; reduced motion draws one frame.
//   [data-seo-track]    the hero cards row: its cards are cloned once
//                       (aria-hidden) so the tablet/phone marquee loops seamlessly.
//   [data-seo-acc]      the services accordion: [data-seo-panel] children, each with
//                       a [data-seo-tab]. Sets data-state="on"/"off", auto-advances
//                       every 8s (paused while keyboard focus is inside), restarts the
//                       [data-seo-progress] bar. Styles for the states: styles.css
//                       › "SEO hub".
import { SEO_HUB_FRAG } from './seo-hub-frag';

const PALETTE = ['#040817', '#0b1a40', '#2a3f8f', '#d9452a', '#f7a274'];
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function hexToRgb(hex: string) {
  const h = hex.slice(1);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

function initShader(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, shader(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){gl_Position=vec4(p,0.0,1.0);}'));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, SEO_HUB_FRAG));
  gl.linkProgram(program);
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n: string) => gl.getUniformLocation(program, n);
  const uRes = u('u_res'), uTime = u('u_time'), uMouse = u('u_mouse'), uHover = u('u_hover'), uGrain = u('u_grain');
  gl.uniform1f(u('u_dark'), 0);
  gl.uniform3fv(u('u_c'), new Float32Array(PALETTE.flatMap(hexToRgb)));

  const still = reduced();
  const target = { x: 0.7, y: 0.7, hover: 0 };
  const m = { x: 0.7, y: 0.7, hover: 0 };
  let scale = 1, visible = true, frame = 0;
  const t0 = performance.now();

  const resize = () => {
    const cw = Math.max(1, canvas.clientWidth), ch = Math.max(1, canvas.clientHeight);
    scale = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2500000 / (cw * ch)));
    const w = Math.round(cw * scale), h = Math.round(ch * scale);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };
  const draw = (now: number) => {
    resize();
    m.x += (target.x - m.x) * 0.06;
    m.y += (target.y - m.y) * 0.06;
    m.hover += (target.hover - m.hover) * 0.05;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, still ? 14 : (now - t0) / 1000 + 12);
    gl.uniform2f(uMouse, m.x, m.y);
    gl.uniform1f(uHover, m.hover);
    gl.uniform1f(uGrain, 1 / Math.max(scale, 0.5));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    canvas.setAttribute('data-ready', '');
  };
  if (still) {
    draw(t0);
    new ResizeObserver(() => draw(t0)).observe(canvas);
    return;
  }
  const loop = (now: number) => {
    draw(now);
    frame = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
  };
  window.addEventListener(
    'pointermove',
    (e) => {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      target.hover = inside ? 1 : 0;
      if (inside) {
        target.x = x;
        target.y = y;
      }
    },
    { passive: true },
  );
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && !frame) frame = requestAnimationFrame(loop);
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !frame && visible) frame = requestAnimationFrame(loop);
  });
  frame = requestAnimationFrame(loop);
}

function initTrack(track: HTMLElement) {
  if (track.dataset.seoCloned) return;
  track.dataset.seoCloned = 'true';
  Array.from(track.children).forEach((card) => {
    const copy = card.cloneNode(true) as HTMLElement;
    copy.setAttribute('aria-hidden', 'true');
    copy.setAttribute('data-seo-clone', '');
    track.appendChild(copy);
  });
}

function initAccordion(root: HTMLElement) {
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-seo-panel]'));
  if (!panels.length) return;
  const DURATION = 8000;
  root.style.setProperty('--seo-acc-dur', DURATION + 'ms');
  let current = Math.max(0, panels.findIndex((p) => p.getAttribute('data-state') === 'on'));
  let timer = 0;
  const auto = !reduced();

  const sync = () =>
    panels.forEach((panel, i) => {
      const on = i === current;
      panel.setAttribute('data-state', on ? 'on' : 'off');
      const tab = panel.querySelector<HTMLElement>('[data-seo-tab]');
      if (tab) {
        tab.setAttribute('aria-expanded', String(on));
        tab.tabIndex = on ? -1 : 0;
      }
    });
  const schedule = () => {
    clearTimeout(timer);
    if (auto) timer = window.setTimeout(() => open((current + 1) % panels.length), DURATION);
  };
  const open = (i: number) => {
    current = i;
    sync();
    // restart the progress bar's CSS animation
    const bar = panels[i].querySelector<HTMLElement>('[data-seo-progress]');
    if (bar) {
      bar.style.animation = 'none';
      void bar.offsetWidth;
      bar.style.animation = '';
    }
    schedule();
  };

  panels.forEach((panel, i) => {
    const tab = panel.querySelector<HTMLElement>('[data-seo-tab]');
    if (tab) {
      tab.setAttribute('role', 'button');
      tab.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && i !== current) {
          e.preventDefault();
          open(i);
        }
      });
    }
    panel.addEventListener('click', () => {
      if (i !== current) open(i);
    });
  });
  const pause = () => {
    clearTimeout(timer);
    root.setAttribute('data-paused', '');
  };
  const resume = () => {
    root.removeAttribute('data-paused');
    schedule();
  };
  // Hover does not pause: the pointer usually rests on the accordion while
  // reading, which made the rotation look broken. Keyboard focus does pause.
  root.addEventListener('focusin', (e) => {
    if ((e.target as HTMLElement).matches(':focus-visible')) pause();
  });
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget as Node)) resume();
  });
  sync();
  // start when the accordion first comes into view
  new IntersectionObserver(
    (entries, io) => {
      if (entries[0].isIntersecting) {
        open(current);
        io.disconnect();
      }
    },
    { threshold: 0.15 },
  ).observe(root);
}

export function initSeoHub() {
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-seo-shader]').forEach((c) => {
    try {
      initShader(c);
    } catch (error) {
      console.error('[wfc] seo-hub shader', error);
    }
  });
  document.querySelectorAll<HTMLElement>('[data-seo-track]').forEach(initTrack);
  document.querySelectorAll<HTMLElement>('[data-seo-acc]').forEach(initAccordion);
}
