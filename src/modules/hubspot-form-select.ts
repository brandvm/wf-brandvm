// Custom dropdowns for the selects in HubSpot forms (contact form design,
// 2026-10-27). Used by hubspot-form-style.ts on fine pointers only: phones
// and tablets keep the native picker, which is better there.
//
// The native <select> stays in the form, visually hidden by its
// [data-bv-custom] attribute (HubSpot's React rewrites its class on every
// change, so a class would not stay), and keeps its
// name, value, validation and HubSpot's own change handling: picking an
// option sets its value through the native setter (HubSpot's form is React)
// and fires input/change/focusout. A button styled like the field stands in
// for it inside HubSpot's iframe.
//
// The list opens in the page, not in the iframe: the iframe is only as tall
// as the form, so a list inside it would be cut off. It is position: fixed
// over the button (styles.css, "HubSpot form dropdown"), flips above when
// there is no room below, and follows scroll and resize. Long lists (the
// phone country, 234 options) get a filter field.
//
// Keyboard: on the button, Enter/Space/Arrow keys open; in the list, arrows,
// Home/End, Page Up/Down, Enter or Space to pick, Escape or Tab to close,
// letters to jump (or to filter, in long lists). Focus returns to the button.
//
// A select can pin a few values to the top of its list, above a divider
// (the phone country: Canada, United States, United Kingdom, Australia).
// Pinned options aren't repeated below; while filtering, the divider hides
// and the list is just the matches. Only the custom list is reordered:
// the native select's options belong to HubSpot's React, so phones keep
// HubSpot's alphabetical order.

const FILTER_FROM = 15;
const pinnedFor = new WeakMap<HTMLSelectElement, string[]>();

type Open = {
  select: HTMLSelectElement;
  button: HTMLButtonElement;
  iframe: HTMLIFrameElement;
  panel: HTMLElement;
  list: HTMLElement;
  filter: HTMLInputElement | null;
  options: HTMLElement[];
  active: number;
};

let open: Open | null = null;
let ids = 0;
let bound = false;

function realOptions(select: HTMLSelectElement) {
  return Array.from(select.options).filter((o) => !o.disabled && o.value !== '');
}

function currentText(select: HTMLSelectElement) {
  const o = select.selectedOptions[0];
  return o ? o.textContent || '' : '';
}

function sync(select: HTMLSelectElement, button: HTMLButtonElement, name: string) {
  const text = currentText(select);
  button.querySelector('.bv-select-text')!.textContent = text;
  button.classList.toggle('is-placeholder', !select.value);
  button.setAttribute('aria-label', select.value ? `${name}: ${text}` : name);
}

function pick(select: HTMLSelectElement, value: string) {
  const view = select.ownerDocument.defaultView as (Window & typeof globalThis) | null;
  const proto = view ? view.HTMLSelectElement.prototype : HTMLSelectElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
  setter.call(select, value);
  const Ev = view ? view.Event : Event;
  select.dispatchEvent(new Ev('input', { bubbles: true }));
  select.dispatchEvent(new Ev('change', { bubbles: true }));
  const Focus = view ? view.FocusEvent : FocusEvent;
  select.dispatchEvent(new Focus('focusout', { bubbles: true }));
  select.dispatchEvent(new Focus('blur'));
}

function place(o: Open) {
  const frame = o.iframe.getBoundingClientRect();
  const r = o.button.getBoundingClientRect();
  const left = frame.left + o.iframe.clientLeft + r.left;
  const top = frame.top + o.iframe.clientTop + r.top;
  const gap = 6;
  const below = window.innerHeight - (top + r.height) - gap - 8;
  const above = top - gap - 8;
  // At most 20rem tall, less when the window has no room for it.
  const cap = 20 * parseFloat(getComputedStyle(document.documentElement).fontSize);
  const wanted = Math.min(o.panel.scrollHeight, cap);
  const up = below < wanted && above > below;
  const width = Math.max(r.width, o.select.closest('.hs-fieldtype-intl-phone') ? 280 : 0);
  o.panel.style.left = Math.max(8, Math.min(left, window.innerWidth - width - 8)) + 'px';
  o.panel.style.width = width + 'px';
  o.panel.style.maxHeight = Math.min(cap, Math.max(120, up ? above : below)) + 'px';
  o.panel.style.top = up ? '' : top + r.height + gap + 'px';
  o.panel.style.bottom = up ? window.innerHeight - top + gap + 'px' : '';
  o.panel.classList.toggle('is-up', up);
}

