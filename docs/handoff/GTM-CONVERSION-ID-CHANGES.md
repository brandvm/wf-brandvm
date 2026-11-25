# GTM changes: HubSpot conversion ID to GA4

Container `GTM-T8GBTH3J` (live: version 18). GA4 `G-84EQ2FVD9B`.

## 1. Listener tag: "cHTML — HubSpot Form Listener"

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

## 2. Two new Data Layer Variables

| Name | Data Layer Variable Name | Version | Default value |
|---|---|---|---|
| `DLV — hs_callback` | `hs_callback` | 2 | none |
| `DLV — hs_msg_origin` | `hs_msg_origin` | 2 | none |

Leave the default unset. An empty value in GA4 is itself the signal.

## 3. GA4 event tags: add event parameters

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

## 4. GA4 Admin → Custom definitions

Create four **event-scoped** custom dimensions, each with the same name as
its parameter: `hs_form_id`, `hs_conversion_id`, `hs_callback`,
`hs_msg_origin`. Data only appears from the day they're created, not
retroactively.

`hs_conversion_id` is unique per event, so standard reports will group most
of it into "(other)". Read it in Explore (free-form, event =
`generate_lead`), or in BigQuery if the export is on.

## 5. Publish

Version name: "Send HubSpot conversion ID and callback source to GA4".
Rollback: republish version 18.

## Test before publishing

1. GTM Preview on `https://www.brandvm.com/contact`.
2. Submit the Contact Form once with obvious test details (e.g. first name
   "GTM test", a company test address). Afterwards, delete that contact in
   HubSpot and note the time, so it isn't counted as a lead.
3. Tag Assistant, `hs_form_submit` event: `hs_form_id` = `7a162eb3-…`,
   `hs_conversion_id` = a UUID, `hs_callback` = `v2_message`,
   `hs_msg_origin` = `https://www.brandvm.com`. "GA4 — Generate Lead"
   fired once.
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
