/**
 * Brand Vision: backup copy of every HubSpot form submission on brandvm.com.
 *
 * The site (src/modules/hubspot-form-backup.ts) posts one record per
 * submission attempt here. This script keeps them in the "All" tab and the
 * filtered tabs show subsets of it. Setup steps: SETUP.md in this folder.
 *
 * Statuses:
 *   attempt   the visitor pressed Submit and the form passed its own checks
 *   rejected  HubSpot answered with an error (e.g. reCAPTCHA, submission failure)
 *   accepted  HubSpot answered "success" and returned a conversion ID
 * An attempt that stays "attempt" never got an answer: the visitor left, the
 * request failed, or a bot never finished.
 *
 * "In HubSpot" is filled in by checkHubSpot() once a HubSpot private app
 * token is saved (Project Settings > Script properties > HUBSPOT_TOKEN):
 *   yes = HubSpot kept it; no = HubSpot said "success" but has no such submission.
 */

const ALL = 'All';
const TZ = 'America/Toronto';
const WIDTH = 60; // columns kept on the All tab (15 fixed + answers)
const RETENTION_DAYS = 365;
const FIXED = [
  'First seen (Toronto)', 'Last update (Toronto)', 'Attempt ID', 'Status', 'In HubSpot',
  'Error', 'Conversion ID', 'Form ID', 'Host', 'Page', 'Referrer',
  'Visitor time zone', 'Language', 'Browser', 'HubSpot cookie',
];
const C = { first: 0, last: 1, attempt: 2, status: 3, inHubSpot: 4, error: 5, conversion: 6,
  form: 7, host: 8, page: 9, referrer: 10, tz: 11, lang: 12, ua: 13, hutk: 14 };
const RANK = { attempt: 0, rejected: 1, accepted: 2 };
const TABS = [
  ['Accepted', "select * where D = 'accepted'"],
  ['Not accepted', "select * where D <> 'accepted' and D <> ''"],
  ['Accepted, missing in HubSpot', "select * where D = 'accepted' and E = 'no'"],
];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Run once from the editor: builds the tabs and the daily jobs. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(TZ);
  const all = ss.getSheetByName(ALL) || ss.insertSheet(ALL, 0);
  if (all.getMaxColumns() < WIDTH) all.insertColumnsAfter(all.getMaxColumns(), WIDTH - all.getMaxColumns());
  all.getRange(1, 1, all.getMaxRows(), WIDTH).setNumberFormat('@');
  all.getRange(1, 1, 1, FIXED.length).setValues([FIXED]).setFontWeight('bold');
  all.setFrozenRows(1);
  const last = columnLetter(WIDTH);
  TABS.forEach(([name, query]) => {
    const tab = ss.getSheetByName(name) || ss.insertSheet(name);
    tab.getRange('A1').setFormula(`=QUERY(${ALL}!A:${last}, "${query}", 1)`);
    tab.setFrozenRows(1);
  });
  const sheet1 = ss.getSheetByName('Sheet1');
  if (sheet1 && ss.getSheets().length > 1) ss.deleteSheet(sheet1);

  ScriptApp.getProjectTriggers()
    .filter((t) => ['cleanup', 'checkHubSpot'].includes(t.getHandlerFunction()))
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('cleanup').timeBased().everyDays(1).atHour(3).create();
  ScriptApp.newTrigger('checkHubSpot').timeBased().everyHours(6).create();
}

/** The site posts here (sendBeacon, text/plain JSON). */
function doPost(e) {
  try {
    const body = (e && e.postData && e.postData.contents) || '';
    if (!body || body.length > 60000) return reply('ignored');
    const p = JSON.parse(body);
    if (!p || p.v !== 1 || !(p.status in RANK) || !UUID.test(p.attemptId || '') || !UUID.test(p.formId || '')) {
      return reply('ignored');
    }
    if (p.conversionId && !UUID.test(p.conversionId)) p.conversionId = '';
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      save(p);
    } finally {
      lock.releaseLock();
    }
    return reply('ok');
  } catch (err) {
    return reply('error');
  }
}

/** Opening the web app URL in a browser shows this, to check it's deployed. */
function doGet() {
  return reply('Brand Vision form backup is running.');
}

