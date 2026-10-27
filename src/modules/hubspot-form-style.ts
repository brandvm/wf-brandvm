// Brand Vision look for HubSpot forms (contact form design, 2026-10-19).
//
// HubSpot's v2 embed renders the form inside a same-origin iframe
// (about:blank), so the site stylesheet never reaches it. This module puts
// its own stylesheet into that iframe, and makes small display-only changes
// to the form HubSpot built. Fields, wording, validation, reCAPTCHA, file
// upload and submission all stay HubSpot's: the form is edited in HubSpot.
//
// Display changes, all reversible by removing this module:
// - Text inputs and selects show their label inside the field (placeholder,
//   or the empty "Please Select" option); the label stays in the DOM for
//   screen readers. Required fields get " *".
// - The textarea keeps its visible label; HubSpot's help text under it
//   becomes the placeholder (still linked with aria-describedby).
// - The file input is shown as a dashed "File upload" pill with the chosen
//   file name next to it.
// - The iframe follows the page's fluid root font-size, so the form scales
//   with the rest of the site, and its height follows the form.

// Fallback for the site's Inter Variable (a Webflow-hosted asset); the
// loaded URL is read from the page first, so a re-uploaded font still works.
const INTER_FALLBACK =
  'https://cdn.prod.website-files.com/68b9f0236581de795cba8ec2/69c5abc372411d68671b6a8f_InterVariable.woff2';

const P = ':root.bv-hs .hs-form.bv-form';
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2.5 4.5 6 8l3.5-3.5' fill='none' stroke='%23010101' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";
const LINK_ICON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/%3E%3Cpath d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/%3E%3C/svg%3E\")";

