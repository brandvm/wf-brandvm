import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

// The starter modules run from the built bundle, on markup as Webflow
// publishes it. Recipes are not in the bundle: they are compiled here the
// way a project's build would compile them once copied into src/modules/.
const js = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8');

async function recipe(dir, code) {
  const result = await esbuild.build({
    stdin: { contents: code, resolveDir: fileURLToPath(new URL(`../.claude/skills/webflow-build/recipes/${dir}/`, import.meta.url)), loader: 'ts' },
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2019',
  });
  return result.outputFiles[0].text;
}

async function setup(page, body, { script = js, init } = {}) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  if (init) await page.addInitScript(init);
  await page.route('https://site.test/', (route) => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html><head></head><body>${body}<script>${script}</script></body></html>`,
  }));
  await page.goto('https://site.test/');
  return errors;
}

test('data-aria-role replaces the role Webflow publishes', async ({ page }) => {
  const errors = await setup(page, `<div class="w-dyn-list"><div role="list" class="w-dyn-items" data-aria-role="rowgroup">
    <div role="listitem" class="w-dyn-item" data-aria-role="row">One</div>
    <div role="listitem" class="w-dyn-item" data-aria-role=" ">Two</div></div></div>`);
  await expect(page.locator('.w-dyn-items')).toHaveAttribute('role', 'rowgroup');
  await expect(page.locator('.w-dyn-item').first()).toHaveAttribute('role', 'row');
  // An empty value leaves Webflow's role in place.
  await expect(page.locator('.w-dyn-item').last()).toHaveAttribute('role', 'listitem');
  expect(errors).toEqual([]);
});

test('data-placeholder becomes the field placeholder', async ({ page }) => {
  const errors = await setup(page, `<input id="name" placeholder="Designer" data-placeholder="Your name">
    <textarea id="message" data-placeholder="Tell us more"></textarea>
    <input id="empty" placeholder="Designer" data-placeholder="">`);
  await expect(page.locator('#name')).toHaveAttribute('placeholder', 'Your name');
  await expect(page.locator('#message')).toHaveAttribute('placeholder', 'Tell us more');
  await expect(page.locator('#empty')).toHaveAttribute('placeholder', 'Designer');
  expect(errors).toEqual([]);
});

// A filter as Webflow publishes it: radios in a Collection List that all
// carry the Designer id "radio".
const radio = (label, checked = '') => `<div class="w-dyn-item"><label class="w-radio">
  <div class="w-form-formradioinput w-radio-input"></div>
  <input type="radio" name="Category" id="radio" value="Radio" ${checked}>
  <span class="w-form-label" for="radio">${label}</span></label></div>`;

// unique-form-ids is not in the brandvm.com bundle during the parity port: it
// would rename the duplicate id="radio" filters on /insights. Re-enable this
// test with the module (a later, measured batch; MIGRATION-PLAN › Stage 5).
test.skip('duplicate CMS radio ids become unique and labels follow', async ({ page }) => {
  const errors = await setup(page, `<form>${radio('All', 'checked')}${radio('Experiential')}${radio('Media Relations')}${radio('All')}</form>
    <input id="solo" type="text"><label for="solo">Solo</label>`);
  const ids = await page.$$eval('input[type=radio]', (els) => els.map((e) => e.id));
  expect(ids).toEqual(['radio-all', 'radio-experiential', 'radio-media-relations', 'radio-all-2']);
  const fors = await page.$$eval('.w-form-label', (els) => els.map((e) => e.getAttribute('for')));
  expect(fors).toEqual(ids);
  // Unique ids are left alone, and nothing else about the control changes.
  await expect(page.locator('#solo')).toHaveCount(1);
  await expect(page.locator('label[for=solo]')).toHaveCount(1);
  expect(await page.$eval('input[type=radio]', (e) => e.checked)).toBe(true);
  expect(errors).toEqual([]);
});

test('video recipe: refused autoplay starts on the first tap, not before', async ({ page }) => {
  const script = await recipe('video', "import { initAutoplayVideo } from './autoplay-video.ts'; initAutoplayVideo();");
  const errors = await setup(page, '<video autoplay muted loop playsinline style="width:320px;height:180px"></video>', {
    script,
    // iOS Low Power Mode: play() rejects until the visitor interacts.
    init: () => {
      window.__allow = false;
      window.__played = 0;
      HTMLMediaElement.prototype.play = function () {
        if (!window.__allow) return Promise.reject(new DOMException('blocked', 'NotAllowedError'));
        window.__played++;
        return Promise.resolve();
      };
    },
  });
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__played)).toBe(0);
  await page.evaluate(() => { window.__allow = true; });
  await page.mouse.click(600, 500);
  await expect.poll(() => page.evaluate(() => window.__played)).toBe(1);
  // The retry is one-shot: a second click does not play again.
  await page.mouse.click(600, 500);
  expect(await page.evaluate(() => window.__played)).toBe(1);
  expect(errors).toEqual([]);
});

// HubSpot's v2 embed: the form is built inside a same-origin about:blank
// iframe, then HubSpot posts an onFormReady message to the page.
test('HubSpot form iframe gets the site look, labels inside the fields', async ({ page }) => {
  const form = `<form class="hs-form stacked">
    <fieldset class="form-columns-2">
      <div class="hs_firstname hs-form-field"><label for="fn"><span>First Name</span><span class="hs-form-required">*</span></label><div class="input"><input id="fn" class="hs-input" type="text" name="firstname" required placeholder=""></div></div>
      <div class="hs_where hs-form-field"><label for="wh"><span>Where did you hear about us?</span></label><div class="input"><select id="wh" class="hs-input is-placeholder" name="where"><option disabled value="">Please Select</option><option value="Google">Google</option></select></div></div>
    </fieldset>
    <fieldset class="form-columns-1"><div class="hs_request hs-form-field"><label for="rq"><span>Tell us more about your project:</span><span class="hs-form-required">*</span></label><legend class="hs-field-desc">Share a bit about your company.</legend><div class="input"><textarea id="rq" class="hs-input" name="request" placeholder=""></textarea></div></div></fieldset>
    <fieldset class="form-columns-1"><div class="hs_TICKET.subject hs-form-field"><div class="input"><input type="hidden" name="TICKET.subject"></div></div></fieldset>
  </form>`;
  const errors = await setup(page, `<div class="hs-form-slot"><iframe class="hs-form-iframe"></iframe></div>
    <script>
      const d = document.querySelector('iframe').contentDocument;
      d.open(); d.write(${JSON.stringify(`<!doctype html><html><head></head><body>${form}</body></html>`)}); d.close();
      setTimeout(() => window.postMessage({ type: 'hsFormCallback', eventName: 'onFormReady', id: 'x' }, '*'), 50);
    </script>`, {
    // Site modules start from Webflow's ready queue; run them right away.
    init: () => { window.Webflow = { push: (fn) => fn() }; },
  });
  const frame = page.frameLocator('iframe.hs-form-iframe');
  await expect(frame.locator('#fn')).toHaveAttribute('placeholder', 'First Name *');
  await expect(frame.locator('label[for=fn]')).toHaveClass(/bv-sr/);
  await expect(frame.locator('#wh option[value=""]')).toHaveText('Where did you hear about us?');
  await expect(frame.locator('#rq')).toHaveAttribute('placeholder', 'Share a bit about your company.');
  await expect(frame.locator('label[for=rq]')).not.toHaveClass(/bv-sr/);
  await expect(frame.locator('fieldset').last()).toHaveClass(/bv-hidden/);
  await expect(frame.locator('#fn')).toHaveCSS('border-radius', /px/);
  expect(await frame.locator('style#bv-hs-style').count()).toBe(1);
  await expect(page.locator('iframe.hs-form-iframe')).toHaveAttribute('data-bv-styled', '1');
  await expect(frame.locator('label[for=rq] span').first()).toHaveText('Tell us more about your project');
  expect(errors).toEqual([]);
});
