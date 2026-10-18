// Data embedded in the page at build time (scripts/seo-build.mjs): the public
// site settings and the hero's figures, in a <script type="application/json">
// block. A data block is never executed, so the CSP's "no inline script" rule
// is untouched.
//
// Why: the hero is centred vertically, and the WhatsApp line, the tagline and
// the stats row used to arrive from the API a moment after first paint. Each
// arrival made the hero taller and pushed everything already on screen up —
// the page's whole layout-shift score. Starting from the embedded copy, the
// first paint already has its final shape; the live API still refreshes it.
//
// Absent (dev server, or a build that could not reach the API) it is {}, and
// everything falls back to fetching as before.
export const BOOT = (() => {
  try {
    const el = typeof document !== 'undefined' && document.getElementById('cl-boot');
    return (el && JSON.parse(el.textContent)) || {};
  } catch {
    return {};
  }
})();