function css(fontUrl: string) {
  return `
@font-face{font-family:"Inter Variable";src:url("${fontUrl}") format("woff2");font-weight:100 900;font-style:normal;font-display:swap}
:root.bv-hs{--bv-text:#010101;--bv-muted:#808287;--bv-field:#f5f7fb;--bv-line:#e4e6e9;--bv-dash:#d5d5d5;--bv-accent:#cb341a;--bv-accent-hover:#b02c15}
:root.bv-hs body{margin:0;font-family:"Inter Variable",Arial,sans-serif;color:var(--bv-text);-webkit-font-smoothing:antialiased}
${P}{display:flex;flex-direction:column;gap:1rem;max-width:none;margin:0;font-family:inherit;font-size:1rem;line-height:1.4}
${P} fieldset{display:flex;gap:1rem;max-width:none;margin:0;padding:0;border:0;min-width:0}
${P} fieldset.bv-hidden{display:none}
${P} fieldset .hs-form-field,${P} .hs-form-field{flex:1 1 0;width:auto;float:none;min-width:0;margin:0;padding:0}
${P} .input{margin:0}
${P} label,${P} .hs-field-desc,${P} .hs-richtext,${P} .hs-button,${P} .hs-input{font-family:inherit}
${P} .hs-form-field>label{display:block;width:auto;margin:0 0 .75rem;padding:0;font-size:1rem;font-weight:400;line-height:1.4;color:var(--bv-text)}
${P} .hs-form-required{color:inherit;margin-left:.15em}
${P} .hs-field-desc{margin:-.4rem 0 .75rem;font-size:.875rem;line-height:1.4;color:var(--bv-muted)}
${P} .bv-sr{position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important;border:0!important}

${P} :where(input.hs-input:not([type=file],[type=checkbox],[type=radio]),select.hs-input),
${P} .hs-fieldtype-intl-phone.hs-input{display:block;width:100%;max-width:none;height:3.5rem;margin:0;padding:0 1.5rem;border:1px solid var(--bv-line);border-radius:999px;background-color:var(--bv-field);box-shadow:none;outline:none;font-size:1rem;font-weight:400;line-height:1.4;color:var(--bv-text);transition:border-color .2s}
${P} .hs-input::placeholder{color:var(--bv-muted);opacity:1}
${P} :where(input.hs-input:not([type=file]),select.hs-input,textarea.hs-input):hover,${P} .hs-fieldtype-intl-phone.hs-input:hover{border-color:#c9ccd3}
${P} :where(input.hs-input:not([type=file]),select.hs-input,textarea.hs-input):focus,${P} .hs-fieldtype-intl-phone.hs-input:focus-within{border-color:var(--bv-text)}
${P} .hs-fieldtype-intl-phone.hs-input>.hs-input:hover,${P} .hs-fieldtype-intl-phone.hs-input>.hs-input:focus{border-color:var(--bv-line)}
${P} select.hs-input,${P} select.hs-input.is-placeholder{appearance:none;-webkit-appearance:none;padding-right:3rem;color:var(--bv-text);background-image:${CHEVRON};background-repeat:no-repeat;background-position:right 1.5rem center;background-size:.85rem;cursor:pointer;text-overflow:ellipsis}
${P} select.hs-input option{color:var(--bv-text)}

${P} .hs-fieldtype-intl-phone.hs-input{display:flex;align-items:center;gap:.75rem}
${P} .hs-fieldtype-intl-phone.hs-input>.hs-input{float:none;flex:1 1 auto;width:auto;min-width:0;height:100%;margin:0;padding:0;border:0;border-radius:0;background-color:transparent}
${P} .hs-fieldtype-intl-phone.hs-input>select.hs-input{flex:0 0 auto;width:7.5em;field-sizing:content;max-width:45%;padding-right:1.4rem;background-position:right 0 center}
${P} .hs-fieldtype-intl-phone.hs-input>input.hs-input{padding-left:.75rem;border-left:1px solid var(--bv-line);height:1.6rem}

${P} :where(textarea.hs-input){display:block;width:100%;max-width:none;height:7rem;min-height:5rem;margin:0;padding:1rem 1.5rem;border:1px solid var(--bv-line);border-radius:1rem;background-color:var(--bv-field);font-size:1rem;line-height:1.5;color:var(--bv-text);resize:vertical}

${P} .hs-fieldtype-file{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .75rem}
${P} .hs-fieldtype-file>label{display:inline-flex;align-items:center;gap:.6rem;height:3.5rem;margin:0;padding:0 1.5rem;border:1px dashed var(--bv-dash);border-radius:999px;cursor:pointer;transition:border-color .2s}
${P} .hs-fieldtype-file>label::before{content:"";width:1.3rem;height:1.3rem;flex:none;background:currentColor;-webkit-mask:${LINK_ICON} center/contain no-repeat;mask:${LINK_ICON} center/contain no-repeat}
${P} .hs-fieldtype-file>label:hover{border-color:#9da1aa}
${P} .hs-fieldtype-file:has(input:focus-visible)>label{outline:2px solid var(--bv-text);outline-offset:2px}
${P} .hs-fieldtype-file .input{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
${P} .bv-file-name{font-size:.875rem;color:var(--bv-muted);overflow-wrap:anywhere}
${P} .hs-fieldtype-file .hs-error-msgs{flex-basis:100%}

${P} .hs-error-msgs{list-style:none;margin:.5rem 0 0 1.5rem;padding:0}
${P} .hs-error-msgs label,${P} .hs-error-msg,${P} .hs-main-font-element{margin:0;font-size:.875rem;font-weight:400;line-height:1.4;color:var(--bv-accent)}
${P} .hs-input.invalid.error,${P} .hs-input.error,${P} .hs-fieldtype-intl-phone.hs-input:has(.error){border-color:var(--bv-accent)}
${P} .hs_error_rollup .hs-error-msgs{margin-left:0}

${P} .hs_recaptcha{margin:0}
${P} .hs_submit{margin-top:1rem}
${P} .hs_submit .actions{margin:0;padding:0}
${P} .hs-button,${P} .hs-button:hover:not(.inactive),${P} .hs-button:focus:not(.inactive){height:3rem;margin:0;padding:0 1.25rem;border:0;border-radius:999px;background:var(--bv-accent);box-shadow:none;color:#fff;font-size:1rem;font-weight:500;line-height:1;cursor:pointer;transition:background-color .2s}
${P} .hs-button:hover:not(.inactive){background:var(--bv-accent-hover)}
${P} .hs-button:focus-visible{outline:2px solid var(--bv-text);outline-offset:2px}

:root.bv-hs .submitted-message{font-family:"Inter Variable",Arial,sans-serif;font-size:1.15rem;line-height:1.5;color:var(--bv-text)}

@media (max-width:479px){${P} fieldset{flex-direction:column}${P} :where(textarea.hs-input){height:10rem}}
@media (hover:none) and (pointer:coarse){${P} :where(.hs-input){font-size:max(1rem,16px)}}
`;
}

function fontUrl() {
  const loaded = performance
    .getEntriesByType('resource')
    .map((entry) => entry.name)
    .find((name) => /InterVariable[^/]*\.woff2/i.test(name));
  return loaded || INTER_FALLBACK;
}

function labelText(label: Element) {
  const span = label.querySelector('span:not(.hs-form-required)');
  return (span ? span.textContent : label.textContent || '').trim().replace(/[:*]+$/, '').trim();
}

let ids = 0;

