// src/pages/admin/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';

// After repeated failures the form locks for a while, doubling each time:
// 3 failures → 30 s, then 60 s, 120 s … capped at 15 minutes. It lives in
// sessionStorage so reloading the page does not reset it.
//
// This only slows a person at the keyboard; a script can post to the API
// directly. Real brute-force protection is a rate limit on the backend's
// /login route — this is the courtesy layer in front of it.
const FREE_TRIES = 3;
const BASE_LOCK_MS = 30 * 1000;
const MAX_LOCK_MS = 15 * 60 * 1000;
const LOCK_KEY = 'cl_login_guard';

const readGuard = () => {
  try { return JSON.parse(sessionStorage.getItem(LOCK_KEY)) ?? { fails: 0, until: 0 }; }
  catch { return { fails: 0, until: 0 }; }
};
const writeGuard = (g) => { try { sessionStorage.setItem(LOCK_KEY, JSON.stringify(g)); } catch { /* storage unavailable */ } };
import { motion } from 'framer-motion';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { lang } = useLang();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [lockLeft, setLockLeft] = useState(() => Math.max(0, readGuard().until - Date.now()));
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const expired = params.get('expired') === '1';

  // Count the lock down once a second while it is active.
  useEffect(() => {
    if (lockLeft <= 0) return undefined;
    const t = setInterval(() => setLockLeft(Math.max(0, readGuard().until - Date.now())), 1000);
    return () => clearInterval(t);
  }, [lockLeft > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (readGuard().until > Date.now()) return;
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      writeGuard({ fails: 0, until: 0 });
      navigate('/admin');
    } catch (err) {
      // One message for every rejected attempt. The server's own text used to
      // be shown, and "no such user" versus "wrong password" tells an attacker
      // which email addresses are admin accounts. Only an unreachable server
      // gets a different message, since that is not about the credentials.
      const offline = err?.name === 'AbortError' || err instanceof TypeError || /^HTTP 5/.test(err?.message ?? '');
      if (err?.status === 429) {
        // The server's own limit (5 a minute) — reuse the lock countdown with
        // the wait it asked for, without counting it as a wrong password.
        const until = Date.now() + (err.retryAfter ?? 60) * 1000;
        writeGuard({ ...readGuard(), until });
        setLockLeft(until - Date.now());
      } else if (offline) {
        setError(lang === 'ar' ? 'تعذّر الاتصال بالخادم، حاول بعد قليل.' : 'Could not reach the server — try again shortly.');
      } else {
        const g = readGuard();
        const fails = g.fails + 1;
        const until = fails >= FREE_TRIES
          ? Date.now() + Math.min(MAX_LOCK_MS, BASE_LOCK_MS * 2 ** (fails - FREE_TRIES))
          : 0;
        writeGuard({ fails, until });
        setLockLeft(Math.max(0, until - Date.now()));
        setPassword('');
        setError(lang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'Incorrect email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 ' +
    'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 ' +
    'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all dir-ltr text-left';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050810] flex items-center justify-center p-6 relative overflow-hidden">

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 dark:bg-[#0a0f1e]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#111827] border border-blue-500/20 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <img src="/logo-96.png" alt="" width="40" height="40" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {lang === 'ar' ? 'تسجيل الدخول للإدارة' : 'Admin Login'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            {lang === 'ar' ? 'أدخل بيانات الاعتماد الخاصة بك للمتابعة' : 'Enter your credentials to continue'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {expired && !error && (
            <div className="bg-amber-500/10 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-sm p-3 rounded-lg text-center">
              {lang === 'ar' ? 'انتهت الجلسة لعدم النشاط. سجّل الدخول مجدداً.' : 'Your session expired after inactivity. Please sign in again.'}
            </div>
          )}
          {lockLeft > 0 && (
            <div role="alert" className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg text-center">
              {lang === 'ar'
                ? `محاولات كثيرة. حاول مجدداً بعد ${Math.ceil(lockLeft / 1000)} ثانية.`
                : `Too many attempts. Try again in ${Math.ceil(lockLeft / 1000)} s.`}
            </div>
          )}
          {error && lockLeft <= 0 && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 dark:text-red-400 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-500 dark:text-slate-400 text-sm mb-2">
              {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <input
              type="email"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={254}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputCls}
              placeholder="admin@codelanco.com"
              required
              disabled={loading || lockLeft > 0}
            />
          </div>

          <div>
            <label className="block text-gray-500 dark:text-slate-400 text-sm mb-2">
              {lang === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              maxLength={128}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
              required
              disabled={loading || lockLeft > 0}
            />
          </div>

          <button
            type="submit"
            disabled={loading || lockLeft > 0}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {lang === 'ar' ? 'جاري الدخول...' : 'Signing in...'}
              </>
            ) : (
              lang === 'ar' ? 'دخول النظام' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            {lang === 'ar' ? '← العودة للموقع الرئيسي' : '← Back to main site'}
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
