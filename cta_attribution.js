/* cta_attribution.js — carry the email→LP tracking params onto every /go/ CTA link.
 *
 * The email CTA lands on this LP with ?c=<campaign>&r=<recipient>&v=<variant>. The LP's own
 * CTA buttons point at the tracker (t.skillscreen.net/go/<slug>) but are static — without this
 * they carry NO c/r, so the tracker logs the click with campaign_id=NULL / recipient_id=NULL:
 * the click is real but unattributable, and the campaign funnel shows 0 clicks even when people
 * click through. (Root cause of kids-diaspora-01 "0 campaign-scoped clicks", found 2026-07-14.)
 *
 * This reads c/r/v from the LP's own URL and appends them to each /go/ link, plus p=<data-cta>
 * (hero/main/sticky) for CTA-level attribution. Defensive: no-op when no c/r present, never throws
 * — analytics wiring must never break the page or the click itself.
 */
(function () {
  try {
    var q = new URLSearchParams(window.location.search);
    var c = q.get('c'), r = q.get('r'), v = q.get('v');
    if (!c && !r) return;                         // organic visit (no email context) — leave links as-is
    document.querySelectorAll('a[href*="t.skillscreen.net/go/"]').forEach(function (a) {
      var u;
      try { u = new URL(a.href); } catch (e) { return; }
      if (c) u.searchParams.set('c', c);
      if (r) u.searchParams.set('r', r);
      if (v) u.searchParams.set('v', v);
      var cta = a.getAttribute('data-cta');
      if (cta) u.searchParams.set('p', cta);      // /go reads p → cta_id (hero/main/sticky)
      a.href = u.toString();
    });
  } catch (e) { /* never break the page for attribution */ }
})();
