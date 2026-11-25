# GTM change: send HubSpot's conversion ID to GA4

Container `GTM-T8GBTH3J`. Before: version 18 (2026-10-20).

**Status: done 2026-11-24.** GTM published with the changes below; the four
GA4 custom dimensions created the same day. Preview test passed: conversion
ID `f40b9197-…`, callback `v2_message`, origin `https://www.brandvm.com`;
Generate Lead, Paid Form Lead and Ads Conv fired. IDs exist in GA4 from
2026-11-24 only. First comparison with HubSpot due about 2026-12-08.

GA4 property `G-84EQ2FVD9B`. HubSpot portal 22077182, Contact Form
`7a162eb3-35f1-476d-8877-2d1bd30b0f28`.

## Why

Oct 27 – Nov 23, 2026: GA4 recorded 88 `generate_lead` events and HubSpot
saved 37 Contact Form submissions. All 37 match a GA4 event to the minute;
54 GA4 events have no HubSpot submission, and they stopped after
Nov 19 10:00 EST. Neither GTM (last change Oct 20) nor the site repo
(no release between Oct 27 and Nov 19 13:06 EST) changed at that point.
HubSpot's filtered (spam) list shows 0 for this form.

GA4 can't say which events were real, because it receives no ID that
HubSpot also keeps. The listener already puts HubSpot's conversion ID in the
data layer (Google Ads uses it as the order ID), but the GA4 tags don't send
it. This change sends it, plus where the success signal came from, so every
future `generate_lead` can be matched to a HubSpot submission or shown to
have none.

No names, email addresses or form answers are sent. HubSpot's message
carries the submitted values (`data.submissionValues`); the listener must
never forward them.

## Current state (version 18)

- "cHTML — HubSpot Form Listener" (Custom HTML), fires on
  Initialization - All Pages. Pushes
  `{event: 'hs_form_submit', hs_form_id, hs_conversion_id}` on:
  - a `message` event with `type: 'hsFormCallback'`,
    `eventName: 'onFormSubmitted'` (HubSpot v2 embed: the one on the site),
  - `hs-form-event:on-submission:success` (HubSpot v4 embed, not used yet).
- Data Layer Variables (version 2) for `hs_form_id` and `hs_conversion_id`
  already exist. `hs_conversion_id` is the Order ID on
  "Ads Conv — HubSpot Form Submit".
- Trigger "CE - HubSpot Form Submit": Custom Event `hs_form_submit`,
  Page Hostname matches `^(www\.)?brandvm\.com$`. Fires
  "Ads Conv — HubSpot Form Submit", "GA4 — Generate Lead",
  "GA4 — Paid Form Lead (GCLID)" (paused, in "99 · Paused / to remove"). The live paid tag is "GA4 - Paid Form Lead", on "CE - HubSpot Form Submit (Paid)" (only when `_gcl_aw` is set).
- "GA4 — Generate Lead" and "GA4 - Paid Form Lead" send no form
  parameters.

## Changes

### 1. Listener tag: "cHTML — HubSpot Form Listener"

Replace its HTML with the following. Same triggers, same behaviour, plus
two fields: which HubSpot signal fired (`hs_callback`) and the origin of
the message (`hs_msg_origin`). A real v2 success comes from the page itself
(`https://www.brandvm.com`); anything else means another frame or script
sent it.

```html
<script>
(function () {
  function push(formId, conversionId, callback, origin) {
    window.dataLayer.push({
      event: 'hs_form_submit',
      hs_form_id: formId || undefined,
      hs_conversion_id: conversionId || undefined,
      hs_callback: callback,
      hs_msg_origin: origin || undefined
    });
  }
  window.dataLayer = window.dataLayer || [];
  window.addEventListener('message', function (e) {
    var d = e && e.data;
    if (d && typeof d === 'object' && d.type === 'hsFormCallback' && d.eventName === 'onFormSubmitted') {
      // Only the IDs. Never d.data.submissionValues (the visitor's answers).
      push(d.id, d.data && d.data.conversionId, 'v2_message', e.origin);
    }
  });
  window.addEventListener('hs-form-event:on-submission:success', function (e) {
    var f = window.HubspotFormsV4 && window.HubspotFormsV4.getFormFromEvent(e);
    if (f) push(f.getFormId(), f.getConversionId(), 'v4_event', location.origin);
  });
})();
</script>
```

