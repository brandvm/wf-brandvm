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

// hubspot-form-backup.ts: every submission attempt is copied to the team's
// Google Sheet, keyed by one attempt ID: attempt → rejected / accepted.
const FORM = '7a162eb3-35f1-476d-8877-2d1bd30b0f28';
const CONV = 'f40b9197-d176-405b-8b4b-67f7d5ab5fcb';

async function backupPage(page, url) {
  const sent = [];
  await page.addInitScript(() => { window.__bvHsBackupUrl = 'https://backup.test/exec'; });
  await page.route('https://backup.test/**', (route) => {
    sent.push(JSON.parse(route.request().postData()));
    route.fulfill({ status: 200, body: 'ok' });
  });
  await page.route('https://js.hsforms.net/**', (route) => route.abort('blockedbyclient'));
  await page.route(url, (route) => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html><head></head><body><iframe id="other"></iframe>
      <script>window.Webflow = { push: (fn) => fn() };</script><script>${js}</script></body></html>`,
  }));
  await page.goto(url);
  return sent;
}

const post = (page, msg) => page.evaluate((m) => window.postMessage(m, '*'), msg);

test('HubSpot backup: attempt, accepted and rejected go to the Sheet with one attempt ID', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const sent = await backupPage(page, 'https://brandvm.webflow.io/contact');
  const cb = (eventName, data) => ({ type: 'hsFormCallback', eventName, id: FORM, data });

  // Ignored: a validation error before any attempt, a message from another
  // frame, a form ID that isn't one.
  await post(page, cb('onFormError', [{ id: 'email', value: 'x@', errors: ['invalid'] }]));
  const other = page.frames().find((f) => f !== page.mainFrame());
  await other.evaluate((m) => window.parent.postMessage(m, '*'), cb('onFormSubmitted', { conversionId: CONV }));
  await post(page, { type: 'hsFormCallback', eventName: 'onBeforeFormSubmit', id: 'x', data: [] });

  await post(page, cb('onBeforeFormSubmit', [{ name: 'firstname', value: 'GTM' }, { name: 'services', value: ['Branding', 'SEO'] }]));
  await post(page, cb('onFormSubmitted', { conversionId: CONV, submissionValues: { firstname: 'GTM', services: 'Branding;SEO' } }));
  await post(page, cb('onBeforeFormSubmit', [{ name: 'firstname', value: 'Bot' }]));
  await post(page, cb('onFormError', { status: 400, data: { formSubmissionError: 'RECAPTCHA_VALIDATION_ERROR' } }));

  await expect.poll(() => sent.length).toBe(4);
  const [a, ok, b, bad] = sent;
  expect(a).toMatchObject({ v: 1, status: 'attempt', formId: FORM, host: 'brandvm.webflow.io', answers: { firstname: 'GTM', services: 'Branding; SEO' } });
  expect(a.page).toBe('https://brandvm.webflow.io/contact');
  expect(ok).toMatchObject({ status: 'accepted', attemptId: a.attemptId, conversionId: CONV, answers: { firstname: 'GTM' } });
  expect(b.attemptId).not.toBe(a.attemptId);
  expect(bad).toMatchObject({ status: 'rejected', attemptId: b.attemptId, error: 'RECAPTCHA_VALIDATION_ERROR (HTTP 400)' });
  expect(bad.answers).toBeUndefined();
  // Nothing personal reaches the data layer.
  expect(await page.evaluate(() => JSON.stringify(window.dataLayer || []))).not.toContain('GTM');
  expect(errors).toEqual([]);
});

test('HubSpot backup: on brandvm.com only the built-in URL counts', async ({ page }) => {
  // Stand in for the team's Sheet: nothing here reaches the real one.
  const live = [];
  await page.route('https://script.google.com/**', (route) => {
    live.push(JSON.parse(route.request().postData()));
    route.fulfill({ status: 200, body: 'ok' });
  });
  const sent = await backupPage(page, 'https://www.brandvm.com/contact');
  await post(page, { type: 'hsFormCallback', eventName: 'onBeforeFormSubmit', id: FORM, data: [{ name: 'firstname', value: 'X' }] });
  await expect.poll(() => live.length).toBe(1);
  expect(live[0]).toMatchObject({ status: 'attempt', host: 'www.brandvm.com' });
  expect(sent).toEqual([]);
});
