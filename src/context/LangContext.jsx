import { createContext, useContext, useState, useEffect } from 'react';

// Synchronous init — sets dir/lang on <html> before React renders to prevent flash
try {
  const _l = localStorage.getItem('lang') || 'ar';
  document.documentElement.lang = _l;
  document.documentElement.dir = _l === 'ar' ? 'rtl' : 'ltr';
} catch { /* no document (SSR/tests) — the language still applies in memory */ }

const LangContext = createContext(null);

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within a LangProvider');
  return ctx;
};
