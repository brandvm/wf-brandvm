import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// nav.ts: the repo nav (Webflow's IX2 deleted 2026-10-20). Fixtures carry
// data-wf-domain like published pages; the CSS is scoped to it.
const js = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
const nav = `<div class="g-nav-w"><nav class="s-g-nav">
  <div class="g-nav-menu"><ul><li><a href="#" class="g-nav-close-button">×</a></li>
    <li><a href="#section" id="anchor">Anchor</a></li></ul></div>
  <div class="g-nav-drop w-dropdown"><div class="g-nav-drop-toggle w-dropdown-toggle">Services</div>
    <nav class="g-nav-drop-list w-dropdown-list"><div class="g-nav-drop-content-w"><div>Panel</div></div></nav></div>
  <a href="#" class="g-nav-menu-button">☰</a></nav></div><div id="section" style="height:200vh"></div>`;

async function open(page, url) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route(url.split('?')[0] + '*', (route) => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html data-wf-domain="brandvm.webflow.io"><head><style>${css}</style></head><body>${nav}
      <script>window.Webflow = { push: (fn) => fn() };</script><script>${js}</script></body></html>`,
  }));
  await page.goto(url);
  return errors;
}

test('nav: on on the live domain', async ({ page }) => {
  const errors = await open(page, 'https://www.brandvm.com/');
  await expect(page.locator('.g-nav-menu-button')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.g-nav-menu')).toBeHidden();
  expect(errors).toEqual([]);
});

test('nav: mobile menu opens, closes, Escape and focus', async ({ page }) => {
  const errors = await open(page, 'https://brandvm.webflow.io/');
  const button = page.locator('.g-nav-menu-button');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toHaveAttribute('aria-controls', 'g-nav-menu');
  await button.click();
  await expect(page.locator('.g-nav-menu')).toHaveClass(/is-open/);
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.g-nav-close-button')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.g-nav-menu')).not.toHaveClass(/is-open/);
  await expect(button).toBeFocused();
  await button.click();
  await page.locator('.g-nav-close-button').dispatchEvent('click');
  await expect(page.locator('.g-nav-menu')).not.toHaveClass(/is-open/);
  expect(page.url()).not.toContain('#');
  expect(errors).toEqual([]);
});

test('nav: closed panels are not laid out until the visitor heads for the nav', async ({ page }) => {
  const errors = await open(page, 'https://brandvm.webflow.io/');
  await page.setViewportSize({ width: 1440, height: 900 });
  const panel = page.locator('.g-nav-drop-list');
  // display: none keeps the browser from fetching the panels' lazy images.
  await expect(panel).toHaveCSS('display', 'none');
  await page.locator('.g-nav-drop-toggle').hover();
  await expect(page.locator('html')).toHaveClass(/is-nav-ready/);
  await expect(panel).toHaveCSS('display', 'block');
  await expect(panel).toHaveCSS('visibility', 'hidden');
  expect(errors).toEqual([]);
});
