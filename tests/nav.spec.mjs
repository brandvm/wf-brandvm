import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// nav.ts + ix-flag.ts: repo nav only on *.webflow.io with ?wfc-ix=repo.
const js = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
const nav = `<div class="g-nav-w"><nav class="s-g-nav">
  <div class="g-nav-menu"><ul><li><a href="#" class="g-nav-close-button">×</a></li>
    <li><a href="#section" id="anchor">Anchor</a></li></ul></div>
  <a href="#" class="g-nav-menu-button">☰</a></nav></div><div id="section" style="height:200vh"></div>`;

async function open(page, url) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route(url.split('?')[0] + '*', (route) => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html><head><style>${css}</style></head><body>${nav}
      <script>window.Webflow = { push: (fn) => fn() };</script><script>${js}</script></body></html>`,
  }));
  await page.goto(url);
  return errors;
}

test('nav: off on the live domain even with the flag', async ({ page }) => {
  const errors = await open(page, 'https://www.brandvm.com/?wfc-ix=repo');
  await expect(page.locator('html')).not.toHaveClass(/wfc-ix/);
  await expect(page.locator('.g-nav-menu-button')).not.toHaveAttribute('aria-expanded', /.*/);
  expect(errors).toEqual([]);
});

test('nav: mobile menu opens, closes, Escape and focus (staging flag)', async ({ page }) => {
  const errors = await open(page, 'https://brandvm.webflow.io/?wfc-ix=repo');
  await expect(page.locator('html')).toHaveClass(/wfc-ix/);
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

test('nav: the flag is remembered, and ?wfc-ix=off clears it', async ({ page }) => {
  await open(page, 'https://brandvm.webflow.io/?wfc-ix=repo');
  await page.goto('https://brandvm.webflow.io/');
  await expect(page.locator('html')).toHaveClass(/wfc-ix/);
  await page.goto('https://brandvm.webflow.io/?wfc-ix=off');
  await expect(page.locator('html')).not.toHaveClass(/wfc-ix/);
  await page.goto('https://brandvm.webflow.io/');
  await expect(page.locator('html')).not.toHaveClass(/wfc-ix/);
});
