import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Stage 4 FAQ / Services hub / Filter CSS (on Webflow's .w--open) and
// c-drop.ts, staging-only behind ?wfc-ix=repo. Webflow's dropdown script
// isn't loaded here, so the tests set .w--open the way it does.
const js = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
const tall = '<p style="height:300px;margin:0">Answer</p>';
const markup = `
  <div class="faqs-accordion w-dropdown"><div class="faqs-accordion-toggle w-dropdown-toggle">Q
    <div class="faqs-accordion-icon-w">+</div></div>
    <div class="faqs-accordion-list w-dropdown-list"><div class="faqs-accordion-content" style="padding-bottom:16px">${tall}</div></div></div>
  <div class="filter-drop w-dropdown"><div class="filter-drop-toggle w-dropdown-toggle">Sort</div>
    <nav class="filter-drop-list w-dropdown-list"><div class="filter-drop-content" style="margin-top:8px;padding:4px">${tall}</div></nav></div>
  <div class="c-drop"><div class="c-drop-content" style="overflow:clip;position:relative">${tall}${tall}
    <a href="#x" id="inner-link">link</a><div class="c-drop-content-fader"></div></div>
    <div class="c-drop-toggle"><div class="c-drop-toggle-label to-open">Learn More</div>
    <div class="c-drop-toggle-label to-close">Learn Less</div></div></div>`;

async function open(page, url, reduced = 'reduce') {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: reduced });
  await page.route(url.split('?')[0] + '*', (route) => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html><head><style>${css}</style></head><body>${markup}
      <script>window.Webflow = { push: (fn) => fn() };</script><script>${js}</script></body></html>`,
  }));
  await page.goto(url);
  return errors;
}

const height = (page, selector) => page.locator(selector).evaluate((el) => el.getBoundingClientRect().height);

test('dropdowns: nothing changes on the live domain', async ({ page }) => {
  const errors = await open(page, 'https://www.brandvm.com/?wfc-ix=repo');
  await expect(page.locator('html')).not.toHaveClass(/wfc-ix/);
  await expect(page.locator('.c-drop-toggle')).not.toHaveAttribute('aria-expanded', /.*/);
  expect(errors).toEqual([]);
});

test('dropdowns: FAQ and filter collapse to 0 and open to full height', async ({ page }) => {
  const errors = await open(page, 'https://brandvm.webflow.io/?wfc-ix=repo');
  for (const name of ['faqs-accordion', 'filter-drop']) {
    expect(await height(page, `.${name}-list`)).toBe(0);
    await expect(page.locator(`.${name}-list`)).toBeHidden();
    await page.locator(`.${name}-list`).evaluate((el) => el.classList.add('w--open'));
    await expect.poll(() => height(page, `.${name}-list`)).toBeGreaterThanOrEqual(300);
    await expect(page.locator(`.${name}-list`)).toBeVisible();
  }
  await page.locator('.faqs-accordion-toggle').evaluate((el) => el.classList.add('w--open'));
  await expect.poll(() => page.locator('.faqs-accordion-icon-w').evaluate((el) => getComputedStyle(el).transform))
    .not.toBe('none');
  expect(errors).toEqual([]);
});

test('c-drop: click and keyboard toggle, labels swap, links pass through', async ({ page }) => {
  const errors = await open(page, 'https://brandvm.webflow.io/?wfc-ix=repo', 'no-preference');
  const toggle = page.locator('.c-drop-toggle');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toHaveAttribute('aria-controls', 'c-drop-content-1');
  expect(await height(page, '.c-drop-content')).toBe(80);
  await expect(page.locator('.to-close')).toBeHidden();

  await toggle.click();
  await expect(page.locator('.c-drop')).toHaveClass(/is-open/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.to-open')).toBeHidden();
  await expect(page.locator('.to-close')).toBeVisible();
  // Settles on auto once the 740ms transition ends.
  await expect.poll(() => page.locator('.c-drop-content').evaluate((el) => el.style.getPropertyValue('--c-drop-h')))
    .toBe('auto');
  expect(await height(page, '.c-drop-content')).toBeGreaterThanOrEqual(600);

  await page.locator('#inner-link').click();
  await expect(page.locator('.c-drop')).toHaveClass(/is-open/);

  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.c-drop')).not.toHaveClass(/is-open/);
  await expect.poll(() => height(page, '.c-drop-content')).toBe(80);
  await page.keyboard.press(' ');
  await expect(page.locator('.c-drop')).toHaveClass(/is-open/);
  expect(errors).toEqual([]);
});
