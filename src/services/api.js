import { getToken, clearSession, touch } from './session';

// In development the API is reached through Vite's proxy (vite.config.js): the
// backend's CORS now allows only codelanco.com, so a direct call from
// localhost would be refused by the browser.
const BASE_URL = import.meta.env.DEV ? '/api' : 'https://back-end.codelanco.com/api';

// A rejected request carries its HTTP status, so callers can tell "too many
// requests" (429) and "invalid field" (422) apart from everything else. A 429
// gets one bilingual message here — the backend's own is "Too Many Attempts." —
// and the seconds from Retry-After when the server sends it.
const RATE_MSG = 'طلبات كثيرة خلال وقت قصير — انتظر دقيقة ثم حاول. / Too many requests — wait a minute and try again.';
const failure = (res, json) => {
  const err = { ...(json ?? {}), status: res.status };
  if (res.status === 429) {
    err.message = RATE_MSG;
    err.retryAfter = Number(res.headers.get('Retry-After')) || 60;
  }
  return err;
};

// A request that hangs forever leaves a spinner forever; after this it fails
// visibly instead.
const TIMEOUT_MS = 20000;

const toLogin = () => {
  clearSession();
  if (!window.location.pathname.startsWith('/admin/login')) window.location.assign('/admin/login');
};

function buildHeaders(auth) {
  const h = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

// fetch with a timeout, and a JSON body that tolerates an HTML error page
// (a proxy or server error returns HTML, and res.json() used to throw an
// unhelpful parse error in its place).
async function send(url, opts) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal, credentials: 'omit' });
    let json = null;
    try { json = await res.json(); } catch { json = { message: `HTTP ${res.status}` }; }
    return { res, json };
  } finally {
    clearTimeout(t);
  }
}

