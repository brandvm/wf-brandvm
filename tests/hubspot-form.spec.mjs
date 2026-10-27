import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// hubspot-form.ts: the slot's height is reserved until the form renders;
// if HubSpot can't load (a blocker), the space stays and shows contact
// details instead of closing (no layout shift either way).
const js = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');

test('HubSpot blocked: the reserved space stays and shows contact details', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 412, height: 823 });
  await page.route('https://js.hsforms.net/**', (route) => route.abort('blockedbyclient'));
  await page.route('https://brandvm.webflow.io/*', (route) => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html data-wf-domain="brandvm.webflow.io"><head><style>${css}</style></head><body>
      <div class="hs-form-slot" data-hs-form="7a162eb3" data-hs-portal="22077182" data-hs-region="na1"></div>
      <p id="below">Below the form</p>
      <script>window.Webflow = { push: (fn) => fn() };</script><script>${js}</script></body></html>`,
  }));
  await page.goto('https://brandvm.webflow.io/');
  const slot = page.locator('.hs-form-slot');
  await expect(slot.locator('.hs-form-fallback')).toBeVisible();
  await expect(slot.locator('a[href^="mailto:"]')).toHaveText('info@brandvm.com');
  await expect(slot.locator('a[href^="tel:"]')).toBeVisible();
  // Still the reserved height: nothing below moved.
  const [height, root] = await slot.evaluate((el) => [el.getBoundingClientRect().height, parseFloat(getComputedStyle(document.documentElement).fontSize)]);
  expect(Math.round(height)).toBe(Math.round(49 * root + 60));
  await expect(slot).not.toHaveClass(/is-ready/);
  expect(errors).toEqual([]);
});
