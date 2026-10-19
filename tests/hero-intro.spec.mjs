import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// hero-intro.ts on the target Home hero markup (tests/fixtures/home-hero.html).
// Webflow's CSS and images are blocked, so the images miss the 1.2s budget
// and the short version plays; the full version is checked by eye on staging.
const files = {
  '/': ['tests/fixtures/home-hero.html', 'text/html'],
  '/dist/index.js': ['dist/index.js', 'application/javascript'],
  '/dist/styles.css': ['dist/styles.css', 'text/css'],
};

async function open(page, { width = 1440, height = 900, html } = {}) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width, height });
  await page.route('https://cdn.prod.website-files.com/**', (route) => route.abort());
  await page.route('https://site.test/**', (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === '/' && html) return route.fulfill({ body: html, contentType: 'text/html' });
    const [path, type] = files[pathname] || [];
    return path ? route.fulfill({ body: readFileSync(path), contentType: type }) : route.abort();
  });
  await page.goto('https://site.test/');
  return errors;
}

test('hero intro ends in the static end state, desktop', async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator('html')).toHaveClass(/is-hero-done/, { timeout: 6000 });
  await expect(page.locator('html')).not.toHaveClass(/is-hero-running/);
  // Every gated element is visible again, with no inline styles left.
  for (const sel of ['[data-hero-line] > *', '[data-hero-cta] > *', '.hero-panels-fader', '[data-hero-nav]']) {
    const el = page.locator(sel).first();
    await expect(el).toHaveCSS('opacity', '1');
    expect(await el.getAttribute('style')).toBeFalsy();
  }
  await expect(page.locator('.hero-panels-layer-discrete').first()).toHaveCSS('clip-path', 'none');
  // The three desktop windows are drawn.
  const d = await page.locator('#hero-windows path').evaluateAll((paths) => paths.map((p) => p.getAttribute('d')));
  expect(d.every((v) => v && v.startsWith('M'))).toBe(true);
  expect(errors).toEqual([]);
});

test('hero intro: phone runs the phone rig to its end state', async ({ page }) => {
  // Without Webflow's CSS the card has no size, so the windows aren't
  // checked here (staging check by eye); the run must still finish clean.
  const errors = await open(page, { width: 390, height: 844 });
  await expect(page.locator('html')).toHaveClass(/is-hero-done/, { timeout: 6000 });
  await expect(page.locator('[data-hero-line] > *').first()).toHaveCSS('opacity', '1');
  expect(errors).toEqual([]);
});

test('hero intro: CSS failsafe reveals the hero when the bundle never runs', async ({ page }) => {
  await page.route('https://site.test/dist/index.js', (route) => route.abort());
  const errors = await open(page);
  await expect(page.locator('[data-hero-line] > *').first()).toHaveCSS('transform', /matrix/);
  await page.waitForTimeout(4300);
  await expect(page.locator('.hero-panels-layer-discrete').first()).toHaveCSS('clip-path', 'none');
  await expect(page.locator('[data-hero-cta] > *').first()).toHaveCSS('opacity', '1');
  expect(errors).toEqual([]);
});

test('hero intro: inert without [data-hero] (today\'s live markup)', async ({ page }) => {
  const html = readFileSync('tests/fixtures/home-hero.html', 'utf8').replace(' data-hero>', '>');
  const errors = await open(page, { html });
  await page.waitForTimeout(500);
  await expect(page.locator('html')).not.toHaveClass(/is-hero-(running|done)/);
  await expect(page.locator('.hero-panels-layer-discrete').first()).toHaveCSS('clip-path', 'none');
  await expect(page.locator('[data-hero-line] > *').first()).toHaveCSS('opacity', '1');
  expect(errors).toEqual([]);
});
