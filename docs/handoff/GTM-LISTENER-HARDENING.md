# GTM change: count only real HubSpot successes

Container `GTM-T8GBTH3J`, tag **cHTML — HubSpot Form Listener**. Follows
[GTM-CONVERSION-ID.md](GTM-CONVERSION-ID.md) (live 2026-11-24).

## Why

Tested on the live site on 2026-11-26, with every GA4, Ads and Sheet request
blocked. The current listener turns any "form submitted" message into a GA4
lead and a Google Ads form conversion, including:

| Test | Current listener | This version |
|---|---|---|
| Real success from the page itself | lead | lead |
| Same success twice (same conversion ID) | 1 lead (HubSpot sends it once) | lead, then ignored as `duplicate` |
| Fake success from an embedded iframe of another site | **lead** (origin `null`) | ignored: `other_origin` |
| Another site frames brandvm.com and posts a fake success | 0 in the live test | ignored: `other_origin` |
| Success with no conversion ID | **lead** | ignored: `no_conversion_id` |
| Success from another HubSpot form | **lead** | ignored: `other_form` |
| Staging (brandvm.webflow.io) | none (hostname filter) | none |

A bot rejected by reCAPTCHA never gets a success message, so it counts 0
either way.

Ignored messages are pushed as `hs_form_submit_ignored` with
`hs_ignored_reason`. No tag fires on them; they show in GTM Preview. A GA4
event can be added later if they turn out to be frequent.

## Change

Tags → **cHTML — HubSpot Form Listener** → replace the HTML with the code
below. Same trigger (Initialization - All Pages), same data-layer fields,
nothing else changes in GTM or GA4.

To count another HubSpot form as a lead later, add its form ID to `FORMS`.

```html
<script>
(function () {
  // HubSpot forms that count as leads. Add another form's ID here if it should.
  var FORMS = ['7a162eb3-35f1-476d-8877-2d1bd30b0f28'];
  var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  var seen = {};
  window.dataLayer = window.dataLayer || [];

  function push(formId, conversionId, callback, origin) {
    var reason = '';
    if (FORMS.indexOf(formId) < 0) reason = 'other_form';
    else if (!UUID.test(conversionId || '')) reason = 'no_conversion_id';
    else if (seen[conversionId]) reason = 'duplicate';
    if (reason) {
      // Visible in GTM Preview; no tag fires on it.
      window.dataLayer.push({ event: 'hs_form_submit_ignored', hs_ignored_reason: reason, hs_form_id: formId || undefined, hs_callback: callback, hs_msg_origin: origin || undefined });
      return;
    }
    seen[conversionId] = true;
    window.dataLayer.push({
      event: 'hs_form_submit',
      hs_form_id: formId,
      hs_conversion_id: conversionId,
      hs_callback: callback,
      hs_msg_origin: origin
    });
  }

  /* HubSpot v2 embed (the current one): it posts from this page to itself. */
  window.addEventListener('message', function (e) {
    var d = e && e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type !== 'hsFormCallback' || d.eventName !== 'onFormSubmitted') return;
    if (e.source !== window || e.origin !== location.origin) {
      window.dataLayer.push({ event: 'hs_form_submit_ignored', hs_ignored_reason: 'other_origin', hs_msg_origin: e.origin || undefined });
      return;
    }
    // Only the IDs. Never d.data.submissionValues (the visitor's answers).
    push(String(d.id || ''), d.data && d.data.conversionId, 'v2_message', e.origin);
  });

  /* HubSpot v4 embed: fires only if/when the form is upgraded. */
  window.addEventListener('hs-form-event:on-submission:success', function (e) {
    var f = window.HubspotFormsV4 && window.HubspotFormsV4.getFormFromEvent(e);
    if (!f) return;
    push(String(f.getFormId() || ''), f.getConversionId(), 'v4_event', location.origin);
  });
})();
</script>
```

## Test in Preview before publishing

1. GTM → **Preview** → `https://www.brandvm.com/contact` → Connect.
2. Submit the Contact form once with test details ("GTM test").
3. Tag Assistant, event **hs_form_submit**: `hs_form_id` = `7a162eb3-…`,
   `hs_conversion_id` = an ID, `hs_callback` = `v2_message`,
   `hs_msg_origin` = `https://www.brandvm.com`. Tags fired: GA4 — Generate
   Lead, Ads Conv — HubSpot Form Submit.
4. Optional fake test, in the browser console of that same tab:
   `postMessage({type:'hsFormCallback',eventName:'onFormSubmitted',id:'7a162eb3-35f1-476d-8877-2d1bd30b0f28',data:{}}, '*')`
   → Tag Assistant shows **hs_form_submit_ignored** (`no_conversion_id`), and
   no GA4 or Ads tag fires.
5. Delete the test contact in HubSpot and the test row in the backup Sheet.
6. **Publish**, version name "HubSpot listener: count only real Contact
   form successes". Rollback: republish the previous version.
