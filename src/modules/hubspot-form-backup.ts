// Backup copy of every HubSpot form submission (2026-11-25).
//
// GA4 counted more Contact form leads than HubSpot kept (88 vs 37,
// Oct 27–Nov 23), so each submission attempt is also sent to a Google
// Sheet the team owns (docs/handoff/hubspot-backup/). HubSpot's v2 embed
// posts its form events to this window:
//   onBeforeFormSubmit  answers, after the form's own validation → "attempt"
//   onFormError         HubSpot answered with an error → "rejected"
//   onFormSubmitted     HubSpot answered success, with a conversion ID → "accepted"
// One record per attempt (the same attempt ID on all three), so the Sheet
// can tell submissions HubSpot accepted, rejected, or never answered.
//
// The answers go only to that Sheet, never to the data layer, GA4 or GTM.
// BACKUP_URL is the Sheet's web app (deployed 2026-11-25).

// The Apps Script web app URL (…/exec) from docs/handoff/hubspot-backup/SETUP.md.
const BACKUP_URL = 'https://script.google.com/macros/s/AKfycbwOlGOcOry2c6xbPuu0caytH8jEQib2PmrHqUqy4QXb9VaD-hOVbHZ1abBEEkS3GQwvtg/exec';

type Answers = Record<string, string>;
type HsMessage = { type?: string; eventName?: string; id?: string; data?: unknown };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const attempts: Record<string, string> = {};
let listening = false;

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function text(value: unknown): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join('; ');
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return String(value);
}

// onBeforeFormSubmit sends [{name, value}]; onFormSubmitted sends {name: value}.
function answersFrom(data: unknown): Answers {
  const out: Answers = {};
  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (item && typeof item === 'object' && 'name' in item) out[String(item.name)] = text((item as { value?: unknown }).value);
    });
  } else if (data && typeof data === 'object') {
    Object.entries(data as Record<string, unknown>).forEach(([k, v]) => (out[k] = text(v)));
  }
  return out;
}

function errorFrom(data: unknown): string {
  const d = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const inner = (d.data && typeof d.data === 'object' ? d.data : {}) as Record<string, unknown>;
  const code = text(inner.formSubmissionError) || text(d.formSubmissionError) || 'SUBMISSION_FAILURE';
  const status = text(d.status);
  return status ? `${code} (HTTP ${status})` : code;
}

function hutk(): string {
  const m = document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : '';
}

function send(url: string, record: Record<string, unknown>) {
  const body = JSON.stringify({
    v: 1,
    host: location.hostname,
    page: location.href.split('#')[0],
    referrer: document.referrer,
    tz: (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      } catch {
        return '';
      }
    })(),
    lang: navigator.language || '',
    ua: navigator.userAgent,
    hutk: hutk(),
    ...record,
  });
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], { type: 'text/plain;charset=UTF-8' }))) return;
  } catch {
    /* fall through to fetch */
  }
  fetch(url, { method: 'POST', body, mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' } }).catch(() => {});
}

function onMessage(url: string, event: MessageEvent) {
  // HubSpot's embed posts from this page to itself. Anything else (another
  // frame, another origin) is not a HubSpot form on this page.
  if (event.source !== window || event.origin !== location.origin) return;
  const m = event.data as HsMessage;
  if (!m || typeof m !== 'object' || m.type !== 'hsFormCallback') return;
  const formId = String(m.id || '');
  if (!UUID.test(formId)) return;

  if (m.eventName === 'onBeforeFormSubmit') {
    const attemptId = uuid();
    attempts[formId] = attemptId;
    send(url, { status: 'attempt', attemptId, formId, answers: answersFrom(m.data) });
  } else if (m.eventName === 'onFormError') {
    // Validation errors (an array of fields, with their values) come before
    // any attempt; only errors on a sent submission are recorded.
    const attemptId = attempts[formId];
    if (!attemptId || Array.isArray(m.data)) return;
    send(url, { status: 'rejected', attemptId, formId, error: errorFrom(m.data) });
  } else if (m.eventName === 'onFormSubmitted') {
    const data = (m.data && typeof m.data === 'object' ? m.data : {}) as { conversionId?: unknown; submissionValues?: unknown };
    const attemptId = attempts[formId] || uuid();
    delete attempts[formId];
    const conversionId = text(data.conversionId);
    send(url, {
      status: 'accepted',
      attemptId,
      formId,
      conversionId: UUID.test(conversionId) ? conversionId : '',
      answers: answersFrom(data.submissionValues),
    });
  }
}

// Tests point it elsewhere with window.__bvHsBackupUrl; on brandvm.com only
// BACKUP_URL counts, so no other script on the page can redirect the answers.
function backupUrl(): string {
  const live = /(^|\.)brandvm\.com$/.test(location.hostname);
  return (!live && window.__bvHsBackupUrl) || BACKUP_URL;
}

export function initHubSpotFormBackup(url: string = backupUrl()) {
  if (!url || listening) return;
  listening = true;
  window.addEventListener('message', (event) => onMessage(url, event));
}