function setActive(o: Open, index: number) {
  const shown = o.options.filter((el) => !el.hidden);
  if (!shown.length) {
    o.active = -1;
    (o.filter || o.list).removeAttribute('aria-activedescendant');
    return;
  }
  const i = Math.max(0, Math.min(index, shown.length - 1));
  o.options.forEach((el) => el.classList.remove('is-active'));
  const el = shown[i];
  el.classList.add('is-active');
  o.active = i;
  (o.filter || o.list).setAttribute('aria-activedescendant', el.id);
  el.scrollIntoView({ block: 'nearest' });
}

function close(focusButton = true) {
  const o = open;
  if (!o) return;
  open = null;
  o.panel.remove();
  o.button.setAttribute('aria-expanded', 'false');
  o.button.removeAttribute('aria-controls');
  if (focusButton) o.button.focus({ preventScroll: true });
}

function choose(o: Open) {
  const shown = o.options.filter((el) => !el.hidden);
  const el = shown[o.active];
  if (el) pick(o.select, el.dataset.value || '');
  close();
}

let typed = '';
let typedAt = 0;

function typeahead(o: Open, key: string) {
  const now = Date.now();
  typed = now - typedAt > 600 ? key : typed + key;
  typedAt = now;
  const q = typed.toLowerCase();
  const shown = o.options.filter((el) => !el.hidden);
  const i = shown.findIndex((el) => (el.textContent || '').toLowerCase().startsWith(q));
  if (i >= 0) setActive(o, i);
}

function onKey(event: KeyboardEvent) {
  const o = open;
  if (!o) return;
  const shown = o.options.filter((el) => !el.hidden).length;
  const page = 8;
  switch (event.key) {
    case 'ArrowDown': setActive(o, o.active + 1); break;
    case 'ArrowUp': setActive(o, o.active - 1); break;
    case 'PageDown': setActive(o, o.active + page); break;
    case 'PageUp': setActive(o, o.active - page); break;
    case 'Home': if (o.filter) return; setActive(o, 0); break;
    case 'End': if (o.filter) return; setActive(o, shown - 1); break;
    case 'Enter': choose(o); break;
    case ' ': if (o.filter) return; choose(o); break;
    case 'Escape': close(); break;
    case 'Tab': close(); break;
    default:
      if (!o.filter && event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) typeahead(o, event.key);
      return;
  }
  event.preventDefault();
}