function enhanceFields(form: HTMLFormElement) {
  form.querySelectorAll('fieldset').forEach((fieldset) => {
    const visible = fieldset.querySelector('input:not([type=hidden]), select, textarea');
    fieldset.classList.toggle('bv-hidden', !visible);
  });

  form.querySelectorAll<HTMLElement>('.hs-form-field').forEach((field) => {
    const label = field.querySelector<HTMLLabelElement>(':scope > label');
    if (!label || field.dataset.bvDone) return;
    field.dataset.bvDone = '1';
    const text = labelText(label);
    const required = !!label.querySelector('.hs-form-required');
    const shown = text + (required ? ' *' : '');

    const textarea = field.querySelector<HTMLTextAreaElement>('textarea');
    const file = field.querySelector<HTMLInputElement>('input[type=file]');
    const phone = field.querySelector('.hs-fieldtype-intl-phone');
    const select = field.querySelector<HTMLSelectElement>('select');
    const input = field.querySelector<HTMLInputElement>('input[type=text], input[type=email], input[type=tel], input[type=number], input[type=url]');

    if (textarea) {
      // "Tell us more about your project:" reads as a heading in the design.
      const span = label.querySelector('span:not(.hs-form-required)');
      if (span) span.textContent = text;
      const desc = field.querySelector<HTMLElement>(':scope > .hs-field-desc');
      const help = desc && desc.textContent ? desc.textContent.trim() : '';
      if (desc && help && !textarea.placeholder) {
        if (!desc.id) desc.id = 'bv-desc-' + ++ids;
        textarea.placeholder = help;
        textarea.setAttribute('aria-describedby', desc.id);
        desc.classList.add('bv-sr');
      }
    } else if (file) {
      const name = field.ownerDocument.createElement('span');
      name.className = 'bv-file-name';
      name.setAttribute('aria-live', 'polite');
      label.after(name);
      file.addEventListener('change', () => {
        name.textContent = Array.from(file.files || []).map((f) => f.name).join(', ');
      });
    } else if (phone) {
      label.classList.add('bv-sr');
      const country = phone.querySelector('select');
      if (country && !country.getAttribute('aria-label')) country.setAttribute('aria-label', text + ' country');
    } else if (select) {
      const empty = select.querySelector('option[value=""]');
      if (empty) {
        empty.textContent = shown;
        label.classList.add('bv-sr');
      }
    } else if (input) {
      if (!input.placeholder) input.placeholder = shown;
      label.classList.add('bv-sr');
    }
  });
}

function syncFontSize(doc: Document) {
  doc.documentElement.style.fontSize = getComputedStyle(document.documentElement).fontSize;
}

const styled = new WeakSet<HTMLIFrameElement>();
let resizeBound = false;

function syncAll() {
  document.querySelectorAll<HTMLIFrameElement>('iframe.hs-form-iframe').forEach((iframe) => {
    try {
      if (styled.has(iframe) && iframe.contentDocument) syncFontSize(iframe.contentDocument);
    } catch (error) {
      /* cross-origin: not ours */
    }
  });
}

export function styleHubSpotIframe(iframe: HTMLIFrameElement) {
  let doc: Document | null = null;
  try {
    doc = iframe.contentDocument;
  } catch (error) {
    return;
  }
  const form = doc && doc.querySelector<HTMLFormElement>('form.hs-form');
  if (!doc || !form) return;

  if (!styled.has(iframe)) {
    styled.add(iframe);
    const style = doc.createElement('style');
    style.id = 'bv-hs-style';
    style.textContent = css(fontUrl());
    doc.head.appendChild(style);
    doc.documentElement.classList.add('bv-hs');
    syncFontSize(doc);

    // Keep the iframe as tall as its content (HubSpot sizes it once, for
    // its own default styles), including validation messages and the
    // thank-you message after submitting.
    const view = doc.defaultView as (Window & typeof globalThis) | null;
    const body = doc.body;
    // hubspot-form.ts holds the slot's reserved space until data-bv-styled
    // is set, from the observer: measured synchronously, the body could
    // still report HubSpot's own height (560px at 992px wide, released
    // the space early and shifted the page 0.10).
    const fit = () => {
      const height = Math.ceil(body.getBoundingClientRect().height);
      if (height > 0) iframe.style.height = height + 'px';
    };
    if (view && 'ResizeObserver' in view) {
      new view.ResizeObserver(() => {
        fit();
        iframe.dataset.bvStyled = '1';
      }).observe(body);
    } else {
      iframe.dataset.bvStyled = '1';
    }
    fit();

    // HubSpot re-renders parts of the form (errors, dependent fields).
    if (view && 'MutationObserver' in view) {
      new view.MutationObserver(() => {
        const current = doc!.querySelector<HTMLFormElement>('form.hs-form');
        if (current) {
          current.classList.add('bv-form');
          enhanceFields(current);
        }
      }).observe(body, { childList: true, subtree: true });
    }
  }
  form.classList.add('bv-form');
  enhanceFields(form);

  if (!resizeBound) {
    resizeBound = true;
    let frame = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncAll);
    }, { passive: true });
  }
}

export function styleHubSpotForms() {
  document.querySelectorAll<HTMLIFrameElement>('iframe.hs-form-iframe').forEach(styleHubSpotIframe);
}
