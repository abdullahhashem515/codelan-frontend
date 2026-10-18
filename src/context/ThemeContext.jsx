import { createContext, useContext, useState, useEffect } from 'react';

// Light / dark mode. That is all this context does now.
//
// It also used to carry a custom-colour system — nine colours per mode, edited
// in Settings → Theme, written into --color-* CSS variables. Nothing on the site
// ever read those variables (every component uses fixed Tailwind colours), so
// the whole Theme tab changed nothing. It has been removed rather than wired in:
// a brand palette is a design decision, not an admin setting.

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