function build(select: HTMLSelectElement, button: HTMLButtonElement, iframe: HTMLIFrameElement, name: string) {
  const panel = document.createElement('div');
  panel.className = 'bv-hs-dropdown';
  panel.setAttribute('data-lenis-prevent', '');
  const listId = 'bv-hs-list-' + ++ids;
  const list = document.createElement('div');
  list.className = 'bv-hs-dropdown-list';
  list.id = listId;
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', name);
  list.tabIndex = -1;

  let filter: HTMLInputElement | null = null;
  const choices = realOptions(select);
  if (choices.length >= FILTER_FROM) {
    filter = document.createElement('input');
    filter.type = 'text';
    filter.className = 'bv-hs-dropdown-filter';
    filter.placeholder = 'Search';
    filter.autocomplete = 'off';
    filter.setAttribute('role', 'combobox');
    filter.setAttribute('aria-label', 'Search ' + name.toLowerCase());
    filter.setAttribute('aria-controls', listId);
    filter.setAttribute('aria-expanded', 'true');
    filter.setAttribute('aria-autocomplete', 'list');
    panel.appendChild(filter);
  }

  const pins = pinnedFor.get(select) || [];
  const rank = (o: HTMLOptionElement) => {
    const i = pins.indexOf(o.value);
    return i < 0 ? pins.length : i;
  };
  const ordered = choices.slice().sort((a, b) => rank(a) - rank(b) || a.index - b.index);
  const pinnedCount = ordered.filter((o) => pins.includes(o.value)).length;
  const options: HTMLElement[] = ordered.map((option) => {
    const el = document.createElement('div');
    el.className = 'bv-hs-dropdown-option';
    el.id = listId + '-' + option.index;
    el.setAttribute('role', 'option');
    el.dataset.value = option.value;
    el.textContent = option.textContent;
    const selected = option.value === select.value;
    el.setAttribute('aria-selected', String(selected));
    return el;
  });
  let divider: HTMLElement | null = null;
  options.forEach((el, i) => {
    if (i === pinnedCount && pinnedCount > 0) {
      divider = document.createElement('div');
      divider.className = 'bv-hs-dropdown-divider';
      divider.setAttribute('role', 'separator');
      list.appendChild(divider);
    }
    list.appendChild(el);
  });
  panel.appendChild(list);

  const o: Open = { select, button, iframe, panel, list, filter, options, active: -1 };
  list.addEventListener('pointermove', (event) => {
    const el = (event.target as HTMLElement).closest<HTMLElement>('.bv-hs-dropdown-option');
    if (el) setActive(o, options.filter((x) => !x.hidden).indexOf(el));
  });
  list.addEventListener('click', (event) => {
    const el = (event.target as HTMLElement).closest<HTMLElement>('.bv-hs-dropdown-option');
    if (!el) return;
    setActive(o, options.filter((x) => !x.hidden).indexOf(el));
    choose(o);
  });
  if (filter) {
    filter.addEventListener('input', () => {
      // Match from the start of a word: "can" finds Canada, not American Samoa.
      const q = filter!.value.trim().toLowerCase();
      const word = new RegExp('(^|[\\s(\\-])' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      options.forEach((el) => (el.hidden = !!q && !word.test((el.textContent || '').toLowerCase())));
      if (divider) divider.hidden = !!q;
      setActive(o, 0);
    });
  }
  // The active-option ring is for keyboard use only.
  panel.addEventListener('keydown', (event) => {
    panel.classList.add('is-keyboard');
    onKey(event);
  });
  return o;
}

function show(select: HTMLSelectElement, button: HTMLButtonElement, iframe: HTMLIFrameElement, name: string, keyboard = false) {
  close(false);
  const o = build(select, button, iframe, name);
  o.panel.classList.toggle('is-keyboard', keyboard);
  document.body.appendChild(o.panel);
  open = o;
  button.setAttribute('aria-expanded', 'true');
  button.setAttribute('aria-controls', o.list.id);
  place(o);
  const selected = o.options.findIndex((el) => el.getAttribute('aria-selected') === 'true');
  setActive(o, selected >= 0 ? selected : 0);
  (o.filter || o.list).focus({ preventScroll: true });
}

function bindPage() {
  if (bound) return;
  bound = true;
  let frame = 0;
  const follow = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => open && place(open));
  };
  window.addEventListener('scroll', follow, { passive: true, capture: true });
  window.addEventListener('resize', follow, { passive: true });
  document.addEventListener('pointerdown', (event) => {
    if (open && !open.panel.contains(event.target as Node)) close(false);
  }, true);
}

export function enhanceSelect(select: HTMLSelectElement, iframe: HTMLIFrameElement, name: string, pinned: string[] = []) {
  if (select.dataset.bvCustom) return;
  pinnedFor.set(select, pinned);
  const doc = select.ownerDocument;
  const view = doc.defaultView;
  if (!view || !view.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  select.dataset.bvCustom = '1';
  bindPage();

  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'bv-select';
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  const text = doc.createElement('span');
  text.className = 'bv-select-text';
  button.appendChild(text);
  select.after(button);
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');
  sync(select, button, name);

  // HubSpot (and the phone field's own country logic) can change the value.
  select.addEventListener('change', () => sync(select, button, name));
  new view.MutationObserver(() => sync(select, button, name)).observe(select, { attributes: true, childList: true, subtree: true });

  const toggle = () => (open && open.button === button ? close() : show(select, button, iframe, name));
  button.addEventListener('click', toggle);
  button.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      if (!open) show(select, button, iframe, name, true);
    }
  });
  // A click elsewhere in the form closes the list.
  doc.addEventListener('pointerdown', (event) => {
    if (open && open.button === button && !button.contains(event.target as Node)) close(false);
  }, true);
}
