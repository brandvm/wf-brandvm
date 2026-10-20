import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Stage 4 IX3 replay: src/lib/gsap.ts isolation, ix-scroll.ts and
// ix-pointer.ts (Webflow's IX3 deleted 2026-10-20).
const js = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');

const markup = `
  <div style="height:150vh">top</div>
  <div class="section-header" id="sh"><div class="section-header-top-info">Info</div>
    <div class="sh-line">Line</div><p class="text-b">Body</p></div>
  <div style="height:150vh"></div>
  <div class="project-overlay-link" id="link" style="width:200px;height:200px">Project</div>
  <div class="project-link-layer"><div class="project-link-cursor" style="width:50px;height:50px"></div></div>
  <div style="height:150vh"></div>`;

// head: scripts that run before the bundle (a stand-in for Webflow's).
async function open(page, url, head = '') {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route(url.split('?')[0] + '*', (route) => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html data-wf-domain="brandvm.webflow.io"><head><style>${css}</style>${head}</head><body>${markup}
      <script>${js}</script></body></html>`,
  }));
  await page.goto(url);
  return errors;
}

// A Webflow-like ready queue that runs callbacks at once.
const readyQueue = `<script>window.Webflow = { push: (fn) => fn() };</script>`;

test('gsap isolation: the bundle never registers plugins on Webflow\'s window.gsap', async ({ page }) => {
  const stub = `<script>
    window.__registered = [];
    window.gsap = { version: 'webflow', registerPlugin: (...p) => window.__registered.push(...p.map((x) => x && x.name)) };
  </script>`;
  const errors = await open(page, 'https://brandvm.webflow.io/', stub + readyQueue);
  expect(await page.evaluate(() => window.__registered)).toEqual([]);
  expect(await page.evaluate(() => window.gsap.version)).toBe('webflow');
  expect(await page.evaluate(() => typeof window.ScrollTrigger)).toBe('undefined');
  expect(errors).toEqual([]);
});

test('ix3 replay: on on the live domain', async ({ page }) => {
  const errors = await open(page, 'https://www.brandvm.com/', readyQueue);
  await expect(page.locator('.text-b')).toHaveCSS('opacity', '0');
  await page.locator('#sh').scrollIntoViewIfNeeded();
  await expect(page.locator('.text-b')).toHaveCSS('opacity', '1', { timeout: 4000 });
  expect(errors).toEqual([]);
});

test('ix-scroll: section header plays once on enter', async ({ page }) => {
  const errors = await open(page, 'https://brandvm.webflow.io/', readyQueue);
  await expect(page.locator('.text-b')).toHaveCSS('opacity', '0');
  await page.locator('#sh').scrollIntoViewIfNeeded();
  await expect(page.locator('.text-b')).toHaveCSS('opacity', '1', { timeout: 4000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await expect(page.locator('.text-b')).toHaveCSS('opacity', '1');
  expect(errors).toEqual([]);
});

test('ix-pointer: hover scales the cursor in and out; it follows the pointer', async ({ page }) => {
  const errors = await open(page, 'https://brandvm.webflow.io/', readyQueue);
  const scale = () => page.locator('.project-link-cursor').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  expect(await scale()).toBe(0);
  await page.locator('#link').scrollIntoViewIfNeeded();
  await page.locator('#link').hover();
  await expect.poll(scale).toBeCloseTo(1, 1);
  await page.mouse.move(5, 5);
  await expect.poll(scale).toBe(0);
  // Delegated: a link added after start (a list re-render) works too.
  await page.evaluate(() => {
    const old = document.querySelector('#link');
    const copy = old.cloneNode(true);
    copy.id = 'link2';
    old.replaceWith(copy);
  });
  await page.locator('#link2').hover();
  await expect.poll(scale).toBeCloseTo(1, 1);
  await page.mouse.move(5, 5);
  await expect.poll(scale).toBe(0);
  // Pointer at the left edge → x near −50vw (−720px at 1440).
  await expect.poll(() => page.locator('.project-link-cursor').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).e))
    .toBeLessThan(-650);
  expect(errors).toEqual([]);
});

test('ix-scroll: a trigger re-rendered after start (Finsweet List) and far down still animates', async ({ page }) => {
  const errors = await open(page, 'https://brandvm.webflow.io/', readyQueue);
  // Replace the section header node, as a list re-render does, and push it
  // three screens further down.
  await page.evaluate(() => {
    const old = document.querySelector('#sh');
    const spacer = document.createElement('div');
    spacer.style.height = '300vh';
    const copy = old.cloneNode(true);
    copy.querySelectorAll('*').forEach((el) => el.removeAttribute('style'));
    old.replaceWith(spacer, copy);
  });
  await page.waitForTimeout(600);
  await page.locator('#sh').scrollIntoViewIfNeeded();
  await expect(page.locator('#sh .text-b')).toHaveCSS('opacity', '1', { timeout: 4000 });
  // Built (not just untouched): GSAP wrote its end state inline.
  await expect(page.locator('#sh .text-b')).toHaveAttribute('style', /opacity/);
  expect(errors).toEqual([]);
});
