# HubSpot form backup: Google Sheet setup

Every HubSpot form submission on brandvm.com is also copied to a Google
Sheet, so no enquiry is lost if HubSpot drops it. The site side is
`src/modules/hubspot-form-backup.ts`; the Sheet side is `Code.gs` (this
folder). Decided 2026-11-25: Google Sheet, every attempt, 1-year retention,
no email alerts.

## 1. Create the Sheet (company Google account)

1. Google Drive → New → Google Sheets. Name it "Brand Vision — Form backup".
2. Share it only with the people who handle leads. Don't make it public.

## 2. Add the script

1. In the Sheet: **Extensions → Apps Script**.
2. Delete the sample code, paste all of `Code.gs`, and click **Save**.
   Name the project "Form backup".
3. In the function list at the top choose **setup**, then **Run**.
4. Google asks for permission (edit this spreadsheet, run on a schedule,
   connect to an external service for the HubSpot check). Choose your
   account. If it says "Google hasn't verified this app", that's expected
   for your own script: **Advanced → Go to Form backup**, then **Allow**.
5. The Sheet now has four tabs: **All**, **Accepted**, **Not accepted**,
   **Accepted, missing in HubSpot**.

## 3. Publish it as a web app

1. **Deploy → New deployment**. Gear icon → **Web app**.
2. Description "v1". **Execute as: Me**. **Who has access: Anyone**.
   (Anyone can send it a record, as anyone can submit the form; nobody can
   read the Sheet through it.)
3. **Deploy**, then copy the **Web app URL** (ends in `/exec`).
4. Open that URL in a browser: it should say "Brand Vision form backup is
   running."
5. Send the URL to whoever releases the site code. It goes into
   `BACKUP_URL` in `src/modules/hubspot-form-backup.ts`, then the usual
   release (tag, bump `RELEASE` in Webflow head code, publish).

Changing the script later: edit, Save, then **Deploy → Manage deployments
→ pencil → Version: New version → Deploy**. The URL stays the same.

## 4. Optional: mark what HubSpot kept

With a HubSpot private app token (scope **forms**), the script checks every
6 hours whether each accepted submission is in HubSpot and fills the
**In HubSpot** column with `yes` or `no`.

1. Apps Script → **Project Settings** (gear) → **Script properties** →
   **Add script property**: `HUBSPOT_TOKEN` = the token (`pat-na1-…`).
2. Save. To run it once now: choose **checkHubSpot** → **Run**.

If the column says `unknown (API sent no IDs)`, HubSpot's API didn't return
conversion IDs for this account. Tell the developer.

## Reading the tabs

| Tab | Shows |
|---|---|
| All | Every attempt, one row each, newest at the bottom |
| Accepted | HubSpot answered "success" (has a conversion ID) |
| Not accepted | `rejected` (HubSpot returned an error, e.g. reCAPTCHA) or `attempt` (no answer: visitor left, request failed, or a bot) |
| Accepted, missing in HubSpot | HubSpot said "success" but has no such submission. Review these: real ones can be added to HubSpot by hand |

Columns: times (Toronto), attempt ID, status, In HubSpot, error, conversion
ID, form ID, host, page, referrer, the visitor's time zone (a rough
location), language, browser, HubSpot cookie, then one column per form
field, added as fields first appear. Uploaded files aren't copied.

## Privacy

- The Sheet holds names, emails and messages: keep sharing to lead handlers.
- Rows older than 365 days are deleted every night at about 3 a.m.
- The privacy policy should say contact form submissions are also kept in a
  backup store (Google) so no enquiry is lost.
- None of this goes to GA4 or GTM.

## Check after release

Submit the Contact form once with test details. Within a minute **All**
shows one row: `attempt` first, then `accepted` with a conversion ID.
Delete the test contact in HubSpot and the row in the Sheet.
