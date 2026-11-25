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
// Filtered tabs, newest first. [name, query, tab colour]
const TABS = [
  ['Accepted', "select * where D = 'accepted' order by A desc", '#1E7B45'],
  ['Not accepted', "select * where D <> 'accepted' and D <> '' order by A desc", '#B7791F'],
  ['Accepted, missing in HubSpot', "select * where D = 'accepted' and E = 'no' order by A desc", '#B3261E'],
];
// Look: Brand Vision navy header, cream bands, status colours.
const LOOK = {
  navy: '#14202E', cream: '#FBF8EA', white: '#FFFFFF', line: '#E4DFC8', font: 'Inter',
  status: {
    accepted: ['#DDF3E4', '#1E7B45'], rejected: ['#FBE1DE', '#B3261E'], attempt: ['#FFF1CC', '#8A5A00'],
  },
  inHubSpot: { yes: ['#DDF3E4', '#1E7B45'], no: ['#FBE1DE', '#B3261E'] },
};
// Column widths (px) for the fixed columns; answer columns get 200.
const WIDTHS = [150, 150, 110, 100, 105, 200, 130, 110, 130, 260, 220, 150, 80, 160, 120];
const NOTES = {
  [C.status]: 'attempt = Submit pressed, no answer from HubSpot yet (or never)\nrejected = HubSpot returned an error\naccepted = HubSpot said success',
  [C.inHubSpot]: 'Fills in every 6 hours once a HubSpot token is saved (SETUP.md step 4).\nyes = HubSpot kept it; no = HubSpot said success but has no such submission.',
  [C.tz]: "The visitor's device time zone: a rough location.",
};
// The Contact form's fields (HubSpot form 7a162eb3-…, read 2026-11-25), in
// form order: [HubSpot field name, column title, width]. Their columns exist
// from the start; a field not listed here gets a column named after it the
// first time it's submitted.
const FIELDS = [
  ['firstname', 'First name', 130],
  ['lastname', 'Last name', 130],
  ['email', 'Email', 230],
  ['phone', 'Phone', 140],
  ['what_service_are_you_looking_for_', 'Service', 170],
  ['where_did_you_hear_about_us_', 'Heard about us', 160],
  ['request', 'Project details', 360],
  ['hs_file_upload', 'File upload', 200],
  ['lead_agency', 'Lead agency', 140],
  ['TICKET.subject', 'Ticket name', 200],
  ['TICKET.content', 'Ticket description', 260],
];
const LABEL = {};
FIELDS.forEach(([key, title]) => (LABEL[key] = title));
LABEL.subject = 'Ticket name';
LABEL.content = 'Ticket description';
function columnTitle(key) {
  const k = String(key).slice(0, 80);
  return LABEL[k] || k;
}
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
  TABS.forEach(([name]) => ss.getSheetByName(name) || ss.insertSheet(name));
  const sheet1 = ss.getSheetByName('Sheet1');
  if (sheet1 && ss.getSheets().length > 1) ss.deleteSheet(sheet1);

  ScriptApp.getProjectTriggers()
    .filter((t) => ['cleanup', 'checkHubSpot'].includes(t.getHandlerFunction()))
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('cleanup').timeBased().everyDays(1).atHour(3).create();
  ScriptApp.newTrigger('checkHubSpot').timeBased().everyHours(6).create();
  style();
}

/**
 * Run from the editor to (re)apply the look and the filtered tabs' formulas.
 * Safe to run again: it never touches the data. Rows added later pick up the
 * look automatically (it covers every row of every tab).
 */
function style() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const all = ss.getSheetByName(ALL);
  const last = columnLetter(WIDTH);
  answerColumns(all);
  dress(all, LOOK.navy);
  Object.keys(NOTES).forEach((i) => all.getRange(1, Number(i) + 1).setNote(NOTES[i]));
  TABS.forEach(([name, query, colour]) => {
    const tab = ss.getSheetByName(name) || ss.insertSheet(name);
    if (tab.getMaxColumns() < WIDTH) tab.insertColumnsAfter(tab.getMaxColumns(), WIDTH - tab.getMaxColumns());
    tab.getRange('A1').setFormula(`=QUERY(${ALL}!A:${last}, "${query}", 1)`);
    dress(tab, colour);
  });
  ss.setActiveSheet(all);
}