function save(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ALL);
  const width = sheet.getMaxColumns();
  const headers = sheet.getRange(1, 1, 1, width).getValues()[0].map(String);

  // One column per form field, added the first time it appears.
  const answers = p.answers && typeof p.answers === 'object' ? p.answers : {};
  Object.keys(answers).slice(0, 40).forEach((key) => {
    const name = String(key).slice(0, 80);
    if (headers.indexOf(name) >= 0) return;
    const free = headers.indexOf('', FIXED.length);
    if (free < 0) return; // full: the value is still in no column, rare
    headers[free] = name;
    sheet.getRange(1, free + 1).setValue(safe(name)).setFontWeight('bold');
  });

  let rowIndex = 0;
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const hit = sheet.getRange(2, C.attempt + 1, lastRow - 1, 1)
      .createTextFinder(p.attemptId).matchEntireCell(true).findNext();
    if (hit) rowIndex = hit.getRow();
  }
  const row = rowIndex ? sheet.getRange(rowIndex, 1, 1, width).getValues()[0].map(String) : new Array(width).fill('');
  const now = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss');

  if (!row[C.first]) row[C.first] = now;
  row[C.last] = now;
  row[C.attempt] = p.attemptId;
  if (!row[C.status] || RANK[p.status] >= RANK[row[C.status]]) row[C.status] = p.status;
  if (p.error) row[C.error] = p.error;
  if (p.conversionId) row[C.conversion] = p.conversionId;
  row[C.form] = p.formId;
  if (p.host) row[C.host] = p.host;
  if (p.page) row[C.page] = p.page;
  if (p.referrer) row[C.referrer] = p.referrer;
  if (p.tz) row[C.tz] = p.tz;
  if (p.lang) row[C.lang] = p.lang;
  if (p.ua) row[C.ua] = p.ua;
  if (p.hutk) row[C.hutk] = p.hutk;
  Object.keys(answers).forEach((key) => {
    const i = headers.indexOf(String(key).slice(0, 80));
    const value = answers[key];
    if (i >= FIXED.length && value !== '' && value != null) row[i] = value;
  });

  const values = [row.map(safe)];
  if (rowIndex) sheet.getRange(rowIndex, 1, 1, width).setValues(values);
  else sheet.getRange(lastRow + 1, 1, 1, width).setValues(values);
}

/** Daily: delete rows first seen more than a year ago. */
function cleanup() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ALL);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const cutoff = Utilities.formatDate(new Date(Date.now() - RETENTION_DAYS * 864e5), TZ, 'yyyy-MM-dd HH:mm:ss');
  const first = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = first.length - 1; i >= 0; i--) {
    if (first[i][0] && String(first[i][0]) < cutoff) sheet.deleteRow(i + 2);
  }
}

/**
 * Every 6 hours, once HUBSPOT_TOKEN is set: marks accepted rows from the last
 * 60 days "yes" or "no" in "In HubSpot". "no" only after an hour, so HubSpot
 * has time to save the submission.
 */
function checkHubSpot() {
  const token = PropertiesService.getScriptProperties().getProperty('HUBSPOT_TOKEN');
  if (!token) return;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ALL);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const rows = sheet.getRange(2, 1, lastRow - 1, FIXED.length).getValues().map((r) => r.map(String));
  const since = Date.now() - 60 * 864e5;
  const hourAgo = Utilities.formatDate(new Date(Date.now() - 36e5), TZ, 'yyyy-MM-dd HH:mm:ss');
  const forms = {};
  rows.forEach((r) => {
    if (r[C.status] === 'accepted' && r[C.conversion] && r[C.inHubSpot] !== 'yes') forms[r[C.form]] = true;
  });
  const found = {};
  let anyIds = false;
  Object.keys(forms).forEach((formId) => {
    let after = '';
    for (let page = 0; page < 40; page++) {
      const url = `https://api.hubapi.com/form-integrations/v1/submissions/forms/${formId}?limit=50` +
        (after ? `&after=${encodeURIComponent(after)}` : '');
      const res = UrlFetchApp.fetch(url, { headers: { Authorization: `Bearer ${token}` }, muteHttpExceptions: true });
      if (res.getResponseCode() !== 200) return;
      const data = JSON.parse(res.getContentText());
      const results = data.results || [];
      results.forEach((s) => {
        if (s.conversionId) {
          anyIds = true;
          found[s.conversionId] = true;
        }
      });
      const oldest = results.length ? results[results.length - 1].submittedAt : 0;
      after = data.paging && data.paging.next && data.paging.next.after;
      if (!after || oldest < since) break;
    }
  });
  if (!Object.keys(forms).length) return;
  rows.forEach((r, i) => {
    if (r[C.status] !== 'accepted' || !r[C.conversion] || r[C.inHubSpot] === 'yes') return;
    let mark = '';
    if (!anyIds) mark = 'unknown (API sent no IDs)';
    else if (found[r[C.conversion]]) mark = 'yes';
    else if (r[C.first] < hourAgo) mark = 'no';
    if (mark && mark !== r[C.inHubSpot]) sheet.getRange(i + 2, C.inHubSpot + 1).setValue(mark);
  });
}

// Text that starts like a formula is stored as text, never run.
function safe(value) {
  let s = value == null ? '' : String(value);
  if (s.length > 5000) s = s.slice(0, 5000);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
}

function reply(text) {
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
}

function columnLetter(n) {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
