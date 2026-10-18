import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiLogin, apiLogout } from '../services/api';
import { saveSession, clearSession, getToken, getUser, touch } from '../services/session';

const AuthContext = createContext(null);

// How often to check whether the session has run out while the admin sits on
// a page without making requests.
const CHECK_EVERY_MS = 30 * 1000;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getToken()));
  const [user, setUser] = useState(() => (getToken() ? getUser() : null));

  const login = useCallback(async (email, password) => {
    const res = await apiLogin(email, password);
    saveSession(res.data.token, res.data.user);
    setIsAuthenticated(true);
    setUser(res.data.user);
    return res;
  }, []);

  const logout = useCallback(async () => {
    // Revoke the token on the server first, so a copy of it that leaked is
    // dead too — clearing it here only forgets it in this browser.
    try { await apiLogout(); } catch { /* server unreachable or token already stale — the local sign-out below still happens */ }
    clearSession();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  // Idle timeout: activity keeps the session alive; silence ends it. Activity
  // is recorded at most once every few seconds — a mouse move fires hundreds
  // of events and each would otherwise write to storage.
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let last = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - last > 5000) { last = now; touch(); }
    };
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    events.forEach(e => window.addEventListener(e, onActivity, { passive: true }));

    const timer = setInterval(() => {
      if (!getToken()) {
        // getToken() already cleared the expired session.
        setIsAuthenticated(false);
        setUser(null);
        if (window.location.pathname.startsWith('/admin') && !window.location.pathname.startsWith('/admin/login')) {
          window.location.assign('/admin/login?expired=1');
        }
      }
    }, CHECK_EVERY_MS);

    return () => {
      events.forEach(e => window.removeEventListener(e, onActivity));
      clearInterval(timer);
    };
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