// Titles the form's columns: renames a raw field-name header to its title
// (e.g. "firstname" -> "First name"), then adds any missing ones in form order.
function answerColumns(sheet) {
  const width = sheet.getMaxColumns();
  const headers = sheet.getRange(1, 1, 1, width).getValues()[0].map(String);
  headers.forEach((h, i) => {
    if (i >= FIXED.length && LABEL[h] && headers.indexOf(LABEL[h]) < 0) {
      headers[i] = LABEL[h];
      sheet.getRange(1, i + 1).setValue(LABEL[h]);
    }
  });
  FIELDS.forEach(([, title]) => {
    if (headers.indexOf(title) >= 0) return;
    const free = headers.indexOf('', FIXED.length);
    if (free < 0) return;
    headers[free] = title;
    sheet.getRange(1, free + 1).setValue(title);
  });
}

function dress(sheet, tabColour) {
  const rows = sheet.getMaxRows();
  const whole = sheet.getRange(1, 1, rows, WIDTH);
  sheet.setTabColor(tabColour);

  // Body: one quiet line per row, long text clipped (click a cell to read it).
  whole.setFontFamily(LOOK.font).setFontSize(10).setVerticalAlignment('middle')
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  sheet.setRowHeightsForced(2, rows - 1, 28);
  sheet.getBandings().forEach((b) => b.remove());
  whole.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
    .setHeaderRowColor(LOOK.navy).setFirstRowColor(LOOK.white).setSecondRowColor(LOOK.cream);

  // Header.
  const head = sheet.getRange(1, 1, 1, WIDTH);
  head.setFontColor(LOOK.white).setFontWeight('bold').setFontSize(10);
  sheet.setRowHeightsForced(1, 1, 36);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);

  // Widths: the fixed columns, then the answers.
  WIDTHS.forEach((w, i) => sheet.setColumnWidth(i + 1, w));
  sheet.setColumnWidths(FIXED.length + 1, WIDTH - FIXED.length, 200);
  const titles = sheet.getRange(1, 1, 1, WIDTH).getDisplayValues()[0];
  FIELDS.forEach(([, title, w]) => {
    const i = titles.indexOf(title);
    if (i >= 0) sheet.setColumnWidth(i + 1, w);
  });
  sheet.getRange(2, C.status + 1, rows - 1, 2).setHorizontalAlignment('center').setFontWeight('bold');

  // Technical columns tucked into groups: click + above the columns to open.
  // Attempt ID; Form ID + Host; Language + Browser + HubSpot cookie.
  try {
    [[C.attempt, 1], [C.form, 2], [C.lang, 3]].forEach(([c, n]) => {
      if (sheet.getColumnGroupDepth(c + 1) === 0) sheet.getRange(1, c + 1, 1, n).shiftColumnGroupDepth(1);
      sheet.getColumnGroup(c + 1, 1).collapse();
    });
  } catch (err) {
    // Grouping is cosmetic; skip it if Sheets refuses.
  }

  // Status and In HubSpot colours, on every row now and later.
  const statusCol = sheet.getRange(2, C.status + 1, rows - 1, 1);
  const hubCol = sheet.getRange(2, C.inHubSpot + 1, rows - 1, 1);
  const rules = [];
  Object.keys(LOOK.status).forEach((v) => {
    const [bg, fg] = LOOK.status[v];
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(v)
      .setBackground(bg).setFontColor(fg).setRanges([statusCol]).build());
  });
  Object.keys(LOOK.inHubSpot).forEach((v) => {
    const [bg, fg] = LOOK.inHubSpot[v];
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(v)
      .setBackground(bg).setFontColor(fg).setRanges([hubCol]).build());
  });
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith('unknown')
    .setFontColor('#6B6B6B').setRanges([hubCol]).build());
  sheet.setConditionalFormatRules(rules);
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
    const name = columnTitle(key);
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
    const i = headers.indexOf(columnTitle(key));
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