async function req(method, path, body = null, auth = false) {
  // An expired or idle session: go to login rather than send a request the
  // server will refuse.
  if (auth && !getToken()) { toLogin(); throw { message: 'Session expired' }; }

  const opts = { method, headers: buildHeaders(auth) };
  if (body !== null) opts.body = JSON.stringify(body);
  const { res, json } = await send(`${BASE_URL}${path}`, opts);

  // Only authenticated calls may sign the admin out. This used to apply to
  // every request, so a 401 from any public endpoint would have thrown an
  // ordinary visitor onto the admin login page.
  if (res.status === 401 && auth) { toLogin(); throw json; }
  if (!res.ok) throw failure(res, json);
  if (auth) touch();
  return json;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const apiLogin  = (email, password) => req('POST', '/login', { email, password });
export const apiLogout = ()                => req('POST', '/logout', null, true);
export const apiMe     = ()                => req('GET',  '/me', null, true);

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const apiGetDashboardStats   = ()             => req('GET',    '/dashboard/stats', null, true);
export const apiGetRequests         = ()             => req('GET',    '/dashboard/requests', null, true);
export const apiUpdateRequestStatus = (id, status)  => req('PUT',    `/dashboard/requests/${id}`, { status }, true);
export const apiDeleteRequest       = (id)           => req('DELETE', `/dashboard/requests/${id}`, null, true);

// ── Services ──────────────────────────────────────────────────────────────────
// The services list is read by three separate components on the home page — the
// services section, the contact form's project types and the footer column — so
// an un-shared fetch means three identical requests per visit. They share one
// in-flight promise instead. Any mutation below clears it so the admin panel
// still sees its own writes.
let servicesPromise = null;
export const apiGetServices = () => {
  if (!servicesPromise) {
    servicesPromise = req('GET', '/services').catch(err => {
      // A failure must not be cached, or every later caller inherits it.
      servicesPromise = null;
      throw err;
    });
  }
  return servicesPromise;
};
const clearServicesCache = () => { servicesPromise = null; };
// Admin lists: the public routes now return only published / active items, so
// the panel reads its own routes, which include hidden ones.
export const apiGetAllServices = () => req('GET', '/dashboard/services', null, true);
export const apiCreateService = (data)      => { clearServicesCache(); return req('POST',   '/services', data, true); };
export const apiUpdateService = (id, data)  => { clearServicesCache(); return req('PUT',    `/services/${id}`, data, true); };
export const apiDeleteService = (id)        => { clearServicesCache(); return req('DELETE', `/services/${id}`, null, true); };

// ── Projects ──────────────────────────────────────────────────────────────────
// Shared like the services list: the services section (for its "see our work"
// links) and the portfolio both read it on the home page.
let projectsPromise = null;
export const apiGetProjects = () => {
  if (!projectsPromise) {
    projectsPromise = req('GET', '/projects').catch(err => { projectsPromise = null; throw err; });
  }
  return projectsPromise;
};
const clearProjectsCache = () => { projectsPromise = null; };
export const apiGetProject    = (id)        => req('GET',    `/projects/${id}`);
export const apiGetAllProjects = ()         => req('GET',    '/dashboard/projects', null, true);
export const apiCreateProject = (data)      => { clearProjectsCache(); return req('POST',   '/projects', data, true); };
export const apiUpdateProject = (id, data)  => { clearProjectsCache(); return req('PUT',    `/projects/${id}`, data, true); };
export const apiDeleteProject = (id)        => { clearProjectsCache(); return req('DELETE', `/projects/${id}`, null, true); };

// ── Posts (Articles) ──────────────────────────────────────────────────────────
export const apiGetPosts   = ()          => req('GET',    '/posts');
// The single-post route keys on the slug, not the id (/posts/1 returns 404).
export const apiGetPost    = (slug)      => req('GET',    `/posts/${slug}`);
export const apiGetAllPosts = ()         => req('GET',    '/dashboard/posts', null, true);
export const apiCreatePost = (data)      => req('POST',   '/posts', data, true);
export const apiUpdatePost = (id, data)  => req('PUT',    `/posts/${id}`, data, true);
export const apiDeletePost = (id)        => req('DELETE', `/posts/${id}`, null, true);

// ── Contact ───────────────────────────────────────────────────────────────────
export const apiSendContact = (data) => req('POST', '/contact', data);

// ── Achievements ── (pending backend implementation)
export const apiGetAchievements   = ()          => req('GET',    '/achievements');
export const apiCreateAchievement = (data)      => req('POST',   '/achievements', data, true);
export const apiUpdateAchievement = (id, data)  => req('PUT',    `/achievements/${id}`, data, true);
export const apiDeleteAchievement = (id)        => req('DELETE', `/achievements/${id}`, null, true);

// ── Testimonials ──────────────────────────────────────────────────────────────
export const apiGetTestimonials    = ()          => req('GET',    '/testimonials');           // public — active only
export const apiGetAllTestimonials = ()          => req('GET',    '/dashboard/testimonials', null, true); // admin — all
export const apiCreateTestimonial  = (data)      => req('POST',   '/testimonials', data, true);
export const apiUpdateTestimonial  = (id, data)  => req('PUT',    `/testimonials/${id}`, data, true);
export const apiDeleteTestimonial  = (id)        => req('DELETE', `/testimonials/${id}`, null, true);

// ── Methodology ── (pending backend implementation)
export const apiGetMethodology   = ()          => req('GET',    '/methodology');
export const apiCreateStep       = (data)      => req('POST',   '/methodology', data, true);
export const apiUpdateStep       = (id, data)  => req('PUT',    `/methodology/${id}`, data, true);
export const apiDeleteStep       = (id)        => req('DELETE', `/methodology/${id}`, null, true);


// ── Settings ─────────────────────────────────────────────────────────────────
export const apiGetSettings    = ()       => req('GET', '/settings');
export const apiUpdateSettings = (data)   => req('PUT', '/settings', data, true);

// ── File upload ───────────────────────────────────────────────────────────────
// Checked here before anything leaves the browser. The backend must enforce the
// same rules — anyone can call the endpoint directly — but this stops the admin
// from uploading something unsafe by accident.
//
// SVG is refused on purpose: it is an XML document that can carry script, and
// served from the backend's own domain an uploaded SVG opened directly would run
// that script there.
export const UPLOAD_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon'];
export const UPLOAD_MAX_BYTES = 2 * 1024 * 1024;

export const apiUploadFile = async (formData) => {
  for (const [, v] of formData.entries()) {
    if (typeof File !== 'undefined' && v instanceof File) {
      if (!UPLOAD_TYPES.includes(v.type)) throw { message: 'نوع الملف غير مسموح — PNG أو JPG أو WEBP أو GIF أو ICO فقط / File type not allowed' };
      if (v.size > UPLOAD_MAX_BYTES) throw { message: 'حجم الملف أكبر من 2MB / File is larger than 2 MB' };
    }
  }
  const token = getToken();
  if (!token) { toLogin(); throw { message: 'Session expired' }; }
  const { res, json } = await send(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (res.status === 401) { toLogin(); throw json; }
  if (!res.ok) throw failure(res, json);
  touch();
  return json;
};