### 2. Two new Data Layer Variables

| Name | Data Layer Variable Name | Version | Default value |
|---|---|---|---|
| `DLV — hs_callback` | `hs_callback` | 2 | none |
| `DLV — hs_msg_origin` | `hs_msg_origin` | 2 | none |

Leave the default unset. An empty value in GA4 is itself the signal.

### 3. GA4 event tags: add event parameters

On both **GA4 — Generate Lead** and **GA4 - Paid Form Lead** (trigger "CE - HubSpot Form Submit (Paid)") →
Event Parameters:

| Parameter name | Value |
|---|---|
| `hs_form_id` | `{{DLV — hs_form_id}}` (the existing variable) |
| `hs_conversion_id` | `{{DLV — hs_conversion_id}}` (the existing variable) |
| `hs_callback` | `{{DLV — hs_callback}}` |
| `hs_msg_origin` | `{{DLV — hs_msg_origin}}` |

Paid Form Lead keeps its existing `ads_click_cookie_present = true`.

Don't add a condition that blocks events without a conversion ID. Those
events are what we're trying to find.

### 4. GA4 Admin → Custom definitions

Create four **event-scoped** custom dimensions, each with the same name as
its parameter: `hs_form_id`, `hs_conversion_id`, `hs_callback`,
`hs_msg_origin`. Data only appears from the day they're created, not
retroactively.

`hs_conversion_id` is unique per event, so standard reports will group most
of it into "(other)". Read it in Explore (free-form, event =
`generate_lead`), or in BigQuery if the export is on.

### 5. Publish

Version name: "Send HubSpot conversion ID and callback source to GA4".
Rollback: republish version 18.

## Test before publishing

1. GTM Preview on `https://www.brandvm.com/contact`.
2. Submit the Contact Form once with obvious test details (e.g. first name
   "GTM test", a company test address). Afterwards, delete that contact in
   HubSpot and note the time, so it isn't counted as a lead.
3. Tag Assistant, `hs_form_submit` event: `hs_form_id` =
   `7a162eb3-…`, `hs_conversion_id` = a UUID, `hs_callback` =
   `v2_message`, `hs_msg_origin` = `https://www.brandvm.com`.
   "GA4 — Generate Lead" fired once.
4. GA4 Admin → DebugView: `generate_lead` carries the four parameters.
5. In the payload, nothing contains the test name, email or answers.
6. Ads Conv — HubSpot Form Submit still fired, with the Order ID set.

## Reading it after 1–2 weeks

Export `generate_lead` with `hs_conversion_id`, `hs_callback`,
`hs_msg_origin`, date/time and page from GA4 Explore. Export the Contact
Form's submissions from HubSpot with their conversion IDs (the Forms
submissions API, `form-integrations/v1/submissions/forms/{formId}`, returns
them. Check that the export you use includes the ID). Then:

| GA4 event | Means |
|---|---|
| ID matches a HubSpot submission | Real lead, tracked correctly |
| ID present, not in HubSpot | HubSpot answered "success" and then dropped it (bot or blocked submission). Compare with the form's Spam tab "blocked" count |
| ID empty | The success signal didn't come from a HubSpot response (simulated or injected). Check `hs_msg_origin` |
| `hs_msg_origin` isn't `https://www.brandvm.com` | Another frame or script sent the message |
| Same ID twice | Double firing (not seen so far) |

If injected messages turn out to be the cause, the follow-up fix is in the
listener: accept the v2 message only when `e.origin === location.origin`
and `e.source === window`, and only for this form ID.
