// Where the admin's API token lives, and for how long.
//
// It used to sit in localStorage indefinitely: it survived closing the browser,
// never expired on this side, and stayed on disk on any shared or lost machine.
// Now:
//
//  • sessionStorage — cleared when the browser (or the tab) closes.
//  • Idle timeout — 30 minutes without activity signs the admin out.
//  • Absolute cap — 8 hours after login, however active, a new login is needed.
//
// None of this stops an attacker who already runs script on the page — any
// script can read sessionStorage too. What closes that is a Content-Security-
// Policy (see vite.config.js) and, ultimately, an httpOnly cookie issued by the
// backend, which script cannot read at all. This limits how long a leaked token
// is useful, and how long it sits around to be leaked.

const TOKEN = 'cl_admin_token';
const USER = 'cl_admin_user';
const STARTED = 'cl_admin_started';
const ACTIVE = 'cl_admin_active';

export const IDLE_LIMIT_MS = 30 * 60 * 1000;
export const SESSION_LIMIT_MS = 8 * 60 * 60 * 1000;

const store = () => {
  try { return window.sessionStorage; } catch { return null; }
};

// Tokens written by earlier versions of the site, in localStorage, are removed
// on first load — they would otherwise stay on disk forever.
try {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
} catch { /* storage unavailable — nothing to clean */ }

export const saveSession = (token, user) => {
  const s = store(); if (!s) return;
  const now = String(Date.now());
  s.setItem(TOKEN, token);
  s.setItem(USER, JSON.stringify(user ?? null));
  s.setItem(STARTED, now);
  s.setItem(ACTIVE, now);
};

export const clearSession = () => {
  const s = store(); if (!s) return;
  [TOKEN, USER, STARTED, ACTIVE].forEach(k => s.removeItem(k));
};

// Returns the token only while the session is still within both limits;
// otherwise clears it and returns null.
export const getToken = () => {
  const s = store(); if (!s) return null;
  const token = s.getItem(TOKEN);
  if (!token) return null;
  const now = Date.now();
  const started = Number(s.getItem(STARTED)) || 0;
  const active = Number(s.getItem(ACTIVE)) || 0;
  if (now - started > SESSION_LIMIT_MS || now - active > IDLE_LIMIT_MS) {
    clearSession();
    return null;
  }
  return token;
};

export const getUser = () => {
  try { return JSON.parse(store()?.getItem(USER) ?? 'null'); } catch { return null; }
};

export const touch = () => {
  const s = store();
  if (s && s.getItem(TOKEN)) s.setItem(ACTIVE, String(Date.now()));
};
