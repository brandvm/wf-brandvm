import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Finsweet attributes start only near the viewport or on first input: List
// nesting fetches every nested item's page, which competed with the hero at
// load on Home.
const js = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8');

async function open(page, top) {
  await page.route('https://www.brandvm.com/*', (route) => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html><body><div style="height:${top}px"></div>
      <div fs-list-element="list"><div fs-list-element="item">One</div></div>
      <div style="height:4000px"></div>
      <script>window.Webflow = { push: (fn) => fn() };</script><script>${js}</script></body></html>`,
  }));
  await page.goto('https://www.brandvm.com/');
}

const started = (page) => page.evaluate(() => window.FinsweetAttributes?.process?.has('list') ?? false);

test('finsweet: a list far below the fold waits for scroll', async ({ page }) => {
  await open(page, 6000);
  await page.waitForTimeout(300);
  expect(await started(page)).toBe(false);
  await page.mouse.wheel(0, 200);
  await expect.poll(() => started(page)).toBe(true);
});

test('finsweet: a list near the viewport starts at once', async ({ page }) => {
  await open(page, 100);
  await expect.poll(() => started(page)).toBe(true);
});
