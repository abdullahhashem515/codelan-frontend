const BASE_URL = 'https://back-end.codelanco.com/api';

const getToken = () => localStorage.getItem('auth_token');

function buildHeaders(auth) {
  const h = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

async function req(method, path, body = null, auth = false) {
  const opts = { method, headers: buildHeaders(auth) };
  if (body !== null) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const json = await res.json();
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/admin/login';
    throw json;
  }
  if (!res.ok) throw json;
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
export const apiGetServices   = ()          => req('GET',    '/services');
export const apiCreateService = (data)      => req('POST',   '/services', data, true);
export const apiUpdateService = (id, data)  => req('PUT',    `/services/${id}`, data, true);
export const apiDeleteService = (id)        => req('DELETE', `/services/${id}`, null, true);

// ── Projects ──────────────────────────────────────────────────────────────────
export const apiGetProjects   = ()          => req('GET',    '/projects');
export const apiGetProject    = (id)        => req('GET',    `/projects/${id}`);
export const apiCreateProject = (data)      => req('POST',   '/projects', data, true);
export const apiUpdateProject = (id, data)  => req('PUT',    `/projects/${id}`, data, true);
export const apiDeleteProject = (id)        => req('DELETE', `/projects/${id}`, null, true);

// ── Posts (Articles) ──────────────────────────────────────────────────────────
export const apiGetPosts   = ()          => req('GET',    '/posts');
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

// ── Tech Stack ───────────────────────────────────────────────────────────────
// GET returns nested: [{id, name, name_en, items:[{id,name,icon,color,order}]}]
export const apiGetTechStack        = ()          => req('GET',    '/tech-stack');
// Categories
export const apiCreateTechCategory  = (data)      => req('POST',   '/tech-categories', data, true);
export const apiUpdateTechCategory  = (id, data)  => req('PUT',    `/tech-categories/${id}`, data, true);
export const apiDeleteTechCategory  = (id)        => req('DELETE', `/tech-categories/${id}`, null, true);
// Items  (create needs tech_category_id in body)
export const apiCreateTechItem      = (data)      => req('POST',   '/tech-items', data, true);
export const apiUpdateTechItem      = (id, data)  => req('PUT',    `/tech-items/${id}`, data, true);
export const apiDeleteTechItem      = (id)        => req('DELETE', `/tech-items/${id}`, null, true);

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

// ── FAQ ──────────────────────────────────────────────────────────────────────
export const apiGetFAQ    = ()          => req('GET',    '/faqs');
export const apiCreateFAQ = (data)      => req('POST',   '/faqs', data, true);
export const apiUpdateFAQ = (id, data)  => req('PUT',    `/faqs/${id}`, data, true);
export const apiDeleteFAQ = (id)        => req('DELETE', `/faqs/${id}`, null, true);

// ── Settings ─────────────────────────────────────────────────────────────────
export const apiGetSettings    = ()       => req('GET', '/settings');
export const apiUpdateSettings = (data)   => req('PUT', '/settings', data, true);

// ── File upload ───────────────────────────────────────────────────────────────
export const apiUploadFile = (formData) => {
  const token = getToken();
  return fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  }).then(async res => {
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  });
};

// ── Stats (Hero counters) ── pending backend implementation ───────────────────
export const apiGetStats   = ()          => req('GET',    '/stats');
export const apiCreateStat = (data)      => req('POST',   '/stats', data, true);
export const apiUpdateStat = (id, data)  => req('PUT',    `/stats/${id}`, data, true);
export const apiDeleteStat = (id)        => req('DELETE', `/stats/${id}`, null, true);
